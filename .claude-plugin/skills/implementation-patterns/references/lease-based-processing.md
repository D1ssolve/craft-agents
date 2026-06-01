# Lease-Based Background Processing

## The Problem

Background workers that claim tasks from a DB and process them have a fundamental gap:

```txt
Claim task → set status = "Processing" → do long work → set status = "Done"
```

If the process dies, DB goes down, or pod gets killed between "Processing" and "Done", the task
is stuck forever. No other worker will pick it up (it's already "Processing"). The user can't
retry (there's an "active" check). The system rots.

Long transactions don't fix this — they hold DB connections and row locks for minutes, and
external operations (S3 uploads, HTTP calls) can't participate in DB transactions anyway.

## The Pattern: Lease + Heartbeat + Guarded Finalize

Instead of a permanent status change, treat "Processing" as a **time-limited lease** that the
worker must renew. If the worker dies, the lease expires and another worker can reclaim the task.

Three pillars:

1. **Claim with lease** — `FOR UPDATE SKIP LOCKED` for atomic claim, then set `LockToken`,
   `LockedUntil`, `Attempts++`, commit immediately.
2. **Heartbeat** — background task renews `LockedUntil` every N seconds while work is in progress.
3. **Guarded finalize** — `MarkExported`/`MarkFailed` only succeed if `LockToken` matches and
   `LockedUntil` hasn't expired. Prevents zombie workers from overwriting results.

## When to Use

- Any background worker that claims tasks from a DB table
- Export/import jobs, report generation, file processing
- Any "Pending → Processing → Done" state machine where Processing can take minutes
- When pod kills, DB outages, or OOM kills are possible (they always are)
- When duplicate processing must be prevented

## When NOT to Use

- Sub-second tasks — just use a transaction
- Tasks that are naturally idempotent and cheap to re-run — simpler retry logic may suffice
- When you have a proper message broker (RabbitMQ, Kafka) with DLQ and redelivery — use that instead

## Conceptual Flow

```
Worker A                              Worker B (after A dies)
────────                              ─────────────────────────
ClaimNextSession()
  FOR UPDATE SKIP LOCKED
  WHERE status = 'Pending'
     OR (status = 'Exporting'
         AND locked_until < now())
  → sets LockToken, LockedUntil
  → commits

Start heartbeat (every 30s)
  RenewLock(id, token, now + 2min)
  → if rows=0: LOCK LOST, cancel work

Execute adapter / Upload to S3
  (uses workCts.Token — cancelled on lock loss)

MarkExported(id, token, objectKey, ...)
  WHERE lock_token = @token
  → if rows=0: lock was lost, cannot finalize

[if Worker A dies here]
  heartbeat stops
  LockedUntil expires
                                      ClaimNextSession()
                                        finds stale session
                                        new LockToken, new LockedUntil
                                        → reprocesses
```

## Database Schema

Add to your task/session table:

```sql
ALTER TABLE export_session
    ADD COLUMN lock_token UUID NULL,
    ADD COLUMN locked_until TIMESTAMPTZ NULL,
    ADD COLUMN attempts INT NOT NULL DEFAULT 0;
```

- `lock_token` — unique per claim attempt. Prevents zombie workers from finalizing.
- `locked_until` — lease expiration. Other workers can reclaim after this timestamp.
- `attempts` — retry counter. Cap at max attempts to prevent infinite loops.

## C# Model

```csharp
public class Session : BaseEntity
{
    public SessionStatus Status { get; set; }

    public Guid? LockToken { get; set; }

    public DateTimeOffset? LockedUntil { get; set; }

    public int Attempts { get; set; }

    // ... other fields
}
```

## Repository: Claim

```csharp
public Task<Session?> GetForExport(DateTimeOffset now) => Set
    .ForUpdate()
    .SkipLocked()
    .FirstOrDefaultAsync(s =>
        s.Status == SessionStatus.Pending ||
        (s.Status == SessionStatus.Exporting && s.LockedUntil < now));
```

`FOR UPDATE SKIP LOCKED` ensures only one worker claims a row at a time. The `OR` clause
reclaims stale sessions whose lease has expired.

## Repository: Renew Lock

```csharp
public async Task<bool> RenewLock(
    long sessionId,
    Guid lockToken,
    DateTimeOffset lockedUntil,
    CancellationToken ct)
{
    var now = DateTimeOffset.UtcNow;

    var rows = await Set
        .Where(s =>
            s.Id == sessionId &&
            s.Status == SessionStatus.Exporting &&
            s.LockToken == lockToken &&
            s.LockedUntil > now)
        .ExecuteUpdateAsync(update => update
            .SetProperty(s => s.LockedUntil, lockedUntil), ct);

    return rows == 1;
}
```

Returns `false` if:

- Another worker reclaimed the session (different `LockToken`)
- The session was already finalized (`Status != Exporting`)
- The lease already expired (`LockedUntil < now`)

## Repository: Guarded Finalize

```csharp
public async Task<bool> MarkExported(
    long sessionId,
    Guid lockToken,
    string? objectKey,
    string? fileName,
    CancellationToken ct)
{
    var now = DateTimeOffset.UtcNow;

    var rows = await Set
        .Where(s =>
            s.Id == sessionId &&
            s.Status == SessionStatus.Exporting &&
            s.LockToken == lockToken &&
            s.LockedUntil > now)
        .ExecuteUpdateAsync(update => update
            .SetProperty(s => s.Status, SessionStatus.Exported)
            .SetProperty(s => s.ObjectKey, objectKey)
            .SetProperty(s => s.FileName, fileName)
            .SetProperty(s => s.LockedUntil, (DateTimeOffset?)null)
            .SetProperty(s => s.LockToken, (Guid?)null), ct);

    return rows == 1;
}
```

Clears `LockToken` and `LockedUntil` on success — the session is no longer leased, it's done.

Returns `false` if the worker lost the lease. In that case, **do not retry** — another worker
already owns this task.

## Repository: Mark Failed

```csharp
public async Task<bool> MarkFailed(
    long sessionId,
    Guid lockToken,
    string errorMessage,
    CancellationToken ct)
{
    var now = DateTimeOffset.UtcNow;

    var rows = await Set
        .Where(s =>
            s.Id == sessionId &&
            s.Status == SessionStatus.Exporting &&
            s.LockToken == lockToken &&
            s.LockedUntil > now)
        .ExecuteUpdateAsync(update => update
            .SetProperty(s => s.Status, SessionStatus.Error)
            .SetProperty(s => s.ErrorMessage, errorMessage)
            .SetProperty(s => s.LockedUntil, (DateTimeOffset?)null)
            .SetProperty(s => s.LockToken, (Guid?)null), ct);

    return rows == 1;
}
```

## Worker: Claim with Lease

```csharp
private static readonly TimeSpan LeaseTtl = TimeSpan.FromMinutes(2);

private async Task<Session?> ClaimNextSession(CancellationToken ct)
{
    Session? session = null;

    await _unitOfWork.Transaction(async () =>
    {
        var now = DateTimeOffset.UtcNow;

        session = await _sessionRepository.GetForExport(now);
        if (session is null)
        {
            return;
        }

        session.Status = SessionStatus.Exporting;
        session.LockToken = Guid.NewGuid();
        session.LockedUntil = now.Add(LeaseTtl);
        session.Attempts++;

        await _unitOfWork.Commit(ct);
    });

    return session;
}
```

Key points:

- `FOR UPDATE SKIP LOCKED` is inside the transaction — row is locked during claim.
- After commit, the DB row lock is released. The lease (`LockedUntil`) protects the session
  during long processing.
- `LockToken` is generated per claim attempt, not per session.

## Worker: Heartbeat

```csharp
private async Task RunHeartbeat(
    Session session,
    CancellationTokenSource workCts,
    CancellationToken heartbeatCt)
{
    using var timer = new PeriodicTimer(TimeSpan.FromSeconds(30));

    while (await timer.WaitForNextTickAsync(heartbeatCt))
    {
        var now = DateTimeOffset.UtcNow;

        var renewed = await _sessionRepository.RenewLock(
            session.Id,
            session.LockToken!.Value,
            now.Add(LeaseTtl),
            heartbeatCt);

        if (renewed)
        {
            continue;
        }

        // Lock was lost — cancel the work so it stops ASAP.
        workCts.Cancel();
        throw new InvalidOperationException(
            $"Export session lock was lost. SessionId={session.Id}");
    }
}
```

The heartbeat uses its own `CancellationToken` (`heartbeatCt`) so it can be stopped independently
of the work cancellation. When the heartbeat detects lock loss, it cancels `workCts` to signal
the main work loop to stop.

## Worker: Full Export Flow

```csharp
public async Task Export(CancellationToken cancellationToken = default)
{
    var session = await ClaimNextSession(cancellationToken);
    if (session is null)
    {
        return;
    }

    using var workCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
    using var heartbeatCts = new CancellationTokenSource();

    var heartbeatTask = RunHeartbeat(session, workCts, heartbeatCts.Token);

    try
    {
        var adapter = _pluginResolver.Resolve(session.TypeId);

        var output = await adapter.Execute(session.FilterJson, workCts.Token);

        if (output is null)
        {
            await MarkExported(session, null, null, workCts.Token);
            return;
        }

        var objectKey = await output.Upload(
            _storageManager, session.Bucket, workCts.Token);

        await MarkExported(session, objectKey, output.FileName, workCts.Token);
    }
    catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
    {
        // Lock was lost (heartbeat cancelled workCts).
        // Do NOT MarkFailed — another worker owns this session now.
        _logger.LogWarning("Export session lock lost. SessionId={SessionId}", session.Id);
    }
    catch (Exception e)
    {
        await MarkFailed(session, e);
    }
    finally
    {
        heartbeatCts.Cancel();

        try
        {
            await heartbeatTask;
        }
        catch (OperationCanceledException)
        {
            // Normal heartbeat stop.
        }
    }
}
```

The `OperationCanceledException` filter distinguishes between:

- **External cancellation** (`cancellationToken.IsCancellationRequested`) — graceful shutdown,
  the session should be marked as failed/cancelled.
- **Lock loss** (`!cancellationToken.IsCancellationRequested`) — another worker owns the session,
  do not touch it.

## Idempotency: Stable Object Keys

When a session is retried, the export runs again. If the object key is random (`Guid.NewGuid()`),
each retry creates a new orphan file in S3.

Use a deterministic key based on session ID:

```csharp
var objectKey = $"{entityPrefix}/{session.Id}{_reportWriter.FileExtension}";
```

This way, retries overwrite the same object. No orphan cleanup needed.

If you need versioning or immutability, use attempt number:

```csharp
var objectKey = $"{entityPrefix}/{session.Id}/attempt-{session.Attempts}{ext}";
```

## Max Attempts Guard

Without a cap, a permanently broken session will be retried forever:

```csharp
public Task<Session?> GetForExport(DateTimeOffset now) => Set
    .ForUpdate()
    .SkipLocked()
    .FirstOrDefaultAsync(s =>
        s.Status == SessionStatus.Pending ||
        (s.Status == SessionStatus.Exporting
            && s.LockedUntil < now
            && s.Attempts < MaxAttempts));
```

When `Attempts >= MaxAttempts`, the session stays in `Exporting` forever and won't be reclaimed.
Consider a separate cleanup job that marks such sessions as `Error`:

```csharp
public async Task MarkStaleAsFailed(DateTimeOffset cutoff, CancellationToken ct)
{
    await Set
        .Where(s =>
            s.Status == SessionStatus.Exporting &&
            s.Attempts >= MaxAttempts &&
            s.LockedUntil < cutoff)
        .ExecuteUpdateAsync(update => update
            .SetProperty(s => s.Status, SessionStatus.Error)
            .SetProperty(s => s.ErrorMessage, "Max export attempts exceeded")
            .SetProperty(s => s.LockedUntil, (DateTimeOffset?)null)
            .SetProperty(s => s.LockToken, (Guid?)null), ct);
}
```

## Tuning Parameters

| Parameter          | Recommended | Trade-off                                                               |
| ------------------ | ----------- | ----------------------------------------------------------------------- |
| `LeaseTtl`         | 2–5 minutes | Shorter = faster stale recovery. Longer = more heartbeat resilience.    |
| Heartbeat interval | 30 seconds  | Should be much less than `LeaseTtl`. 1/4 of `LeaseTtl` is a good ratio. |
| `MaxAttempts`      | 3–5         | Depends on how often transient failures occur.                          |

## Common Mistakes

1. **Using tracked entities for finalize** — `session.Status = Exported; _context.SaveChanges()` will
   overwrite even if another worker already claimed the session. Always use guarded
   `ExecuteUpdateAsync` with `LockToken` check.

2. **Not cancelling work on lock loss** — if the heartbeat detects lock loss but the main work
   continues, you get duplicate S3 uploads and race conditions. Use linked `CancellationTokenSource`.

3. **Setting `LockedUntil` to expected task duration** — you can't predict how long an export takes.
   Use short lease + heartbeat renewal instead.

4. **Forgetting to stop heartbeat** — always `heartbeatCts.Cancel()` + `await heartbeatTask` in
   a `finally` block. Otherwise the heartbeat timer leaks.

5. **MarkFailed on lock loss** — if you lost the lock, another worker owns the session. Don't
   touch it. Only `MarkFailed` when you still hold the lock.

6. **Not handling `OperationCanceledException` from heartbeat** — the heartbeat's
   `workCts.Cancel()` throws `OperationCanceledException` in the main work. You must distinguish
   this from external cancellation.

## Minimal Implementation Checklist

- [ ] Add `LockToken`, `LockedUntil`, `Attempts` columns to task table
- [ ] Update claim query: `Pending OR (Exporting AND LockedUntil < now AND Attempts < max)`
- [ ] Generate `LockToken` on claim, set `LockedUntil = now + LeaseTtl`
- [ ] Implement `RenewLock` with guarded update (check `LockToken` + `LockedUntil > now`)
- [ ] Implement `MarkExported` / `MarkFailed` with guarded update (check `LockToken`)
- [ ] Add heartbeat `PeriodicTimer` alongside main work
- [ ] Link heartbeat cancellation to work cancellation (`CancellationTokenSource.CreateLinkedTokenSource`)
- [ ] Cancel work on lock loss, don't finalize
- [ ] Use deterministic S3 object keys for idempotency
- [ ] Add max-attempts guard and stale session cleanup
