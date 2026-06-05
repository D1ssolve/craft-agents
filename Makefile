build-opencode-fs:
	bun run /Users/diss0x/dev/0xcraft/src/cli/index.ts build --target opencode --opencode-mode filesystem --force

build-opencode-plugin:
	bun run /Users/diss0x/dev/0xcraft/src/cli/index.ts build --target opencode --opencode-mode plugin --force

build-codex:
	bun run /Users/diss0x/dev/0xcraft/src/cli/index.ts build --target codex --force

build-claude-code:
	bun run /Users/diss0x/dev/0xcraft/src/cli/index.ts build --target claude-code --mode claude-plugin --force

build: build-opencode-plugin build-codex build-claude-code

sync-dotnet-skills:
	./scripts/sync-dotnet-skills.sh

update-dotnet-skills:
	git submodule update --remote vendor/dotnet-skills
	./scripts/sync-dotnet-skills.sh

.PHONY: build build-opencode-plugin build-codex build-claude-code sync-dotnet-skills update-dotnet-skills
