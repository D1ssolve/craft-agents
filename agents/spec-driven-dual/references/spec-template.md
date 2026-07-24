# Reader-First Spec Template

```markdown
# <Feature> Spec

Status: Draft | Approved | Final
Complexity: S | M | L

## At a Glance

- Goal: <one outcome>
- Scope: <included>; excludes <one important exclusion>
- Decisions: <3-7 decision bullets>

## Requirements

### R1: <behavior>

- Rule: <observable rule>
- Contract: `<endpoint/event/type>` only when changed or public.
- Failure: `<condition>` -> `<code or result>`.
- Accept: Given <context>, when <action>, then <observable outcome>.

### R2: <behavior>

- Rule: <observable rule>
- Accept: Given <context>, when <action>, then <observable outcome>.

## Boundaries

- Owns: <component/system>.
- Does not own: <component/system>.
- Invariant: <dependency, authorization, or data rule>.

## Open Questions

- <blocking question only>

## References

- `<path or URL>` - <why it matters>.
```

Omit empty sections. Keep detailed research, alternatives, scoring, and source excerpts in agent reasoning; cite only decision-relevant evidence.
