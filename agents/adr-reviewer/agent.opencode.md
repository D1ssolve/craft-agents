---
mode: subagent
model: openai/gpt-5.6-sol
color: warning
temperature: 0.3
permission:
  question: allow
  websearch: allow
  webfetch: allow
  edit: deny
  task:
    "*": deny
    codebase-indexer: allow
    code-explorer: allow
    research-agent: allow
---
