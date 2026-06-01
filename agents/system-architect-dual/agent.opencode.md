---
schema: "0xcraft.opencode.agent.v1"
mode: subagent
model: github-copilot/claude-opus-4.8
color: warning
temperature: 0.4
permissions:
  question: allow
  websearch: allow
  webfetch: allow
  edit: allow
  task:
    "*": deny
    system-architect-gpt: allow
    system-architect-sonnet: allow
---
