---
mode: all
model: openai/gpt-5.6-sol
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
