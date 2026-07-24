---
mode: subagent
model: openai/gpt-5.6-sol
color: info
temperature: 0.4
permission:
  question: allow
  websearch: allow
  webfetch: allow
  edit: allow
  task:
    "*": deny
    code-explorer: allow
  external_directory:
    "{{references_dir}}/**": allow
---
