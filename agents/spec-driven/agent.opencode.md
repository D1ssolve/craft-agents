---
schema: "0xcraft.opencode.agent.v1"
mode: all
model: github-copilot/gpt-5.5
color: info
temperature: 0.4
permissions:
  question: allow
  websearch: allow
  webfetch: allow
  edit: deny
  task:
    "*": deny
    code-explorer: allow
  external_directory:
    "~/.config/opencode/templates/*": allow
---
