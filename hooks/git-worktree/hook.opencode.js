/**
 * Git worktree hook for OpenCode.
 *
 * Injects a bootstrap prompt into the first user message of each session to
 * activate git worktree context awareness via the git-worktree skill.
 */

function buildBootstrap() {
  return `<GitWorktree_Context>
Use the skill tool to load the "git-worktree" skill IMMEDIATELY — this is not optional.

Do NOT load the git-worktree skill again after this first load — it persists for the entire session.
</GitWorktree_Context>`;
}

const GitWorktreeHook = async () => {
  return {
    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = buildBootstrap();
      if (!bootstrap || !output.messages.length) return;

      const firstUser = output.messages.find((message) => message.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return;

      const alreadyInjected = firstUser.parts.some(
        (part) => part.type === 'text' && part.text.includes('GitWorktree_Context')
      );
      if (alreadyInjected) return;

      const referencePart = firstUser.parts[0];
      firstUser.parts.unshift({ ...referencePart, type: 'text', text: bootstrap });
    },
  };
};

export default GitWorktreeHook;
