---
schema: "0xcraft.mcp.v1"
name: notebooklm-mcp
description: "NotebookLM MCP server. Provides tools for creating and managing Google NotebookLM notebooks, adding sources, generating audio/video/reports/quizzes/flashcards/mind maps/slides/infographics, conducting research, and querying notebook content."
transport: stdio
command: uvx
args:
  - "--from"
  - "notebooklm-mcp-cli"
  - "notebooklm-mcp"
---
