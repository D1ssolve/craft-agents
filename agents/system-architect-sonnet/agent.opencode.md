---
mode: subagent
model: github-copilot/claude-sonnet-4.6
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
---
