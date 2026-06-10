---
name: self-improving-skills-agents
description: 'Use after a coding session to analyze misunderstandings, behavior patterns, and misses; then propose concrete updates to SKILL.md, AGENT.md, prompts, and hooks.'
---

# Self-Improving Skills And Agents

## Outcome

Create a repeatable post-session improvement loop that:
- Identifies misunderstandings in user requests and execution behavior
- Finds root causes in current agent and skill instructions
- Produces concrete change proposals for `SKILL.md`, `AGENT.md`, prompts, and hooks
- Defines validation checks so improvements are measurable in the next sessions

## When To Use

Use this skill when one or more of the following happened:
- The agent misunderstood user intent, constraints, or success criteria
- The session had repeated correction loops
- The output was technically correct but not aligned with requested style/process
- The user had to restate requirements more than once
- The workflow felt slow, noisy, or inconsistent

## Inputs

- Session summary or transcript fragments
- User corrections and re-requests
- Files touched during the session
- Existing relevant instructions in `agents/`, `skills/`, `commands/`, `hooks/`

## Procedure

### 1. Reconstruct The Session Timeline

Build a short ordered timeline:
1. User request
2. Agent interpretation
3. Actions performed
4. User corrections
5. Final outcome

Mark each correction with one label:
- `intent-mismatch`
- `missing-constraint`
- `priority-mismatch`
- `format-mismatch`
- `tooling-mismatch`
- `process-mismatch`

### 2. Diagnose Root Cause

For each correction, decide where the fault belongs:
- Skill discovery issue: trigger words too weak in `description`
- Procedural gap: missing steps or decision branches in workflow
- Instruction conflict: two files provide competing rules
- Scope confusion: should be workspace rule vs user-level preference
- Guardrail gap: should be enforced via hook or checklist

If the same failure type appears 2+ times in one session, mark it as `systemic`.

### 3. Choose Improvement Target

Use this routing:
- Update `SKILL.md` when a reusable workflow is unclear or incomplete
- Update `AGENT.md` when role behavior and prioritization are wrong
- Update prompt templates when request framing is missing critical inputs
- Update hooks when deterministic enforcement is required

If multiple targets apply, implement in this order:
1. Clarify behavior in `SKILL.md`
2. Align role routing in `AGENT.md`
3. Add hook enforcement only for repeat deterministic checks

### 4. Generate Change Proposals

For each proposed change, provide:
1. Problem statement (one sentence)
2. Exact file to edit
3. Patch-style snippet (minimal change)
4. Expected behavior change
5. Risk if not applied

Keep proposals small and independent.

### 5. Add Quality Gates

Every improvement must include at least one validation check:
- Discovery check: skill is selected for the target prompt type
- Behavior check: agent follows new branch without user correction
- Output check: response matches requested format and constraints
- Regression check: no conflict with existing mandatory rules

### 6. Close The Loop

Create a short retrospective note with:
- Top 3 issues by impact
- Applied changes
- Deferred changes
- What to verify in the next 3 sessions

## Decision Rules

- Prefer instruction clarity before adding new files
- Prefer smallest patch that removes ambiguity
- Do not add hooks for subjective style concerns
- Do not create a new skill when a targeted update to an existing skill solves the issue

## Completion Checklist

- At least one concrete misunderstanding pattern identified
- Root cause tied to a specific customization file
- Minimal patch proposal produced
- Validation method defined
- Follow-up verification criteria for future sessions documented

## Example Prompts

- Analyze yesterday session failures and propose minimal updates to our skill and agent files.
- We had repeated requirement misses in backend tasks. Run self-improvement review and suggest patches.
- Review this session and propose what to change in skills and hooks to reduce correction loops.
