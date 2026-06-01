---
description: "Dynamic routing logic for Team Lead agent. Describes each subagent's role, inputs/outputs, dual-mode default policy, and heuristics to decide which agents are needed for a given task."
name: pm-routing
---



## 1. Core Principles

- Every stage is driven by artifacts. Agents consume and produce named `.ai/` files.
- Planning stages default to dual-model. Single-model is the exception.
- Chain state is tracked explicitly. No stage runs without its prerequisites.
- Skip stages that add no value. Do not force the full pipeline.

---

## 2. Planning Mode Policy

**Single authoritative source for dual-mode behavior.**

| Stage         | Default                 | Single-model fallback |
| ------------- | ----------------------- | --------------------- |
| Specification | `spec-driven-dual`      | `spec-driven`         |
| Architecture  | `system-architect-dual` | `system-architect`    |

**Single-model allowed only when:**

1. User explicitly requests a single model/agent by name, OR
2. Change is minor: ≤1 file, no new `.ai/` artifact, no ADR, no planning ambiguity.

**Mode lock**: Selected once at chain start and persisted to `.ai/chain-state.md`. If the user changes preference mid-run, finish the in-flight stage, then apply the new mode to subsequent stages and update `.ai/chain-state.md`.

**Degraded mode**: One branch fails → continue with successful branch. Document branch failure in compare artifact and final report.

**Total failure**: Both branches fail → halt chain, surface failure to user, request explicit instruction (retry / switch to single-model / abort).

---

## 3. Chain State

Chain state is **persisted to `.ai/chain-state.md`** so it survives across turns and session restarts.

`.ai/chain-state.md` format:

```
Stage:     Discovery | Research | Planning | Approval | Execution | Validation | Complete
Mode:      dual | single
Artifacts: list of produced .ai/ files
Blockers:  list of unresolved issues
```

**State protocol:**

- On chain start: create `.ai/chain-state.md` with the selected `Stage`, locked `Mode`, and empty `Artifacts`/`Blockers`.
- After each stage completes: update `Stage`, append produced artifacts, and record/clear blockers.
- On resume: read `.ai/chain-state.md` first to recover `Stage`, `Mode`, and outstanding `Blockers`.

**Stage gate rules:**

- `Planning` requires `Discovery` and `Research` complete (if triggered).
- `Approval` requires spec status `[FINAL]`.
- `Execution` requires `Approval` complete (if spec ran).
- `Validation` requires all `Execution` tasks complete.
- `Complete` requires no unresolved Critical issues.

---

## 4. Routing Engine

**First: check §11 Example Chains for an exact match and use that chain.**
**Otherwise: apply stages in sequence below.**

```txt
Stage 1 — Discovery (run if needed; code-explorer and research-agent may run in parallel)
  → code-explorer    when: codebase context is missing or scope is unclear
  → research-agent   when: external uncertainty exists (library choice, CVE, unknown API)

Stage 2 — Planning (sequential within; each step requires previous to be complete)
  → spec-driven-dual      when: requirements are vague or ambiguous
  → system-architect-dual when: architectural decisions required

Stage 3 — Execution
  → backend-developer [parallel task batches per §7]

Stage 4 — Validation
  → code-reviewer (single or parallel per §8)
```

**Discovery gating (mandatory):**

- Skip Discovery entirely when target files/symbols are explicitly known and no external uncertainty exists.
- Do not run `codebase-indexer` if `AGENTS.md` is present and clearly relevant to the current task scope.
- Use `code-explorer` as the default local discovery tool; use `codebase-indexer` only for baseline refresh.
- Never run broad repository search after `code-explorer` already identified owner flow and 2-4 key files unless a blocker remains.

---

## 5. Agent Catalog

### `code-explorer`
- **Role**: Read-only codebase discovery.
- **Output**: File paths, flow summary (in-memory; not persisted to `.ai/`).

### `research-agent`
- **Role**: Technical research specialist. Queries Context7 MCP and web.
- **Output**: `.ai/research.md`

### `spec-driven`
- **Role**: Translates requirements into structured specifications.
- **Output**: `.ai/spec.md` with status `[FINAL]`.

### `spec-driven-dual`
- **Role**: Runs `spec-driven-gpt` and `spec-driven-sonnet` in parallel, scores both, synthesizes canonical output.
- **Output**: `.ai/spec.gpt.md`, `.ai/spec.sonnet.md`, `.ai/spec.compare.md`, `.ai/spec.md`

