---
mode: subagent
model: openai/gpt-6-astra
# fallback: openai/gpt-5.5
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
