---
mode: subagent
model: kimi-for-coding/k2p7
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
