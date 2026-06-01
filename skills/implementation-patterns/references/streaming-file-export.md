# Streaming File Export Without MemoryStream

## The Problem

A naive export pipeline loads all records into memory and buffers the file:

```csharp
// WRONG — materializes everything in memory
var records = await _repo.GetAll(filter, ct).ToListAsync(ct);
var bytes = _writer.Write(records);
await _storage.Upload(new MemoryStream(bytes), objectKey, ct);
```

For large datasets this causes OOM kills, GC pressure, and long GC pauses. The file is fully
buffered before upload begins, so the total memory usage peaks at `records_size + file_size`.

## The Pattern: Temp File + Streaming Upload

Stream records directly to a temp file. Then stream the temp file to storage. Peak memory stays
near zero regardless of export size.

```txt
IAsyncEnumerable<record> → IReportWriter → temp file → Stream → S3 upload
```

## Core Flow

```csharp
public async Task<ExportOutput?> Execute(
    JsonDocument filterJson,
    CancellationToken ct)
{
    var filter = JsonSerializer.Deserialize<ExportFilter>(filterJson);

    var records = _repository.GetRecords(filter, ct); // IAsyncEnumerable<T>

    var tempPath = Path.GetTempFileName();
    try
    {
        var count = await _writer.Write(records, tempPath, ct);

        if (count == 0)
        {
            return null; // caller marks as exported/empty, no upload
        }

        return new ExportOutput(tempPath, FileName: $"export-{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }
    catch
    {
        File.Delete(tempPath); // clean up on failure path
        throw;
    }
}
```

The `ExportOutput` holds the temp file path; the upload step opens it separately.

## Writer Contract

```csharp
public interface IReportWriter
{
    string FileExtension { get; }

    /// <summary>
    /// Streams <paramref name="records"/> to <paramref name="outputPath"/>.
    /// Returns the number of records written. Returns 0 if the sequence is empty
    /// (no file content is produced, do not upload).
    /// </summary>
    Task<int> Write(IAsyncEnumerable<object> records, string outputPath, CancellationToken ct);
}
```

Implementation must:

- Open `outputPath` for write
- Consume `records` with `await foreach (var r in records.WithCancellation(ct))`
- Write header from the first record's type (reflection or pre-registered schema)
- Return record count
- Not buffer all records in memory

## Upload Step

```csharp
public async Task<string> Upload(
    IStorageManager storage,
    string bucket,
    CancellationToken ct)
{
    var objectKey = $"exports/{_sessionId}{_writer.FileExtension}";

    await using var stream = File.OpenRead(_tempPath);
    await storage.Upload(stream, bucket, objectKey, ct);

    File.Delete(_tempPath); // clean up after successful upload

    return objectKey;
}
```

The storage manager only receives a `Stream` — it doesn't know record types or file format.

## Temp File Cleanup

Always delete the temp file, even on failure:

```csharp
// In the caller (export worker):
try
{
    var output = await adapter.Execute(filterJson, ct);
    if (output is null)
    {
        await MarkExportedEmpty(session, ct);
        return;
    }
    var objectKey = await output.Upload(_storage, session.Bucket, ct);
    await MarkExported(session, objectKey, output.FileName, ct);
}
catch
{
    output?.DeleteTempFile(); // safe delete if upload failed
    throw;
}
```

Or keep cleanup inside `ExportOutput.Upload()` in a `finally` block — just don't leave temp
files on disk.

## CancellationToken Rules

- Pass `CancellationToken` to `IAsyncEnumerable` sources: `_repo.GetRecords(filter, ct)`
- Propagate through async streams: `await foreach (var r in records.WithCancellation(ct))`
- Pass `ct` to storage upload calls
- Do **not** add `ct.ThrowIfCancellationRequested()` before synchronous operations (writing a
  row to the file) — that's decorative and adds no value
- If a method signature has `CancellationToken ct` but the method no longer calls anything that
  accepts a token, remove the parameter

## When to Use

- Any export of more than ~1000 rows to a file (CSV, Excel, etc.)
- When memory is constrained or export sizes are unbounded
- When uploads go directly to S3/blob storage that accepts a `Stream`

## When NOT to Use

- Small exports (< a few hundred rows) where simplicity matters more
- When the storage SDK requires a seekable stream and you can't provide one from a temp file
  (use `MemoryStream` explicitly, but document the size bound)
