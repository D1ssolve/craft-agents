/**
 * Agents Guard hook for OpenCode.
 *
 * On the first message of each session, checks whether AGENTS.md exists at the
 * project's git worktree root. If it is missing, injects a soft recommendation
 * so the active agent can refresh baseline context when needed without blocking
 * narrowly scoped work.
 */

import path from 'path';
import fs from 'fs';

const MARKER = 'AGENTS_GUARD_INJECTED';

const AgentsGuardPlugin = async ({ worktree, directory }) => {
  const projectRoot = worktree || directory || process.cwd();

  return {
    'experimental.chat.messages.transform': async (_input, output) => {
      if (!output.messages?.length) return output;

      const alreadyInjected = output.messages.some((m) =>
        m.parts?.some((p) => p.type === 'text' && p.text?.includes(MARKER)),
      );
      if (alreadyInjected) return output;

      const agentsPath = path.join(projectRoot, 'AGENTS.md');
      if (fs.existsSync(agentsPath)) return output;

      const notice = `<!-- ${MARKER} -->
<RECOMMENDED_BASELINE>
AGENTS.md is missing from the project root (${projectRoot}).

Recommended routing policy:
- If the request is architectural, cross-cutting, or scope is unclear: run \`codebase-indexer\` first, then read AGENTS.md.
- If the request is narrowly scoped to known files/symbols: proceed with targeted discovery and avoid full indexing.

When baseline refresh is needed:
1. Invoke the \`codebase-indexer\` agent for this project (root: ${projectRoot}).
2. Wait until it writes AGENTS.md.
3. Read AGENTS.md.
4. Continue the user's request using the documented conventions.
</RECOMMENDED_BASELINE>`;

      const firstUser = output.messages.find((m) => m.info?.role === 'user');
      if (!firstUser?.parts?.length) return output;

      const referencePart = firstUser.parts[0];
      firstUser.parts.unshift({ ...referencePart, type: 'text', text: notice });
      return output;
    },
  };
};
export default AgentsGuardPlugin;
