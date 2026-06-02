---
mode: subagent
model: github-copilot/gpt-5.5
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
