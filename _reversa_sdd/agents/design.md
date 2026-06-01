# agents (module), Design Técnico

> Module-level `design.md`. Source: `src/features/agents/`. Confidence: 🟢 unless noted.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `AgentLoader.loadAgents` | `(agentsDir)` | `Promise<AgentDefinition[]>` | recursive discovery — `agent-loader.ts:26` |
| `AgentLoader.parseAgentFile` | `(filePath)` | `Promise<AgentDefinition>` | gray-matter frontmatter — `:143` |
| `AgentLoader.validateDefinition` | `(agent)` | `ValidationResult` | `:243` |
| `ChatParticipantRegistry.registerAgent` | `(agent)` | `Disposable \| null` | `chat-participant-registry.ts:71` |
| `ChatParticipantRegistry.handleChatRequest` | request handler | stream output | `:147` |
| `ToolRegistry.register` / `execute` | `(name, handler)` / `(name, params, ctx)` | `void` / `Promise<ToolResponse>` | `tool-registry.ts:38/67` |
| `ResourceCache.load` / `reload` / `get` | cache lifecycle | `Promise<void>` / content | `resource-cache.ts:43/167/264` |
| `FileWatcher.onFileChange` | `(uri)` | debounced collector | `file-watcher.ts:44` |
| `formatError` | `(error, context?)` | `FormattedError` | `error-formatter.ts:49` |

## Tipos de domínio (catálogo)

| Tipo | Local | Forma |
|------|-------|-------|
| `AgentDefinition` | `types.ts:14` | `id` (kebab), `name`, `fullName`, `description`, `icon?`, `commands[]`, `resources`, `filePath`, `content` |
| `AgentCommand` | `types.ts:46` | `name`, `description`, `tool`, `parameters?` |
| `AgentResourceRefs` | `types.ts:63` | `{ prompts?, skills?, instructions? }` (string[]) |
| `AgentResources` | `types.ts:135` | `{ prompts/skills/instructions: Map<string,string> }` (resolved content) |
| `ToolExecutionContext` | `types.ts:101` | `agent`, `workspace`, `vscode`, `chatContext`, `outputChannel`, `telemetry` |
| `ToolResponse` | `types.ts:149` | `{ content, files?, metadata? }` |
| `FormattedError` | `error-formatter.ts:26` | `{ userMessage, technicalDetails, category, actionableGuidance?, code? }` |
| `ErrorCategory` | `error-formatter.ts:12` | `VALIDATION\|RESOURCE\|EXECUTION\|CANCELLATION\|TIMEOUT\|UNKNOWN` |
| Error classes | `types.ts:255` | `AgentError`, `ToolExecutionError{tool,cause?}`, `ResourceError{resourceType,resourceName}` |
| `ValidationResult` | `types.ts:244` | `{ valid, errors[] }` |

## Fluxo Principal (visão de módulo)

1. On init, check Copilot Chat API availability; if absent, log + skip. 🟢
2. `loadAgents(dir)` recursively reads `.agent.md`, parses frontmatter, builds `AgentDefinition`, auto-injects `/help`, validates. 🟢
3. For each valid agent, `registerAgent` creates a chat participant (icon, followups) and loads resources into the cache; a `FileWatcher` watches the resources dir. 🟢
4. On `@agent /command`, `handleChatRequest` parses the command, loads cached resources, and calls `ToolRegistry.execute`. 🟢
5. The tool handler runs with timing; success streams markdown + duration metadata; failure is wrapped/formatted and rendered with guidance + telemetry. 🟢

> Detailed flows in use-case folders: `register-chat-participants/`, `resource-hot-reload/`, `tool-execution/`.

## State machines (3)

See `flowcharts/agents.md`:
- **Agent lifecycle** — `unloaded → loaded → registered → executing → completed/error` (invalid agents logged, not registered).
- **Resource cache** — `empty → loaded → pending-reload → reloading → loaded`.
- **Tool execution** — `validating → found → executing → completed/failed`.

## Dependências

- `services` — agent-service orchestrator + configuration-service. 🟢
- `prompts` — resource content. 🟢
- External: `vscode` (Chat API, `workspace.fs`, `FileSystemWatcher`), `gray-matter`, `node:path`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Declarative `.agent.md` (frontmatter) as the agent contract | `agent-loader.ts:143` | 🟢 |
| Tool registry as the indirection between commands and behavior | `tool-registry.ts` | 🟢 |
| Incremental, debounced hot-reload instead of full re-scan | `file-watcher.ts:21`; `resource-cache.ts:167` | 🟢 |
| Centralized error categorization + path sanitization | `error-formatter.ts:12,270` | 🟢 |

## Estado Interno

`ResourceCache` holds three `Map<string,string>` (prompts/skills/instructions) + a pending-changes set for the debounce. The registry holds active chat-participant `Disposable`s keyed by agent id. 🟢

## Observabilidade

Tool execution duration added to `ToolResponse.metadata`; error telemetry with severity by category. 🟢 `error-formatter.ts:294`

## Riscos e Lacunas

- 🟡 `parameters` on `AgentCommand` accepts either a string or a structured array — confirm how each is interpreted by handlers.
