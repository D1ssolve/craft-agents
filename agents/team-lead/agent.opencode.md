---
schema: "0xcraft.opencode.agent.v1"
mode: primary
model: zai-coding-plan/glm-5.1
color: accent
temperature: 0.4
permissions:
  question: allow
  websearch: allow
  task:
    "*": deny
    research-agent: allow
    code-explorer: allow
    spec-driven-dual: allow
    spec-driven: allow
    spec-driven-gpt: allow
    spec-driven-sonnet: allow
    system-architect-dual: allow
    system-architect: allow
    system-architect-gpt: allow
    system-architect-sonnet: allow
    backend-developer: allow
    code-reviewer: allow
---
