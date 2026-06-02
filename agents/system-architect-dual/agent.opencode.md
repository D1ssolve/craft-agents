---
mode: subagent
model: github-copilot/gpt-5.5
color: warning
temperature: 0.4
permission:
  question: allow
  websearch: allow
  webfetch: allow
  edit: allow
  task:
    "*": deny
    system-architect-gpt: allow
    system-architect-sonnet: allow
---
