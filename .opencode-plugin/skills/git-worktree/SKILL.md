---
description: "Git worktree context awareness. Auto-activates when project is inside a .tasks task folder with git worktrees. Teaches agents about worktree structure, sibling services, and worktree-specific git behavior. Prevents agents from operating on the main repository instead of the worktree copy.\n"
name: git-worktree
---


# Git Worktree Context

You are working in a **git worktree** environment. This changes how you must operate.

## Two Modes

The plugin detects which mode you're in and injects context accordingly:

### Mode 1: Task Root

You are in the task folder (e.g., `.tasks/ITPR-492/`). This folder contains multiple service worktrees as subdirectories. There is NO `.git` in the task root itself.

**Key rules:**
- Git commands will FAIL in the task root — there is no git repository here
- You MUST `cd` into a service directory or use `workdir` parameter before running git commands
- Each service subdirectory is a separate git worktree with its own branch
- Reference files by their full path under the service directory

### Mode 2: Inside a Worktree

You are inside a specific service worktree (e.g., `.tasks/ITPR-492/inbanksight/`). The `.git` here is a **file** (not a directory) pointing back to the main repo.

**Key rules:**
- Git commands work normally in this directory
- You are on a specific branch for this task
- The main repository is at a different path — DO NOT navigate there

## What Is a Worktree

A git worktree is a separate checkout of a repository at a different path. It shares the same `.git` object store but has its own working directory, index, and HEAD. Key differences:

- `.git` is a **file** (not a directory) pointing back to the main repo
- Each worktree has its own branch checked out
- Commits made in a worktree are visible from the main repo and other worktrees
- The main repo and worktrees must NOT have the same branch checked out simultaneously

## Current Context

The plugin has already detected and injected your worktree context into the session. Look for a `<GIT_WORKTREE_CONTEXT>` block in the conversation. It contains:

- **Task ID**: The task/ticket identifier (e.g., ITPR-492)
- **Task Root**: Parent directory containing all services for this task
- **Service**: The specific service/repository you're working in (if inside a worktree)
- **Branch**: The git branch checked out in this worktree
- **Main Repo Path**: Where the main `.git` repository lives (DO NOT cd there)
- **Sibling Services**: Other services in the same task folder

## Rules

### MUST

1. **Work only in the current worktree directory.** All file operations, git commands, and builds happen here.
2. **Use `git` commands normally** when inside a worktree directory. Most git operations work identically: `git add`, `git commit`, `git push`, `git pull`, `git diff`, `git log`, etc.
3. **Reference sibling services by their full path** when you need to coordinate across services. The task root contains all services for this task.
4. **Check `git worktree list`** if you need to see all worktrees for this repository.
5. **Use `workdir` parameter** for bash commands when working in a specific service from the task root.

### MUST NOT

1. **NEVER cd to the main repository path.** The main repo is at a different location. Working there would affect the wrong checkout and potentially conflict with the worktree branch.
2. **NEVER assume the project root is the git root.** In a worktree, the project root IS the worktree directory, but the `.git` data lives elsewhere. In the task root, there is no git at all.
3. **NEVER checkout the same branch in multiple worktrees.** Git will refuse this, but be aware of it when creating branches.
4. **NEVER use `git checkout` to switch to a branch that's already checked out in another worktree.** Create a new branch instead.
5. **NEVER run git commands in the task root directory.** There is no `.git` there — commands will fail.

## Worktree-Specific Git Commands

```bash
# List all worktrees for this repository
git worktree list

# Create a new branch in this worktree (safe)
git checkout -b feature/new-thing

# Check which worktree has which branch
git worktree list --porcelain

# Remove a worktree (from the main repo, not from inside a worktree)
# git worktree remove /path/to/worktree

# Prune stale worktree entries
git worktree prune
```

## Cross-Service Coordination

When a task spans multiple services (e.g., both `inbanksight` and `datamart`):

1. Each service has its own worktree under the task root
2. Changes in one service do NOT affect the other — they're separate repositories
3. To coordinate, reference files by their full path under the task root
4. If you need to work on a sibling service, tell the user — you may need to open a new opencode session in that service's directory

## Detection

This skill auto-activates when:
- The current directory is a `.tasks/<TASK_ID>` folder with worktree subdirectories
- The current directory contains a `.git` **file** (not directory) — indicating a worktree
- The path matches the pattern `*/.tasks/*/` (task folder structure)

If none of these conditions are met, this skill has no effect and you can ignore it.
