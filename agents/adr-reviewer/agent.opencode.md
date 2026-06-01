---
schema: "0xcraft.opencode.agent.v1"
mode: subagent
model: github-copilot/claude-sonnet-4.6
color: warning
temperature: 0.4
permissions:
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
