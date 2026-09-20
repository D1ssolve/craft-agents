---
mode: subagent
model: openai/gpt-6-astra
# fallback: kimi-code-plan-global/k3
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
