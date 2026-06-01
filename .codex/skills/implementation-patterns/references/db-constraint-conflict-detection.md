# Race-Free Duplicate Detection with DB Constraints

## The Problem

A common mistake when preventing duplicates (e.g. "user can only have one active export at a time"):

```csharp
// WRONG — races under concurrent requests
if (await _repo.HasActiveExport(userId, typeId))
    throw new DuplicateExportException();

await _repo.CreateExport(userId, typeId);
await _unitOfWork.Commit(ct);
```

Between the `HasActiveExport` check and the `CreateExport` insert, another request can slip through.
Both pass the check and both create an export. Pre-check queries always race.

## The Pattern: Unique Filtered Index + CommitResult

Let the database enforce the constraint atomically. Handle the violation in BLL.

Three steps:

1. **DB constraint** — unique filtered index on the columns that define "active duplicate".
2. **No pre-check** — just insert directly; let the DB reject the duplicate.
3. **BLL handles `CommitResult`** — intercept the constraint violation and throw a domain exception.

## Database: Unique Filtered Index

```sql
CREATE UNIQUE INDEX uix_export_session_active
    ON export_session (created_by_id, type_id)
    WHERE status IN ('Pending', 'Exporting');
```

Only one row per `(created_by_id, type_id)` can exist while `status` is `Pending` or `Exporting`.
Completed/failed exports are outside the filter and don't block new ones.

## BLL: Insert + Handle Violation

```csharp
public async Task<ExportSession> CreateExport(
    long userId,
    ExportTypeId typeId,
    JsonDocument filter,
    CancellationToken ct)
{
    var session = new ExportSession
    {
        CreatedById = userId,
        TypeId = typeId,
        Filter = filter,
        Status = ExportSessionStatus.Pending,
    };

    _repository.Add(session);

    var result = await _unitOfWork.CommitResult(ct);

    if (result is CommitResult.ConstraintViolation { Type: ConstraintViolationType.Unique })
    {
        _logger.LogWarning(
            "Duplicate active export. UserId={UserId} TypeId={TypeId}", userId, typeId);
        throw new DuplicateExportException(userId, typeId);
    }

    result.EnsureSuccess(); // rethrow unexpected errors

    return session;
}
```

## CommitResult Contract

`IUnitOfWork.CommitResult` wraps `SaveChangesAsync` and catches `DbUpdateException`, inspecting
the inner Npgsql/PostgreSQL exception for constraint type:

```csharp
public interface IUnitOfWork
{
    Task Commit(CancellationToken ct);
    Task<CommitResult> CommitResult(CancellationToken ct);
}

public abstract record CommitResult
{
    public record Success : CommitResult;
    public record ConstraintViolation(ConstraintViolationType Type) : CommitResult;
    public record UnexpectedError(Exception Exception) : CommitResult;

    public void EnsureSuccess()
    {
        if (this is UnexpectedError e) throw e.Exception;
    }
}
```

## Domain Exception

```csharp
public class DuplicateExportException : BllException
{
    public DuplicateExportException(long userId, ExportTypeId typeId)
        : base($"Active export already exists. UserId={userId} TypeId={typeId}")
    {
    }
}
```

Map to HTTP 409 Conflict (or gRPC `ALREADY_EXISTS`) at the transport edge.

## When to Use

- Preventing duplicate active records of any kind: active sessions, active subscriptions,
  pending jobs per user, unique reservations
- Any time you catch yourself writing `HasActive...()` checks before inserts
- High-concurrency scenarios where the pre-check window matters

## When NOT to Use

- Low-concurrency internal tools where a pre-check is simpler and races are acceptable
- When the uniqueness rule is too complex for a DB index (multi-table, computed columns, etc.)

## Key Points

- The unique filtered index is the source of truth — not application logic
- `CommitResult` decouples DB exception handling from EF's generic `DbUpdateException`
- Log the user/type before throwing — constraint violations are observable business events
- `EnsureSuccess()` re-throws unexpected errors so they're not silently swallowed
