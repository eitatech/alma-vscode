# agents (module)

> Module-level `requirements.md`. Bounded context: **Conversational Agents** (presentation/integration side).
> Source: `src/features/agents/` (~2,554 LOC, 11 source files).
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`agents` turns `.agent.md` definition files (YAML frontmatter + markdown body) into **VS Code / GitHub Copilot chat participants**. It loads and validates definitions, registers each as a chat participant, routes chat requests to named **tool** handlers, caches the agent's **resources** (prompts/skills/instructions) with hot-reload, and produces structured, sanitized **error** output. 🟢

> Distinct from a running agent *provider* (that is `agent-chat`/`cloud-agents`). Here, an "agent" is a declarative chat participant definition. 🟢

## Responsabilidades

- Discover `.agent.md` files (recursive), parse frontmatter, validate, and auto-inject `/help`. 🟢
- Register each valid agent as a chat participant (icon, followups) and route `@agent /command` requests. 🟢
- Maintain a tool registry of named handlers; execute with validation, timing, and error wrapping. 🟢
- Cache resource content (prompts/skills/instructions) with O(1) lookup and debounced hot-reload. 🟢
- Categorize, sanitize, and format errors into user-facing guidance + technical detail. 🟢

## Regras de Negócio

- **R-AC-10** Agent `id` must be kebab-case `^[a-z0-9-]+$`; ≥1 command required; each command needs `name`/`description`/`tool`; `/help` (tool `agent.help`) is auto-injected if absent; tool names must match `^[a-z0-9.-]+$` and be unique. 🟢 `agent-loader.ts:12,262,272-338,165`; `tool-registry.ts:25,40,47`
- Only `.agent.md` files are processed; the scan is recursive; frontmatter is required (else parse-skip). 🟢 `agent-loader.ts:54,95,154`
- Resource path must be `<dir>/<type>/<name>`; deleted files are evicted on reload. 🟢 `resource-cache.ts:216,229`
- File watcher debounces **500ms** before triggering reload. 🟢 `file-watcher.ts:21`
- **6 error categories**; messages sanitized (paths stripped, capped 200 chars); severity by category. 🟢 `error-formatter.ts:12,270,294`
- If the Copilot Chat API is unavailable, registration is skipped (logged), not fatal. 🟢 `flowcharts/agents.md` §1

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Discover + parse + validate `.agent.md` | Must | `loadAgents(dir)` returns valid `AgentDefinition[]`; invalid ones are logged and skipped |
| RF-02 | Auto-inject `/help` | Must | A definition without `/help` gets one bound to tool `agent.help` (R-AC-10) |
| RF-03 | Register chat participants | Must | Each valid agent becomes a chat participant with icon + followups; duplicates are not re-registered |
| RF-04 | Route chat requests to tools | Must | `@agent /cmd args` resolves the command, loads resources, executes the bound tool |
| RF-05 | Tool registry with unique names | Must | Registering a duplicate tool name throws (R-AC-10) |
| RF-06 | Resource cache + hot-reload | Should | Cache loads in parallel; a file change reloads only affected entries after 500ms debounce |
| RF-07 | Structured error output | Should | Errors are categorized (6), sanitized, and rendered with actionable guidance |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Error messages sanitize filesystem paths and cap length (200 chars) | `error-formatter.ts:270,294` | 🟢 |
| Performance | Resource cache: parallel load + O(1) Map lookup; debounced reload | `resource-cache.ts:43,264`; `file-watcher.ts:21` | 🟢 |
| Confiabilidade | Invalid definitions and missing Chat API degrade gracefully (skip + log) | `agent-loader.ts:243`; `flowcharts/agents.md` §1 | 🟢 |
| Observabilidade | Tool execution timing recorded in response metadata; error telemetry + severity log | `chat-participant-registry.ts`; `error-formatter.ts:294` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um arquivo .agent.md válido sem comando /help
Quando o loader o processa
Então um comando /help é auto-injetado e o agente é registrado como chat participant (R-AC-10)

Dado um .agent.md com id não kebab-case
Quando o loader o valida
Então a validação falha, o agente é ignorado e o erro é logado

Dado dois tools com o mesmo nome
Quando o segundo é registrado
Então o registro lança erro (nomes de tool únicos) (R-AC-10)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Load/validate/register (RF-01, RF-03) | Must | Without it no agent participates in chat |
| Tool routing + registry (RF-04, RF-05) | Must | Commands are useless without execution |
| `/help` injection (RF-02) | Must | Guaranteed baseline command |
| Resource cache + hot-reload (RF-06) | Should | Performance/DX; has cold-path fallback |
| Error formatting (RF-07) | Should | UX quality; not on the critical path |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `agent-loader.ts` | `loadAgents` (26), `parseAgentFile` (143), `validateDefinition` (243) | 🟢 |
| `chat-participant-registry.ts` | `registerAgent` (71), `handleChatRequest` (147) | 🟢 |
| `tool-registry.ts` | `register` (38), `execute` (67) | 🟢 |
| `resource-cache.ts` | `load` (43), `reload` (167), `get` (264) | 🟢 |
| `file-watcher.ts` | `onFileChange` (44) | 🟢 |
| `error-formatter.ts` | `formatError` (49) | 🟢 |
