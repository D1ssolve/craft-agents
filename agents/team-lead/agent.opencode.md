---
mode: primary
model: opencode/glm-5.1
color: accent
temperature: 0.2
permission:
  question: allow
  websearch: allow
  task:
    "*": deny
    research-agent: allow
    code-explorer: allow
    spec-driven: allow
    spec-driven-gpt: allow
    spec-driven-sonnet: allow
    spec-driven-dual: allow
    system-architect: allow
    system-architect-gpt: allow
    system-architect-sonnet: allow
    system-architect-dual: allow
    adr-reviewer: allow
    backend-developer: allow
    code-reviewer: allow
---
