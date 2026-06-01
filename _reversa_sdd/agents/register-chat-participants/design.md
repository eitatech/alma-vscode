# register-chat-participants, Design Técnico

> HOW discovery/registration/routing work. Source: `agent-loader.ts` (341), `chat-participant-registry.ts` (488), `flowcharts/agents.md` §1.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `AgentLoader.loadAgents` | `(agentsDir)` | `Promise<AgentDefinition[]>` | recursive — `:26` |
| `AgentLoader.parseAgentFile` | `(filePath)` | `Promise<AgentDefinition>` | gray-matter — `:143` |
| `ChatParticipantRegistry.registerAgent` | `(agent)` | `Disposable \| null` | `:71` |
| `ChatParticipantRegistry.handleChatRequest` | `(request, ctx, stream, token)` | `Promise<void>` | `:147` |

## Fluxo Principal

1. **API check** — if Copilot Chat API missing → log + skip. 🟢
2. **Discover** — `readDirectory` recursive; keep files ending `.agent.md`. 🟢 `agent-loader.ts:54,95`
3. **Parse** — gray-matter frontmatter; require frontmatter present (else parse-error skip). 🟢 `:154`
4. **Build** — extract `id/name/fullName/description/commands/resources`; if no `/help`, inject `agent.help`. 🟢 `:165`
5. **Validate** — `validateDefinition`; invalid → log + skip. 🟢 `:243`
6. **Register** — for each valid agent, if not already registered, `chat.createChatParticipant` + icon + followups; load resources into cache; watch resources dir. 🟢 `:71`
7. **Handle request** — parse command from `@agent /command`; if not found render help; else load resources from cache → `ToolRegistry.execute(name, params)`. 🟢 `:147`
8. **Render** — success: stream markdown + add duration to metadata; failure: wrap `ToolExecutionError` → `formatError` → render user message + guidance + technical details + telemetry. 🟢

## Fluxos Alternativos

- **Frontmatter absent:** parse error logged; file skipped. 🟢
- **Handler missing for a command's tool:** throws with the available-tools list → formatted error. 🟢 (`flowcharts/agents.md` §1, `tools` branch)

## Dependências

- `tool-registry` (execute), `resource-cache` (load/get), `error-formatter` (formatError). 🟢
- External: `vscode` Chat API, `gray-matter`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Idempotent registration (skip already-registered) | `flowcharts/agents.md` §1 | 🟢 |
| Command→tool indirection via the registry | `chat-participant-registry.ts:147` | 🟢 |

## Estado Interno

Active chat-participant `Disposable`s keyed by agent id; the per-agent resource cache. 🟢

## Observabilidade

Duration metadata on success; categorized error telemetry on failure. 🟢

## Riscos e Lacunas

- 🟡 Followup-provider behavior (suggested followups) not detailed here — see `chat-participant-registry.ts`.
