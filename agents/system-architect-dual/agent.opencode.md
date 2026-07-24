---
mode: subagent
model: kimi-for-coding/k3
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
  external_directory:
    "{{references_dir}}/**": allow
---
