---
mode: subagent
model: kimi-code-plan-global/k3
# fallback: kimi-code-plan-global/k3-256k
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
