---
schema: "0xcraft.hook.v1"
name: agents-guard
description: "Checks whether AGENTS.md exists at project root. If missing, injects a soft recommendation into the first user message so the active agent can refresh baseline context."
events:
  - "experimental.chat.messages.transform"
actions:
  - type: runtime_code
    runtime: opencode
    file: hook.opencode.js
---
