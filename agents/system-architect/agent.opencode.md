---
mode: all
model: openai/gpt-6-astra
# fallback: kimi-code-plan-global/k3
color: warning
temperature: 0.4
permission:
  question: allow
  websearch: allow
  webfetch: allow
  edit: allow
  task:
    "*": deny
    code-explorer: allow
    codebase-indexer: allow
    research-agent: allow
  external_directory:
    "{{references_dir}}/**": allow
---
