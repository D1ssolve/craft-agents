// 0xcraft-generated OpenCode plugin (plugin mode)
import { spawn } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mcp = {
  "context7": {
    "headers": {
      "Authorization": "Bearer ctx7sk-31fe72c1-712e-47d6-903e-1b439794d138"
    },
    "type": "remote",
    "url": "https://mcp.context7.com/mcp"
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
const hookFactoryNames = [
  "hook_agents_guard",
  "hook_caveman",
  "hook_git_worktree"
];
const passthroughHookKeys = [
  "auth",
  "chat.headers",
  "chat.message",
  "chat.params",
  "command.execute.before",
  "dispose",
  "experimental.chat.messages.transform",
  "experimental.chat.system.transform",
  "experimental.compaction.autocontinue",
  "experimental.session.compacting",
  "experimental.text.complete",
  "permission.ask",
  "provider",
  "shell.env",
  "tool",
  "tool.definition",
  "tool.execute.after",
  "tool.execute.before"
];

function loadAgents() {
  const agents = {};
  const agentsDir = join(__dirname, "agents");
  if (!existsSync(agentsDir)) return agents;

  for (const entry of readdirSync(agentsDir, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const agentId = entry.name.slice(0, -3);
    const filePath = join(agentsDir, entry.name);
    const { data, body } = parseFrontmatter(readFileSync(filePath, "utf8"));
    const referencesDir = join(__dirname, "agents", agentId, "references");
    agents[agentId] = {
      ...resolveReferenceTokensInValue(data, referencesDir),
      prompt: resolveReferenceTokens(body, referencesDir),
    };
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

function resolveReferenceTokensInValue(value, referencesDir) {
  if (typeof value === "string") return resolveReferenceTokens(value, referencesDir);
  if (Array.isArray(value)) return value.map((item) => resolveReferenceTokensInValue(item, referencesDir));
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        resolveReferenceTokens(key, referencesDir),
        resolveReferenceTokensInValue(nestedValue, referencesDir),
      ]),
    );
  }
  return value;
}

async function hook_agents_guard(input, options) {
  const module = await import(join(__dirname, "hooks", "agents-guard.js"));
  if (typeof module.default !== "function") return {};
  const plugin = await module.default(input, options);
  return plugin !== null && typeof plugin === "object" ? plugin : {};
}

async function hook_caveman(input, options) {
  const module = await import(join(__dirname, "hooks", "caveman.js"));
  if (typeof module.default !== "function") return {};
  const plugin = await module.default(input, options);
  return plugin !== null && typeof plugin === "object" ? plugin : {};
}

async function hook_git_worktree(input, options) {
  const module = await import(join(__dirname, "hooks", "git-worktree.js"));
  if (typeof module.default !== "function") return {};
  const plugin = await module.default(input, options);
  return plugin !== null && typeof plugin === "object" ? plugin : {};
}

export default async function zeroXCraftPlugin(input, options) {
  const agents = loadAgents();
  const commands = loadCommands();
  const skillsDir = join(__dirname, "skills");
  const hookPlugins = [];

  for (const hookFactoryName of hookFactoryNames) {
    const hookFactory = { hook_agents_guard, hook_caveman, hook_git_worktree }[hookFactoryName];
    if (typeof hookFactory !== "function") continue;
    const hookPlugin = await hookFactory(input, options);
    if (hookPlugin !== null && typeof hookPlugin === "object") hookPlugins.push(hookPlugin);
  }

  const plugin = {
    event: async (ctx) => {
      await runHookHandlers(hookPlugins, "event", [ctx]);
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

      const configured = await runHookHandlers(hookPlugins, "config", [config]);
      if (configured !== undefined && configured !== null && typeof configured === "object") {
        Object.assign(config, configured);
      }
    },
  };

  for (const key of passthroughHookKeys) {
    if (hookPlugins.some((hp) => typeof hp[key] === "function")) {
      plugin[key] = async (...args) => runHookHandlers(hookPlugins, key, args);
    }
  }

  return plugin;
}

async function runHookHandlers(hookPlugins, key, args) {
  let nextArgs = args;
  let result;
  let hasResult = false;

  for (const hookPlugin of hookPlugins) {
    const handler = hookPlugin?.[key];
    if (typeof handler !== "function") continue;
    const value = await handler(...nextArgs);
    if (value !== undefined) {
      result = value;
      hasResult = true;
      nextArgs = [value, ...nextArgs.slice(1)];
    }
  }

  return hasResult ? result : undefined;
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
