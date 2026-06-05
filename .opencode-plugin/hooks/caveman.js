/**
 * Caveman hook for OpenCode.
 *
 * Injects a caveman mode bootstrap prompt into the first user message of each
 * session, activating the caveman skill for the duration of the session.
 */

function buildBootstrap() {
  return `<EXTREMELY_IMPORTANT>
Caveman mode must be active for this OpenCode session.

Use the skill tool to load the "caveman" skill IMMEDIATELY — this is not optional. Call the skill tool with name="caveman" right now, before responding to any user message. The caveman skill contains the always-on communication rules that must be applied to every response.

Do NOT load the caveman skill again after this first load — it persists for the entire session.
</EXTREMELY_IMPORTANT>`;
}

const CavemanHook = async () => {
  return {
    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = buildBootstrap();
      if (!bootstrap || !output.messages.length) return output;

      const firstUser = output.messages.find((message) => message.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return output;

      const alreadyInjected = firstUser.parts.some(
        (part) => part.type === 'text' && part.text.includes('Caveman mode must be active for this OpenCode session.')
      );
      if (alreadyInjected) return output;

      const referencePart = firstUser.parts[0];
      firstUser.parts.unshift({ ...referencePart, type: 'text', text: bootstrap });
      return output;
    },
  };
};
export default CavemanHook;
