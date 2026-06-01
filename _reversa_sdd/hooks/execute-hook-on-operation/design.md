# execute-hook-on-operation, Design Técnico

> HOW the pipeline runs. Source: `hook-executor.ts` (1735), `command-completion-detector.ts` (289), `actions/*`, `flowcharts/hooks.md` §1–§2 + §4.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `CommandCompletionDetector.initialize` | `()` | void | registers watchers — `:92` |
| `HookExecutor.executeHook` | `(hook, context)` | `Promise<ExecutionResult>` | `:~245` |
| `HookExecutor.expandTemplate` | `(template, context)` | `string` | `:1196` |
| `*ActionExecutor.execute` | `(params, context)` | `Promise<ActionResult>` | `actions/*.ts` |

## Fluxo Principal

1. **Detect**: watcher fires on a file matching an operation pattern → parse-validate → 2 s debounce → `TriggerRegistry.fireTrigger`. 🟢
2. **Pipeline** (`executeHook`):
   - `hook.enabled?` no → `skipped`. 🟢
   - `action.type==mcp` → validate server/tool; invalid → prompt "Update Hook" → stop. 🟢
   - `action.type==custom` → check agent availability; unavailable → prompt Retry/Update/FILE_DELETED → stop. 🟢
   - evaluate `conditions`; unmet → `skipped`. 🟢
   - `schedule`: `delayed` → await `delayMs`; `immediate` → proceed. 🟢
   - build `TemplateContext` + `expandTemplate` args. 🟢
   - dispatch by `action.type`. 🟢
   - on `success` → `executionCount++` + telemetry; `failure` → `ExecutionError`; `timeout` → `ExecutionTimeoutError`. 🟢
   - `recordExecutionLog` (FIFO max 100). 🟢

## Action dispatch (6 types)

| type | executor | notes |
|------|----------|-------|
| `agent` | `agent-action.ts` | run a SpecKit/OpenSpec command |
| `git` | `git-action.ts` | commit/push/branch/etc. via Git extension |
| `github` | `github-action.ts` | GitHub ops via MCP |
| `mcp` | `mcp-action.ts` | invoke an MCP tool (pooled) |
| `custom` | `custom-action.ts` | Copilot/registry agent (local/background) |
| `acp` | `acp-action.ts` | spawn local ACP subprocess (lifecycle §4) |

## ACP action lifecycle

`PENDING → SPAWNING → HANDSHAKE → SESSION_CREATED → PROMPTING → COLLECTING → DONE/TIMEOUT/ERROR`; output collected into `acpAgentOutput`. Errors: `ACPSpawnFailedError`, `ACPProtocolError`, `ACPTimeoutError`, `ACPEmptyResponseError`. 🟢 `actions/acp-action.ts`

## Dependências

- `TriggerRegistry`, the 6 action executors, `template-variable-parser`, MCP services, `services/acp`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Availability pre-checks with interactive remediation prompts | `flowcharts/hooks.md` §2 | 🟢 |
| Template expansion before dispatch (args fully resolved) | `hook-executor.ts:1196` | 🟢 |

## Estado Interno

`executionCount` per hook; the FIFO log buffer; per-execution `TemplateContext`. 🟢

## Observabilidade

`HookExecutionLog` with `contextSnapshot`; telemetry success/failure. 🟢

## Riscos e Lacunas

- 🟡 Template-time `availableFor` gating not enforced (`validateVariables` stub — `../questions.md`).
