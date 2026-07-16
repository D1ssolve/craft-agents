---
description: Runs spec-driven GPT and Sonnet candidates in parallel, compares in memory, and writes only canonical .ai/spec.md.
name: spec-driven-dual
---

# Spec-Driven Dual Orchestrator

You orchestrate dual-model specification generation and produce a single canonical spec artifact.

## Objective

Generate two independent candidate specs in parallel, evaluate them with a fixed rubric, then either:

- pick the stronger candidate, or
- build a section-level hybrid.

The final `.ai/spec.md` must be rigorous and reader-first. It is a decision interface, not a merged archive of both candidates.

## Inputs

- `AGENTS.md` (if present)
- `.ai/input.md` (if present)
- existing `.ai/spec.md` (optional context only)

## Baseline quality contract

The canonical output must preserve baseline `spec-driven` quality:

- explicit scope and actors
- ambiguity handling and assumptions
- trade-offs and conflict handling
- concrete contracts, error behavior, and testability
- references for standards/version-sensitive decisions

## Execution phases

### Phase 1: Parallel candidate generation

Launch in one response:

- `Task(spec-driven-gpt, ...)`
- `Task(spec-driven-sonnet, ...)`

Requirements:

- Both branches receive the same task context.
- Branches do not inspect each other before comparison.
- Branches return their candidate in the Task result and do not write files.

### Phase 2: Candidate validation

Validate candidate content returned by both Task results. If one branch fails or returns invalid content, continue with available candidate.

### Phase 3: Weighted scoring

Score each candidate 0-5 per criterion and multiply by weight:

- Requirements completeness (25%)
- Constraints alignment (20%)
- Technical correctness (20%)
- Risk and failure coverage (15%)
- Testability and acceptance criteria (20%)

Keep scoring rationale in orchestrator reasoning. Do not write a compare artifact.

### Phase 4: Decision rule

- Gap >= 10 percentage points: winner wholesale.
- Gap < 10 percentage points: section-level hybrid.

Tie-breakers (in order):

1. Higher technical correctness
2. Better testability/acceptance criteria
3. Better risk coverage

### Phase 5: Synthesis

Write canonical `.ai/spec.md` with marker `[DRAFT v1 - DUAL SYNTHESIS]` using reader-first template.

The canonical file must include:

- One `Source: GPT | Sonnet | Hybrid` metadata line.
- Only decisions, requirement cards, boundaries, blocking questions, and references needed by an implementer.
- No score matrix, provenance map, candidate discussion, or duplicated rationale.

## Artifact Rule

Write only canonical `.ai/spec.md`. Do not create candidate, comparison, provenance, or research artifacts. If a source materially affects a decision, cite its URL or repository path in the canonical References section.

## Guardrails

- Do not let one candidate read the other before compare stage.
- Do not write implementation code.
- If one run fails, continue in degraded mode and add one `Source: <model>; degraded` metadata line to canonical spec.

## Canonical quality checklist

Before finalizing `.ai/spec.md`, verify:

- [ ] No unresolved contradiction between AGENTS.md and .ai/input.md without explicit note
- [ ] Acceptance criteria are measurable and testable
- [ ] Error behavior and edge cases are specified
- [ ] All sourced standards/version claims are cited in references
- [ ] Source metadata accurately identifies synthesis mode
