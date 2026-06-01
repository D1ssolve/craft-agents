---
schema: "0xcraft.hook.v1"
name: caveman
description: "Injects a caveman mode bootstrap prompt into the first user message of each session, activating the caveman skill for the duration of the session."
events:
  - "experimental.chat.messages.transform"
actions:
  - type: runtime_code
    runtime: opencode
    file: hook.opencode.js
---
