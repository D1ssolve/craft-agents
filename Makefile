build-opencode:
	bun run /Users/diss0x/dev/0xcraft/src/cli/index.ts build --target opencode --force

build-codex:
	bun run /Users/diss0x/dev/0xcraft/src/cli/index.ts build --target codex --force

build-claude-code:
	bun run /Users/diss0x/dev/0xcraft/src/cli/index.ts build --target claude-code --mode claude-plugin --force

build: build-opencode build-codex build-claude-code

.PHONY: build build-opencode build-codex build-claude-code
