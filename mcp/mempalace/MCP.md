---
schema: "0xcraft.mcp.v1"
name: mempalace
description: "MemPalace MCP server. Persistent semantic memory system. Provides tools for storing, searching, and retrieving memories across sessions using a palace/wing/room/drawer hierarchy with knowledge graph support."
transport: stdio
command: uvx
args:
  - "--from"
  - "mempalace"
  - "python"
  - "-m"
  - "mempalace.mcp_server"
---