### `system-architect`
- **Role**: Produces architectural decisions and developer-ready task breakdown.
- **Output**: `.ai/adr.md` + `.ai/tasks.md`

### `system-architect-dual`
- **Role**: Runs `system-architect-gpt` and `system-architect-sonnet` in parallel.
- **Output**: `.ai/adr.gpt.md`, `.ai/tasks.gpt.md`, `.ai/adr.sonnet.md`, `.ai/tasks.sonnet.md`, `.ai/arch.compare.md`, `.ai/adr.md`, `.ai/tasks.md`

### `backend-developer`
- **Role**: Implements code.
- **Output**: Working source code and tests.

### `code-reviewer`
- **Role**: Reviews code changes for production readiness.
- **Timing**: Runs **once, after the full implementation phase is complete**.

---

## 6. Artifact Model

| Agent                   | Produces                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `code-explorer`         | File paths + flow summary (in-memory; not persisted)                                                                                  |
| `research-agent`        | `.ai/research.md`                                                                                                                     |
| `spec-driven-dual`      | `.ai/spec.gpt.md`, `.ai/spec.sonnet.md`, `.ai/spec.compare.md`, `.ai/spec.md`                                                         |
| `system-architect-dual` | `.ai/adr.gpt.md`, `.ai/tasks.gpt.md`, `.ai/adr.sonnet.md`, `.ai/tasks.sonnet.md`, `.ai/arch.compare.md`, `.ai/adr.md`, `.ai/tasks.md` |
| `backend-developer`     | Source code + tests                                                                                                                   |
| `code-reviewer`         | Review report + test results                                                                                                          |

---

## 7. Parallelism Rules

**`backend-developer` task batching algorithm:**

1. Read all tasks in `.ai/tasks.md`; build dependency graph from each task's `Dependencies` field.
2. Find first batch: all tasks with every dependency already met.
3. Verify no two tasks in the batch modify the same file. Serialize any conflicting pairs.
4. Launch the verified batch as parallel Task calls in a single response.
5. After the batch completes, find the next unblocked batch. Repeat until all tasks are done.

---

## 8. Review Rules

After all 3 focused reviews complete:

1. **Deduplicate**: Merge semantically identical findings.
2. **Severity escalation**: Use the highest severity if same issue appears at different levels.
3. **Rank**: Critical → Important → Minor.
4. **Single verdict**: Approve / Approve with Conditions / Request Changes.

### Dual Compare Rules

1. Score each candidate across 6 dimensions: requirements coverage, completeness, clarity, trade-off analysis, risk identification, actionability — equally weighted.
2. Score gap ≥ 10 percentage points → pick winner wholesale.
3. Score gap < 10 percentage points → section-level hybrid merge.

---

## 9. Failure Handling

| Failure                         | Action                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------- |
| One dual branch fails           | Degraded mode: continue with successful branch; document in compare artifact |
| Both dual branches fail         | Halt; surface to user; request: retry / switch to single-model / abort       |
| Research low confidence / error | Halt; surface to user; request guidance before continuing                    |
| Remediation loop exceeds 3      | Escalate unresolved Critical issues to user; do not auto-continue            |
| Spec not `[FINAL]`              | Block `system-architect` and `backend-developer`; re-run `spec-driven-dual`  |

---

## 10. Example Chains

### Discovery & research only

| Task                               | Chain                      |
| ---------------------------------- | -------------------------- |
| Codebase discovery / "where is X?" | `code-explorer`            |
| Best library / approach for X?     | `research-agent`           |

### Implementation — no spec or arch needed

| Task                                      | Chain                                                                                  |
| ----------------------------------------- | -------------------------------------------------------------------------------------- |
| Bug fix, clear reproduction, low risk     | `backend-developer` → `code-reviewer` (single)                                         |
| Refactor existing logic                   | `backend-developer` [all tasks] → `code-reviewer` (parallel)                           |
| Major version migration                   | `research-agent` → `backend-developer` [all tasks] → `code-reviewer` (parallel)        |

### Full pipeline

**Vague feature request / large feature from scratch**

```txt
spec-driven-dual
  → system-architect-dual
  → backend-developer [all tasks]
  → code-reviewer (parallel)
```

**Library comparison + vague feature**

```txt
research-agent + code-explorer (parallel)
  → spec-driven-dual
  → system-architect-dual
  → backend-developer [all tasks]
  → code-reviewer (parallel)
```
