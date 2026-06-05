# Agents

17 production-ready agents for orchestrated AI coding workflows.

| Agent                                                                 | Description                                                                                                                                   |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| [adr-reviewer](../agents/adr-reviewer/AGENT.md)                       | Reviews architecture decisions in `.ai/adr.md` before implementation. Validates layering, pattern consistency, and operational readiness.     |
| [backend-developer](../agents/backend-developer/AGENT.md)             | Implements server-side logic, REST/GraphQL APIs, database integrations, auth, background jobs, and backend infrastructure.                    |
| [code-explorer](../agents/code-explorer/AGENT.md)                     | Read-only codebase search specialist. Finds where behavior lives, which files implement something, or how a flow is wired.                    |
| [code-reviewer](../agents/code-reviewer/AGENT.md)                     | Production-readiness reviewer. Inspects code changes through focused lenses, runs tests, and returns severity-ranked findings.                |
| [codebase-indexer](../agents/codebase-indexer/AGENT.md)               | Analyzes a project and generates or updates `AGENTS.md` with discovered patterns, architecture, and conventions.                              |
| [dotnet-mentor](../agents/dotnet-mentor/AGENT.md)                     | Guided .NET / C# mentorship: concept explanation, debugging help, code review of user attempts, step-by-step coaching.                        |
| [go-mentor](../agents/go-mentor/AGENT.md)                             | Guided Go mentorship: concept explanation, debugging help, code review of user attempts, step-by-step coaching.                               |
| [research-agent](../agents/research-agent/AGENT.md)                   | Technical research specialist. Queries Context7 MCP and web to find the best available solution for a problem.                                |
| [spec-driven](../agents/spec-driven/AGENT.md)                         | Translates requirements into a structured `.ai/spec.md` through an iterative, approval-gated process.                                         |
| [spec-driven-dual](../agents/spec-driven-dual/AGENT.md)               | Runs `spec-driven-gpt` and `spec-driven-sonnet` in parallel, compares with a strict rubric, and synthesizes canonical output.                 |
| [spec-driven-gpt](../agents/spec-driven-gpt/AGENT.md)                 | Produces a high-rigor GPT candidate spec artifact at `.ai/spec.gpt.md` for dual-run comparison.                                               |
| [spec-driven-sonnet](../agents/spec-driven-sonnet/AGENT.md)           | Produces a high-rigor Sonnet candidate spec artifact at `.ai/spec.sonnet.md` for dual-run comparison.                                         |
| [system-architect](../agents/system-architect/AGENT.md)               | Designs system architecture, decomposes complex features into actionable developer tasks, creates ADRs, and plans cross-service integrations. |
| [system-architect-dual](../agents/system-architect-dual/AGENT.md)     | Runs `system-architect-gpt` and `system-architect-sonnet` in parallel, compares with a strict rubric, and synthesizes canonical output.       |
| [system-architect-gpt](../agents/system-architect-gpt/AGENT.md)       | Produces a high-rigor GPT architecture candidate at `.ai/adr.gpt.md` and `.ai/tasks.gpt.md` for dual comparison.                              |
| [system-architect-sonnet](../agents/system-architect-sonnet/AGENT.md) | Produces a high-rigor Sonnet architecture candidate at `.ai/adr.sonnet.md` and `.ai/tasks.sonnet.md` for dual comparison.                     |
| [team-lead](../agents/team-lead/AGENT.md)                             | Pure orchestrator — loads `pm-routing` skill, reads `AGENTS.md`, decides agent chain, drives execution, and surfaces results.                 |
