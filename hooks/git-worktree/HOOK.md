---
schema: "0xcraft.hook.v1"
name: git-worktree
description: "Registers the git-worktree skill and injects a bootstrap prompt into the first user message of each session to activate git worktree context awareness."
events:
  - "experimental.chat.messages.transform"
actions:
  - type: runtime_code
    runtime: opencode
    file: hook.opencode.js
---
