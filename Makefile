build-opencode-fs:
	bun run /Users/diss0x/dev/0xcraft/src/cli/index.ts build --target opencode --opencode-mode filesystem --force

build-opencode-plugin:
	bun run /Users/diss0x/dev/0xcraft/src/cli/index.ts build --target opencode --opencode-mode plugin --force

build-codex:
	bun run /Users/diss0x/dev/0xcraft/src/cli/index.ts build --target codex --force

build-claude-code:
	bun run /Users/diss0x/dev/0xcraft/src/cli/index.ts build --target claude-code --mode claude-plugin --force

build: build-opencode build-codex build-claude-code

.PHONY: build build-opencode build-codex build-claude-code
