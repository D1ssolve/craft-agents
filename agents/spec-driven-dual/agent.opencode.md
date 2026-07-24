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
    spec-driven-gpt: allow
    spec-driven-sonnet: allow
  external_directory:
    "{{references_dir}}/**": allow
---
