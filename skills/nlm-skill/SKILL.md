---
schema: "0xcraft.skill.v1"
name: nlm-skill
description: "Expert guide for the NotebookLM CLI (`nlm`) and MCP server - interfaces for Google NotebookLM. Use this skill when users want to interact with NotebookLM programmatically, including: creating/managing notebooks, adding sources (URLs, YouTube, text, Google Drive), generating content (podcasts, reports, quizzes, flashcards, mind maps, slides, infographics, videos, data tables), conducting research, chatting with sources, or automating NotebookLM workflows. Triggers on mentions of \"nlm\", \"notebooklm\", \"notebook lm\", \"podcast generation\", \"audio overview\", or any NotebookLM-related automation task."
---

# NotebookLM CLI & MCP Expert

This skill provides comprehensive guidance for using NotebookLM via both the `nlm` CLI and MCP tools.

## Tool Detection (CRITICAL - Read First!)

**ALWAYS check which tools are available before proceeding:**

1. **Check for MCP tools**: Look for tools starting with `mcp__notebooklm-mcp__*` or `mcp_notebooklm_*`
2. **If BOTH MCP tools AND CLI are available**: **ASK the user** which they prefer to use before proceeding
3. **If only MCP tools are available**: Use them directly (refer to tool docstrings for parameters)
4. **If only CLI is available**: Use `nlm` CLI commands via Bash

## Quick Reference

**Run `nlm --ai` to get comprehensive AI-optimized documentation** - this provides a complete view of all CLI capabilities.

```bash
nlm --help              # List all commands
nlm <command> --help    # Help for specific command
nlm --ai                # Full AI-optimized documentation (RECOMMENDED)
nlm --version           # Check installed version
```

## Critical Rules (Read First!)

1. **Always authenticate first**: Run `nlm login` before any operations
2. **Sessions expire in ~20 minutes**: Re-run `nlm login` if commands start failing
3. **⚠️ ALWAYS ASK USER BEFORE DELETE**: Before executing ANY delete command, ask the user for explicit confirmation. Deletions are **irreversible**.
4. **`--confirm` is REQUIRED**: All generation and delete commands need `--confirm` or `-y` (CLI) or `confirm=True` (MCP)
5. **Research requires `--notebook-id`**: The flag is mandatory, not positional
6. **Capture IDs from output**: Create/start commands return IDs needed for subsequent operations
7. **Use aliases**: Simplify long UUIDs with `nlm alias set <name> <uuid>`
8. **DO NOT launch REPL**: Never use `nlm chat start` - it opens an interactive REPL that AI tools cannot control. Use `nlm notebook query` for one-shot Q&A instead.

## Workflow Decision Tree

```
User wants to...
│
├─► Add content to a notebook
│   ├─► From a URL/webpage → nlm source add <nb-id> --url "https://..."
│   ├─► From YouTube → nlm source add <nb-id> --url "https://youtube.com/..."
│   ├─► From pasted text → nlm source add <nb-id> --text "content" --title "Title"
│   └─► Discover new sources → nlm research start "query" --notebook-id <nb-id>
│
├─► Generate content from sources
│   ├─► Podcast/Audio → nlm audio create <nb-id> --confirm
│   ├─► Written summary → nlm report create <nb-id> --confirm
│   ├─► Study materials → nlm quiz/flashcards create <nb-id> --confirm
│   ├─► Visual content → nlm mindmap/slides/infographic create <nb-id> --confirm
│   └─► Video → nlm video create <nb-id> --confirm
│
├─► Ask questions about sources
│   └─► nlm notebook query <nb-id> "question"
│
└─► Manage/cleanup
    ├─► List notebooks → nlm notebook list
    ├─► List sources → nlm source list <nb-id>
    └─► Delete notebook → nlm notebook delete <nb-id> --confirm
```

## Key Commands

### Notebooks
```bash
nlm notebook list
nlm notebook create "Title"
nlm notebook query <id> "question"
nlm notebook delete <id> --confirm
```

### Sources
```bash
nlm source add <nb-id> --url "https://..."
nlm source add <nb-id> --text "content" --title "Title"
nlm source list <nb-id>
nlm source delete <source-id> --confirm
```

### Research
```bash
nlm research start "query" --notebook-id <id>
nlm research start "query" --notebook-id <id> --mode deep
nlm research status <nb-id>
nlm research import <nb-id> <task-id>
```

### Content Generation
```bash
nlm audio create <id> --confirm
nlm report create <id> --format "Study Guide" --confirm
nlm quiz create <id> --count 5 --difficulty 3 --confirm
nlm flashcards create <id> --difficulty medium --confirm
nlm mindmap create <id> --confirm
nlm slides create <id> --confirm
nlm video create <id> --format explainer --confirm
nlm infographic create <id> --orientation portrait --confirm
```

### Studio Status & Download
```bash
nlm studio status <nb-id>
nlm download audio <nb-id> --output podcast.mp3
nlm download report <nb-id> --output report.md
```

## Error Recovery

| Error | Solution |
|-------|----------|
| "Cookies have expired" | `nlm login` |
| "Notebook not found" | `nlm notebook list` |
| "Rate limit exceeded" | Wait 30s, retry |
| "Import timed out" | Use `--timeout 600` |

## MCP Tools (if available)

Use `notebook_list`, `notebook_create`, `notebook_query`, `source_add`, `studio_create`, `research_start`, `research_status`, `research_import`, `download_artifact` etc. All destructive operations require `confirm=True`.
