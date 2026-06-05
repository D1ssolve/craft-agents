# craft-agents

Production-ready agents, skills, hooks, and MCP descriptors for OpenCode, Claude Code, and Codex. Packaged as a `0xcraft` pack with multi-harness support.

## Contents

| Resource | Count | Reference |
|----------|-------|-----------|
| **Agents** | 17 | [docs/agents.md](docs/description-agents.md) |
| **Skills** | 112 (17 original + 93 from [dotnet/skills](https://github.com/dotnet/skills)) | [docs/skills.md](docs/description-skills.md) |
| **Hooks** | 3 | agents-guard, caveman, git-worktree |
| **MCP Descriptors** | 3 | context7, mempalace, notebooklm-mcp |

## .NET Skills

This pack includes 93 curated .NET skills from [dotnet/skills](https://github.com/dotnet/skills), maintained as a git submodule:

```bash
# First-time setup
git submodule update --init vendor/dotnet-skills

# Sync skills from submodule into skills/
make sync-dotnet-skills

# Update submodule to latest upstream + sync
make update-dotnet-skills
```

The sync script (`scripts/sync-dotnet-skills.sh`) copies skills from `vendor/dotnet-skills/plugins/*/skills/*` into `skills/`, filters unsupported frontmatter keys, preserves `references/`, and tracks provenance via `.dotnet-source` markers.

## Multi-Harness Support

This pack includes generated artifacts for all three supported harnesses:

- **OpenCode** — `.opencode/` with agents, skills, and plugin hooks
- **Claude Code** — `.claude-plugin/plugin.json` with embedded agents and skills
- **Codex** — `.codex/` with TOML agents, config, and hooks
