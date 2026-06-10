---
mode: subagent
model: github-copilot/claude-sonnet-4.6
color: info
temperature: 0.4
permission:
  question: allow
  websearch: allow
  webfetch: allow
  edit: allow
  task:
    "*": deny
    code-explorer: allow
  external_directory:
    ~/.config/opencode/agents/spec-driven-gpt/references*: allow
---
