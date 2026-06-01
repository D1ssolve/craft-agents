// 0xcraft-generated OpenCode plugin (plugin mode)
import { spawn } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mcp = {
  "context7": {
    "headers": {
      "Authorization": "Bearer ${CONTEXT7_API_KEY}"
    },
    "type": "remote",
    "url": "https://mcp.context7.com/mcp"
  },
  "mempalace": {
    "command": [
      "uvx",
      "--from",
      "mempalace",
      "python",
      "-m",
      "mempalace.mcp_server"
    ],
    "type": "local"
  },
  "notebooklm-mcp": {
    "command": [
      "uvx",
      "--from",
      "notebooklm-mcp-cli",
      "notebooklm-mcp"
    ],
    "type": "local"
  }
};

function loadAgents() {
  const agents = {};
  const agentsDir = join(__dirname, "agents");
  if (!existsSync(agentsDir)) return agents;

  for (const entry of readdirSync(agentsDir, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const agentId = entry.name.slice(0, -3);
    const filePath = join(agentsDir, entry.name);
    const { data, body } = parseFrontmatter(readFileSync(filePath, "utf8"));
    agents[agentId] = { ...data, prompt: resolveReferenceTokens(body, join("agents", agentId, "references")) };
  }

  return agents;
}

function loadCommands() {
  const commands = {};
  const commandsDir = join(__dirname, "commands");
  if (!existsSync(commandsDir)) return commands;

  for (const entry of readdirSync(commandsDir, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const commandId = entry.name.slice(0, -3);
    const filePath = join(commandsDir, entry.name);
    const { data, body } = parseFrontmatter(readFileSync(filePath, "utf8"));
    commands[commandId] = { ...data, template: body };
  }

  return commands;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: content };
  return { data: parseFrontmatterYaml(match[1]), body: match[2] ?? "" };
}

function parseFrontmatterYaml(header) {
  const data = {};
  const lines = header.split("\n");

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (line === undefined || line.trim() === "") continue;
    const match = line.match(/^([^:]+):(?:\s*(.*))?$/);
    if (!match) continue;

    const key = match[1].trim();
    const rawValue = match[2] ?? "";
    if (rawValue.trim() !== "") {
      data[key] = parseScalar(rawValue);
      continue;
    }

    const nextLine = lines[index + 1] ?? "";
    if (/^\s*-\s+/.test(nextLine)) {
      const values = [];
      while (/^\s*-\s+/.test(lines[index + 1] ?? "")) {
        index++;
        values.push(parseScalar((lines[index].match(/^\s*-\s+(.*)$/) ?? ["", ""])[1]));
      }
      data[key] = values;
      continue;
    }

    if (/^\s+[^:\s][^:]*:/.test(nextLine)) {
      const nested = {};
      while (/^\s+[^:\s][^:]*:/.test(lines[index + 1] ?? "")) {
        index++;
        const nestedMatch = lines[index].match(/^\s+([^:]+):\s*(.*)$/);
        if (nestedMatch) nested[nestedMatch[1].trim()] = parseScalar(nestedMatch[2] ?? "");
      }
      data[key] = nested;
      continue;
    }

    data[key] = "";
  }

  return data;
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

function resolveReferenceTokens(content, referencesDir) {
  return content.replaceAll("{{references_dir}}", referencesDir);
}

async function hook_agents_guard(input, ctx) {
  const module = await import("data:text/javascript;base64,LyoqCiAqIEFnZW50cyBHdWFyZCBob29rIGZvciBPcGVuQ29kZS4KICoKICogT24gdGhlIGZpcnN0IG1lc3NhZ2Ugb2YgZWFjaCBzZXNzaW9uLCBjaGVja3Mgd2hldGhlciBBR0VOVFMubWQgZXhpc3RzIGF0IHRoZQogKiBwcm9qZWN0J3MgZ2l0IHdvcmt0cmVlIHJvb3QuIElmIGl0IGlzIG1pc3NpbmcsIGluamVjdHMgYSBzb2Z0IHJlY29tbWVuZGF0aW9uCiAqIHNvIHRoZSBhY3RpdmUgYWdlbnQgY2FuIHJlZnJlc2ggYmFzZWxpbmUgY29udGV4dCB3aGVuIG5lZWRlZCB3aXRob3V0IGJsb2NraW5nCiAqIG5hcnJvd2x5IHNjb3BlZCB3b3JrLgogKi8KCmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnOwppbXBvcnQgZnMgZnJvbSAnZnMnOwoKY29uc3QgTUFSS0VSID0gJ0FHRU5UU19HVUFSRF9JTkpFQ1RFRCc7CgpleHBvcnQgY29uc3QgQWdlbnRzR3VhcmRQbHVnaW4gPSBhc3luYyAoeyB3b3JrdHJlZSwgZGlyZWN0b3J5IH0pID0+IHsKICBjb25zdCBwcm9qZWN0Um9vdCA9IHdvcmt0cmVlIHx8IGRpcmVjdG9yeSB8fCBwcm9jZXNzLmN3ZCgpOwoKICByZXR1cm4gewogICAgJ2V4cGVyaW1lbnRhbC5jaGF0Lm1lc3NhZ2VzLnRyYW5zZm9ybSc6IGFzeW5jIChfaW5wdXQsIG91dHB1dCkgPT4gewogICAgICBpZiAoIW91dHB1dC5tZXNzYWdlcz8ubGVuZ3RoKSByZXR1cm47CgogICAgICBjb25zdCBhbHJlYWR5SW5qZWN0ZWQgPSBvdXRwdXQubWVzc2FnZXMuc29tZSgobSkgPT4KICAgICAgICBtLnBhcnRzPy5zb21lKChwKSA9PiBwLnR5cGUgPT09ICd0ZXh0JyAmJiBwLnRleHQ/LmluY2x1ZGVzKE1BUktFUikpLAogICAgICApOwogICAgICBpZiAoYWxyZWFkeUluamVjdGVkKSByZXR1cm47CgogICAgICBjb25zdCBhZ2VudHNQYXRoID0gcGF0aC5qb2luKHByb2plY3RSb290LCAnQUdFTlRTLm1kJyk7CiAgICAgIGlmIChmcy5leGlzdHNTeW5jKGFnZW50c1BhdGgpKSByZXR1cm47CgogICAgICBjb25zdCBub3RpY2UgPSBgPCEtLSAke01BUktFUn0gLS0+CjxSRUNPTU1FTkRFRF9CQVNFTElORT4KQUdFTlRTLm1kIGlzIG1pc3NpbmcgZnJvbSB0aGUgcHJvamVjdCByb290ICgke3Byb2plY3RSb290fSkuCgpSZWNvbW1lbmRlZCByb3V0aW5nIHBvbGljeToKLSBJZiB0aGUgcmVxdWVzdCBpcyBhcmNoaXRlY3R1cmFsLCBjcm9zcy1jdXR0aW5nLCBvciBzY29wZSBpcyB1bmNsZWFyOiBydW4gXGBjb2RlYmFzZS1pbmRleGVyXGAgZmlyc3QsIHRoZW4gcmVhZCBBR0VOVFMubWQuCi0gSWYgdGhlIHJlcXVlc3QgaXMgbmFycm93bHkgc2NvcGVkIHRvIGtub3duIGZpbGVzL3N5bWJvbHM6IHByb2NlZWQgd2l0aCB0YXJnZXRlZCBkaXNjb3ZlcnkgYW5kIGF2b2lkIGZ1bGwgaW5kZXhpbmcuCgpXaGVuIGJhc2VsaW5lIHJlZnJlc2ggaXMgbmVlZGVkOgoxLiBJbnZva2UgdGhlIFxgY29kZWJhc2UtaW5kZXhlclxgIGFnZW50IGZvciB0aGlzIHByb2plY3QgKHJvb3Q6ICR7cHJvamVjdFJvb3R9KS4KMi4gV2FpdCB1bnRpbCBpdCB3cml0ZXMgQUdFTlRTLm1kLgozLiBSZWFkIEFHRU5UUy5tZC4KNC4gQ29udGludWUgdGhlIHVzZXIncyByZXF1ZXN0IHVzaW5nIHRoZSBkb2N1bWVudGVkIGNvbnZlbnRpb25zLgo8L1JFQ09NTUVOREVEX0JBU0VMSU5FPmA7CgogICAgICBjb25zdCBmaXJzdFVzZXIgPSBvdXRwdXQubWVzc2FnZXMuZmluZCgobSkgPT4gbS5pbmZvPy5yb2xlID09PSAndXNlcicpOwogICAgICBpZiAoIWZpcnN0VXNlcj8ucGFydHM/Lmxlbmd0aCkgcmV0dXJuOwoKICAgICAgY29uc3QgcmVmZXJlbmNlUGFydCA9IGZpcnN0VXNlci5wYXJ0c1swXTsKICAgICAgZmlyc3RVc2VyLnBhcnRzLnVuc2hpZnQoeyAuLi5yZWZlcmVuY2VQYXJ0LCB0eXBlOiAndGV4dCcsIHRleHQ6IG5vdGljZSB9KTsKICAgIH0sCiAgfTsKfTsK");
  const plugin = await module.default(input);
  if (typeof plugin?.event === "function") await plugin.event(ctx);
}

async function hook_caveman(input, ctx) {
  const module = await import("data:text/javascript;base64,LyoqCiAqIENhdmVtYW4gaG9vayBmb3IgT3BlbkNvZGUuCiAqCiAqIEluamVjdHMgYSBjYXZlbWFuIG1vZGUgYm9vdHN0cmFwIHByb21wdCBpbnRvIHRoZSBmaXJzdCB1c2VyIG1lc3NhZ2Ugb2YgZWFjaAogKiBzZXNzaW9uLCBhY3RpdmF0aW5nIHRoZSBjYXZlbWFuIHNraWxsIGZvciB0aGUgZHVyYXRpb24gb2YgdGhlIHNlc3Npb24uCiAqLwoKZnVuY3Rpb24gYnVpbGRCb290c3RyYXAoKSB7CiAgcmV0dXJuIGA8RVhUUkVNRUxZX0lNUE9SVEFOVD4KQ2F2ZW1hbiBtb2RlIG11c3QgYmUgYWN0aXZlIGZvciB0aGlzIE9wZW5Db2RlIHNlc3Npb24uCgpVc2UgdGhlIHNraWxsIHRvb2wgdG8gbG9hZCB0aGUgImNhdmVtYW4iIHNraWxsIElNTUVESUFURUxZIOKAlCB0aGlzIGlzIG5vdCBvcHRpb25hbC4gQ2FsbCB0aGUgc2tpbGwgdG9vbCB3aXRoIG5hbWU9ImNhdmVtYW4iIHJpZ2h0IG5vdywgYmVmb3JlIHJlc3BvbmRpbmcgdG8gYW55IHVzZXIgbWVzc2FnZS4gVGhlIGNhdmVtYW4gc2tpbGwgY29udGFpbnMgdGhlIGFsd2F5cy1vbiBjb21tdW5pY2F0aW9uIHJ1bGVzIHRoYXQgbXVzdCBiZSBhcHBsaWVkIHRvIGV2ZXJ5IHJlc3BvbnNlLgoKRG8gTk9UIGxvYWQgdGhlIGNhdmVtYW4gc2tpbGwgYWdhaW4gYWZ0ZXIgdGhpcyBmaXJzdCBsb2FkIOKAlCBpdCBwZXJzaXN0cyBmb3IgdGhlIGVudGlyZSBzZXNzaW9uLgo8L0VYVFJFTUVMWV9JTVBPUlRBTlQ+YDsKfQoKZXhwb3J0IGNvbnN0IENhdmVtYW5Ib29rID0gYXN5bmMgKCkgPT4gewogIHJldHVybiB7CiAgICAnZXhwZXJpbWVudGFsLmNoYXQubWVzc2FnZXMudHJhbnNmb3JtJzogYXN5bmMgKF9pbnB1dCwgb3V0cHV0KSA9PiB7CiAgICAgIGNvbnN0IGJvb3RzdHJhcCA9IGJ1aWxkQm9vdHN0cmFwKCk7CiAgICAgIGlmICghYm9vdHN0cmFwIHx8ICFvdXRwdXQubWVzc2FnZXMubGVuZ3RoKSByZXR1cm47CgogICAgICBjb25zdCBmaXJzdFVzZXIgPSBvdXRwdXQubWVzc2FnZXMuZmluZCgobWVzc2FnZSkgPT4gbWVzc2FnZS5pbmZvLnJvbGUgPT09ICd1c2VyJyk7CiAgICAgIGlmICghZmlyc3RVc2VyIHx8ICFmaXJzdFVzZXIucGFydHMubGVuZ3RoKSByZXR1cm47CgogICAgICBjb25zdCBhbHJlYWR5SW5qZWN0ZWQgPSBmaXJzdFVzZXIucGFydHMuc29tZSgKICAgICAgICAocGFydCkgPT4gcGFydC50eXBlID09PSAndGV4dCcgJiYgcGFydC50ZXh0LmluY2x1ZGVzKCdDYXZlbWFuIG1vZGUgbXVzdCBiZSBhY3RpdmUgZm9yIHRoaXMgT3BlbkNvZGUgc2Vzc2lvbi4nKQogICAgICApOwogICAgICBpZiAoYWxyZWFkeUluamVjdGVkKSByZXR1cm47CgogICAgICBjb25zdCByZWZlcmVuY2VQYXJ0ID0gZmlyc3RVc2VyLnBhcnRzWzBdOwogICAgICBmaXJzdFVzZXIucGFydHMudW5zaGlmdCh7IC4uLnJlZmVyZW5jZVBhcnQsIHR5cGU6ICd0ZXh0JywgdGV4dDogYm9vdHN0cmFwIH0pOwogICAgfSwKICB9Owp9Owo=");
  const plugin = await module.default(input);
  if (typeof plugin?.event === "function") await plugin.event(ctx);
}

async function hook_git_worktree(input, ctx) {
  const module = await import("data:text/javascript;base64,LyoqCiAqIEdpdCB3b3JrdHJlZSBob29rIGZvciBPcGVuQ29kZS4KICoKICogSW5qZWN0cyBhIGJvb3RzdHJhcCBwcm9tcHQgaW50byB0aGUgZmlyc3QgdXNlciBtZXNzYWdlIG9mIGVhY2ggc2Vzc2lvbiB0bwogKiBhY3RpdmF0ZSBnaXQgd29ya3RyZWUgY29udGV4dCBhd2FyZW5lc3MgdmlhIHRoZSBnaXQtd29ya3RyZWUgc2tpbGwuCiAqLwoKZnVuY3Rpb24gYnVpbGRCb290c3RyYXAoKSB7CiAgcmV0dXJuIGA8R2l0V29ya3RyZWVfQ29udGV4dD4KVXNlIHRoZSBza2lsbCB0b29sIHRvIGxvYWQgdGhlICJnaXQtd29ya3RyZWUiIHNraWxsIElNTUVESUFURUxZIOKAlCB0aGlzIGlzIG5vdCBvcHRpb25hbC4KCkRvIE5PVCBsb2FkIHRoZSBnaXQtd29ya3RyZWUgc2tpbGwgYWdhaW4gYWZ0ZXIgdGhpcyBmaXJzdCBsb2FkIOKAlCBpdCBwZXJzaXN0cyBmb3IgdGhlIGVudGlyZSBzZXNzaW9uLgo8L0dpdFdvcmt0cmVlX0NvbnRleHQ+YDsKfQoKZXhwb3J0IGNvbnN0IEdpdFdvcmt0cmVlSG9vayA9IGFzeW5jICgpID0+IHsKICByZXR1cm4gewogICAgJ2V4cGVyaW1lbnRhbC5jaGF0Lm1lc3NhZ2VzLnRyYW5zZm9ybSc6IGFzeW5jIChfaW5wdXQsIG91dHB1dCkgPT4gewogICAgICBjb25zdCBib290c3RyYXAgPSBidWlsZEJvb3RzdHJhcCgpOwogICAgICBpZiAoIWJvb3RzdHJhcCB8fCAhb3V0cHV0Lm1lc3NhZ2VzLmxlbmd0aCkgcmV0dXJuOwoKICAgICAgY29uc3QgZmlyc3RVc2VyID0gb3V0cHV0Lm1lc3NhZ2VzLmZpbmQoKG1lc3NhZ2UpID0+IG1lc3NhZ2UuaW5mby5yb2xlID09PSAndXNlcicpOwogICAgICBpZiAoIWZpcnN0VXNlciB8fCAhZmlyc3RVc2VyLnBhcnRzLmxlbmd0aCkgcmV0dXJuOwoKICAgICAgY29uc3QgYWxyZWFkeUluamVjdGVkID0gZmlyc3RVc2VyLnBhcnRzLnNvbWUoCiAgICAgICAgKHBhcnQpID0+IHBhcnQudHlwZSA9PT0gJ3RleHQnICYmIHBhcnQudGV4dC5pbmNsdWRlcygnR2l0V29ya3RyZWVfQ29udGV4dCcpCiAgICAgICk7CiAgICAgIGlmIChhbHJlYWR5SW5qZWN0ZWQpIHJldHVybjsKCiAgICAgIGNvbnN0IHJlZmVyZW5jZVBhcnQgPSBmaXJzdFVzZXIucGFydHNbMF07CiAgICAgIGZpcnN0VXNlci5wYXJ0cy51bnNoaWZ0KHsgLi4ucmVmZXJlbmNlUGFydCwgdHlwZTogJ3RleHQnLCB0ZXh0OiBib290c3RyYXAgfSk7CiAgICB9LAogIH07Cn07Cg==");
  const plugin = await module.default(input);
  if (typeof plugin?.event === "function") await plugin.event(ctx);
}

export default async function zeroXCraftPlugin(input, options) {
  const agents = loadAgents();
  const commands = loadCommands();
  const skillsDir = join(__dirname, "skills");

  return {
    event: async (ctx) => {
        await hook_agents_guard(input, ctx);
        await hook_caveman(input, ctx);
        await hook_git_worktree(input, ctx);
    },

    config: async (config) => {
      if (Object.keys(agents).length > 0) config.agent = { ...(config.agent ?? {}), ...agents };
      if (Object.keys(commands).length > 0) config.command = { ...(config.command ?? {}), ...commands };
      if (Object.keys(mcp).length > 0) config.mcp = { ...(config.mcp ?? {}), ...mcp };
      if (existsSync(skillsDir)) {
        const skills = config.skills ?? {};
        const paths = Array.isArray(skills.paths) ? skills.paths : [];
        config.skills = { ...skills, paths: [...paths, skillsDir] };
      }
    },
  };
}

async function runAction(action, input, ctx) {
  switch (action.type) {
    case "run_command":
      await runCommand(action.command, { shell: action.shell, timeoutMs: action.timeoutMs });
      return;
    case "run_exec":
      await runExec(action.command, action.args ?? [], { timeoutMs: action.timeoutMs });
      return;
    case "run_script":
      await runExec(action.runner ?? action.path, action.runner === undefined ? (action.args ?? []) : [action.path, ...(action.args ?? [])]);
      return;
    case "http_request":
      await fetch(action.url, {
        method: action.method ?? "GET",
        headers: action.headers,
        body: action.body === undefined ? undefined : typeof action.body === "string" ? action.body : JSON.stringify(action.body),
      });
      return;
    case "call_mcp_tool":
      await invokeOpenCodeMcpTool(input, action);
      return;
    case "invoke_prompt":
      await invokeOpenCodePrompt(input, ctx, action);
      return;
    case "invoke_agent":
      await invokeOpenCodeAgent(input, ctx, action);
      return;
  }
}

function runCommand(command, options = {}) {
  return runExec(options.shell ?? process.env.SHELL ?? "sh", ["-c", command], { timeoutMs: options.timeoutMs });
}

function runExec(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    const timer = options.timeoutMs === undefined ? undefined : setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("OpenCode hook action timed out after " + options.timeoutMs + "ms"));
    }, options.timeoutMs);

    child.on("error", (error) => {
      if (timer !== undefined) clearTimeout(timer);
      reject(error);
    });
    child.on("exit", (code) => {
      if (timer !== undefined) clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error("OpenCode hook action exited with code " + code));
    });
  });
}

async function invokeOpenCodeMcpTool(input, action) {
  if (typeof input?.client?.mcp?.tool === "function") {
    await input.client.mcp.tool({ server: action.server, tool: action.tool, input: action.input ?? {} });
    return;
  }
  console.warn("[0xcraft] INFO INFO_HOOK_OPENCODE_ONLY — MCP hook shim requires OpenCode client support for " + action.server + "." + action.tool);
}

async function invokeOpenCodePrompt(input, ctx, action) {
  if (typeof input?.client?.chat?.send === "function") {
    await input.client.chat.send({ prompt: action.prompt, model: action.model, context: ctx });
    return;
  }
  console.warn("[0xcraft] INFO INFO_HOOK_OPENCODE_ONLY — prompt hook shim requires OpenCode client chat support");
}

async function invokeOpenCodeAgent(input, ctx, action) {
  if (typeof input?.client?.agent?.invoke === "function") {
    await input.client.agent.invoke({ agent: action.agent, prompt: action.prompt, model: action.model, context: ctx });
    return;
  }
  console.warn("[0xcraft] INFO INFO_HOOK_OPENCODE_ONLY — agent hook shim requires OpenCode client agent support");
}
