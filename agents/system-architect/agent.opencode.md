---
mode: all
model: openai/gpt-5.6-terra
color: warning
temperature: 0.4
permission:
  question: allow
  websearch: allow
  webfetch: allow
  edit: deny
  task:
    "*": deny
    code-explorer: allow
    codebase-indexer: allow
    research-agent: allow
---
