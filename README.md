# craft-agents

Production-ready agents, skills, hooks, and MCP descriptors for OpenCode, Claude Code, and Codex. Packaged as a `0xcraft` pack with multi-harness support.

## Contents

**17 Agents** — adr-reviewer, backend-developer, code-explorer, code-reviewer, codebase-indexer, dotnet-mentor, go-mentor, research-agent, spec-driven, spec-driven-dual, spec-driven-gpt, spec-driven-sonnet, system-architect, system-architect-dual, system-architect-gpt, system-architect-sonnet, team-lead

**19 Skills** — brainstorming, chatgpt-linkedin-skill, code-review-orchestrator, collection-codebase-patterns, context7, csharp-scripts, implementation-patterns, linkedin-article, mempalace, microbenchmarking, migrate-dotnet9-to-dotnet10, nlm-skill, pm-routing, receiving-code-review, systematic-debugging, test-driven-development, topaz-js, verification-before-completion, writing-plans

**3 Hooks** — agents-guard, caveman, git-worktree

**3 MCP Descriptors** — context7, mempalace, notebooklm-mcp

## Multi-Harness Support

This pack includes generated artifacts for all three supported harnesses:

- **OpenCode** — `.opencode/` with agents, skills, and plugin hooks
- **Claude Code** — `.claude-plugin/plugin.json` with embedded agents and skills
- **Codex** — `.codex/` with TOML agents, config, and hooks

## Install

```bash
0xcraft pack add craft-agents
```

## Testing 0xcraft Conversion

This repository serves as a test fixture for 0xcraft's converter pipeline. The platform-specific artifacts were generated via:

```bash
# Import from OpenCode source
0xcraft import --from opencode --in . --out . --overwrite

# Build for Claude Code
0xcraft build --target claude-code --mode claude-plugin --force

# Build for Codex
0xcraft build --target codex --force
```
