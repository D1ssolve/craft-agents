---
mode: subagent
model: kimi-for-coding/k2p7
color: info
temperature: 0.4
permission:
  question: allow
  websearch: allow
  webfetch: allow
  edit: deny
  task:
    "*": deny
    code-explorer: allow
external_directory:
  "{{references_dir}}/**": allow
---
