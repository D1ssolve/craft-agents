---
mode: subagent
model: github-copilot/gpt-5.5
color: info
temperature: 0.4
permission:
  question: allow
  websearch: allow
  webfetch: allow
  edit: allow
  task:
    "*": deny
    spec-driven-gpt: allow
    spec-driven-sonnet: allow
---
