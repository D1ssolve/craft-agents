---
schema: "0xcraft.skill.v1"
name: systematic-debugging
description: "Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes"
---

# Systematic Debugging

## Overview

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## The Four Phases

You MUST complete each phase before proceeding to the next.

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read Error Messages Carefully** — don't skip past errors or warnings; read stack traces completely
2. **Reproduce Consistently** — can you trigger it reliably? If not reproducible → gather more data
3. **Check Recent Changes** — git diff, recent commits, new dependencies, config changes
4. **Gather Evidence in Multi-Component Systems** — add diagnostic instrumentation at each component boundary; run once to gather evidence showing WHERE it breaks
5. **Trace Data Flow** — where does bad value originate? Keep tracing up until you find the source; fix at source, not at symptom

### Phase 2: Pattern Analysis

**Find the pattern before fixing:**

1. **Find Working Examples** — locate similar working code in same codebase
2. **Compare Against References** — read reference implementation COMPLETELY
3. **Identify Differences** — list every difference, however small
4. **Understand Dependencies** — what other components does this need?

### Phase 3: Hypothesis and Testing

**Scientific method:**

1. **Form Single Hypothesis** — state clearly: "I think X is the root cause because Y"
2. **Test Minimally** — make the SMALLEST possible change to test hypothesis; one variable at a time
3. **Verify Before Continuing** — did it work? Yes → Phase 4. Didn't work? Form NEW hypothesis

### Phase 4: Implementation

**Fix the root cause, not the symptom:**

1. **Create Failing Test Case** — simplest possible reproduction; automated test if possible
2. **Implement Single Fix** — address the root cause; ONE change at a time
3. **Verify Fix** — test passes now? No other tests broken?
4. **If Fix Doesn't Work** — STOP. Count how many fixes tried. If ≥ 3: question the architecture.

**If 3+ Fixes Failed: Question Architecture**

Each fix reveals new shared state/coupling/problem → this is an architectural problem. Stop and discuss with user before attempting more fixes.

## Red Flags - STOP and Follow Process

If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "It's probably X, let me fix that"
- "One more fix attempt" (when already tried 2+)

**ALL of these mean: STOP. Return to Phase 1.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple bugs have root causes too |
| "Emergency, no time for process" | Systematic is FASTER than thrashing |
| "Just try this first, then investigate" | Do it right from the start |
| "I'll write test after confirming fix works" | Untested fixes don't stick |
| "Multiple fixes at once saves time" | Can't isolate what worked |
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem |

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors, reproduce, check changes, gather evidence | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare | Identify differences |
| **3. Hypothesis** | Form theory, test minimally | Confirmed or new hypothesis |
| **4. Implementation** | Create test, fix, verify | Bug resolved, tests pass |
