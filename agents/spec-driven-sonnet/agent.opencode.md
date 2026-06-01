---
schema: "0xcraft.opencode.agent.v1"
mode: subagent
model: github-copilot/claude-sonnet-4.6
color: info
temperature: 0.4
permissions:
  question: allow
  websearch: allow
  webfetch: allow
  edit: allow
  task:
    "*": deny
    code-explorer: allow
  external_directory:
    "~/.config/opencode/templates/*": allow
---
