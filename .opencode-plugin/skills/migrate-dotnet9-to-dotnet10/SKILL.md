---
description: "Migrate a .NET 9 project or solution to .NET 10 and resolve all breaking changes. USE FOR: upgrading TargetFramework from net9.0 to net10.0, fixing build errors after updating the .NET 10 SDK, resolving .NET 10 / C# 14 / ASP.NET Core 10 / EF Core 10 breaking changes, SDK/NuGet and container changes, new obsoletion warnings, and common migrations such as System.Linq.Async to AsyncEnumerable. Prefer project diagnostics/build checks and project test checks for verification; use shell restore/build/test only when the user explicitly requests raw CLI output or structured tooling fails twice with the same infrastructure error. DO NOT USE FOR: .NET Framework migrations, upgrading from .NET 8 or earlier (use migrate-dotnet8-to-dotnet9 first), greenfield .NET 10 projects, or cosmetic modernization. LOADS REFERENCES: csharp-compiler, core-libraries, sdk-msbuild (always); aspnet-core, efcore, cryptography, extensions-hosting, serialization-networking, winforms-wpf, containers-interop (selective).\n"
name: migrate-dotnet9-to-dotnet10
---


# .NET 9 → .NET 10 Migration

Migrate a .NET 9 project or solution to .NET 10, systematically resolving all breaking changes. The outcome is a project targeting `net10.0` that builds cleanly, passes tests, and accounts for every behavioral, source-incompatible, and binary-incompatible change introduced in the .NET 10 release.

## When to Use

- Upgrading `TargetFramework` from `net9.0` to `net10.0`
- Resolving build errors or new warnings after updating the .NET 10 SDK
- Adapting to behavioral changes in .NET 10 runtime, ASP.NET Core 10, or EF Core 10
- Updating CI/CD pipelines, Dockerfiles, or deployment scripts for .NET 10
- Migrating from the community `System.Linq.Async` package to the built-in `System.Linq.AsyncEnumerable`

## When Not to Use

- The project already targets `net10.0` and builds cleanly — migration is done
- Upgrading from .NET 8 or earlier — use the `migrate-dotnet8-to-dotnet9` skill first to reach `net9.0`, then return to this skill for the `net9.0` → `net10.0` migration
- Migrating from .NET Framework — that is a separate, larger effort
- Greenfield projects that start on .NET 10 (no migration needed)

## Workflow

> **Answer directly from the loaded reference documents.** Do not search the filesystem or fetch web pages for breaking change information — the references contain the authoritative details. Focus on identifying which breaking changes apply and providing concrete fixes.

### Step 1: Assess the project

1. Identify how the project is built and tested.
2. Run `dotnet --version` to confirm the .NET 10 SDK is installed. If not, stop.
3. Determine which technology areas the project uses by examining SDK attribute and PackageReferences.
4. Run project diagnostics/build checks on the current `net9.0` target to establish a baseline.

### Step 2: Update the Target Framework

1. In each `.csproj`, change `<TargetFramework>net9.0</TargetFramework>` to `<TargetFramework>net10.0</TargetFramework>`.
2. Update all `Microsoft.Extensions.*`, `Microsoft.AspNetCore.*`, `Microsoft.EntityFrameworkCore.*` packages to 10.0.x.
3. Run project diagnostics/build checks after updates.

### Step 3: Resolve build errors and source-incompatible changes

Load reference documents based on project type:

| If the project uses… | Load reference |
|-----------------------|----------------|
| Any .NET 10 project | `references/csharp-compiler-dotnet9to10.md` |
| Any .NET 10 project | `references/core-libraries-dotnet9to10.md` |
| Any .NET 10 project | `references/sdk-msbuild-dotnet9to10.md` |
| ASP.NET Core | `references/aspnet-core-dotnet9to10.md` |
| Entity Framework Core | `references/efcore-dotnet9to10.md` |
| Cryptography APIs | `references/cryptography-dotnet9to10.md` |
| Microsoft.Extensions.Hosting, BackgroundService | `references/extensions-hosting-dotnet9to10.md` |
| System.Text.Json, XmlSerializer, HttpClient | `references/serialization-networking-dotnet9to10.md` |
| Windows Forms or WPF | `references/winforms-wpf-dotnet9to10.md` |
| Docker containers, single-file apps, native interop | `references/containers-interop-dotnet9to10.md` |

**Key changes to address:**

1. **`System.Linq.Async` conflicts** — Remove or upgrade to v7.0.0. Rename `SelectAwait` → `Select` where needed.
2. **New obsoletion warnings (SYSLIB0058–SYSLIB0062)** — see reference docs.
3. **C# 14 `field` keyword** — local variables named `field` in property accessors cause CS9272.
4. **C# 14 `extension` contextual keyword** — types named `extension` must be renamed or escaped.
5. **ASP.NET Core obsoletions** — `WebHostBuilder`, `IWebHost` obsolete; `Microsoft.OpenApi` v2.x breaking changes.
6. **EF Core changes** — `ExecuteUpdateAsync` accepts regular lambda; parameterized collections behavior change.

### Step 4: Address behavioral changes

Review high-impact behavioral changes:

1. **SIGTERM signal handling removed** — Console apps must register `PosixSignalRegistration` explicitly.
2. **BackgroundService.ExecuteAsync** runs entirely on background thread; sync before first `await` no longer blocks startup.
3. **Configuration null values preserved** — JSON `null` no longer converted to empty strings.
4. **Microsoft.Data.Sqlite DateTimeOffset changes** — `GetDateTimeOffset` without offset now assumes UTC.
5. **EF Core parameterized collections** — `.Contains()` now uses multiple scalar parameters.

### Step 5: Update infrastructure

1. **Dockerfiles** — Update base images to `sdk:10.0` and `aspnet:10.0`.
2. **CI/CD** — Update `global.json` SDK version to `10.0.100`.
3. **Environment variables** — `DOTNET_OPENSSL_VERSION_OVERRIDE` replaces old name.

### Step 6: Verify

1. Run project diagnostics/build checks.
2. Run one broader project test pass.
3. If containerized, build and test the container image.
4. Security review — verify TLS cipher validation, serialization of sensitive properties, input length validation, auth failure telemetry.
