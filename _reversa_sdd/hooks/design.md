# hooks (module), Design Técnico

> Module-level `design.md`. Source: `src/features/hooks/`. Confidence: 🟢 unless noted.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `HookManager.createHook` / `updateHook` / `deleteHook` | CRUD | `Promise<Hook>` / void | `hook-manager.ts:132/194/254` |
| `HookManager.validateHook` | `(hook)` | `Promise<ValidationResult>` | sync + async — `:500` |
| `HookManager.loadHooks` / `migrateHook` | load + migrate | `Hook[]` | `:355/389` |
| `HookExecutor.executeHooksForTrigger` | `(agent, operation, timing, event?)` | `Promise<ExecutionResult[]>` | `:823` |
| `HookExecutor.executeHook` | `(hook, context)` | `Promise<ExecutionResult>` | `:~245` |
| `HookExecutor.expandTemplate` | `(template, context)` | `string` | `:1196` |
| `TriggerRegistry.fireTrigger` | `(agent, operation, timing)` | void | `trigger-registry.ts:57` |
| `CommandCompletionDetector.initialize` | `()` | void | `command-completion-detector.ts:92` |

## Tipos de domínio (catálogo)

| Tipo | Local | Forma |
|------|-------|-------|
| `Hook` | `types.ts:16` | `id` (UUIDv4), `name` (≤100, unique), `enabled`, `trigger?` (legacy), `events?`, `conditions?`, `schedule?`, `action`, `executionCount` |
| `EventSource` | `types.ts:54` | `{type: agent-operation\|execution-flow\|repository\|file-change\|manual, agent?, operation?, timing?, waitForCompletion?, hookId?, flowEvent?, pattern?}` |
| `Condition` | `types.ts:70` | `{type: branch\|file-exists\|custom, pattern?, filePath?, expression?}` |
| `Schedule` | `types.ts:80` | `{type: immediate\|delayed\|cron, delayMs?, cronExpression?}` |
| `ActionConfig` | `types.ts:139` | `{type: ActionType, parameters: ActionParameters}` (6 param unions — see `contracts.md`) |
| `HookExecutionLog` | `types.ts:472` | `{id, hookId, executionId, chainDepth, status, duration?, contextSnapshot}` |
| `ExecutionContext` | `types.ts:515` | `{executionId, chainDepth, executedHooks: Set<string>, startedAt}` |
| `TemplateContext` | `types.ts:525` | `{feature?, branch?, timestamp?, user?, agentOutput?, clipboardContent?, outputPath?, acpAgentOutput?}` |
| `TriggerEvent` | `types.ts:540` | `{agent, operation, timestamp, timing?, outputPath?, outputContent?}` |

Enums: `AgentType` (speckit/openspec/orchestration), `OperationType` (15 ops), `TriggerTiming` (before/after), `ActionType` (6), `ExecutionStatus` (success/failure/skipped/timeout), `ACPExecutionState` (9 states). 🟢

## Fluxo Principal (visão de módulo)

1. An operation completes → `CommandCompletionDetector` (watcher + parse + 2 s debounce) → `TriggerRegistry.fireTrigger`. 🟢
2. `onTrigger` → `HookExecutor.executeHooksForTrigger` matches enabled hooks (agent+op+timing), sorts by `createdAt`, creates a shared `ExecutionContext`. 🟢
3. Per hook → `executeHook`: enabled? → availability pre-check (MCP/custom) → conditions → schedule → dispatch by action type → success/failure/timeout → record log. 🟢
4. Chain guard prevents re-entry (cycle) and depth >10. 🟢

> Detailed flows: `execute-hook-on-operation/`, `trigger-matching-and-blocking/`, `execution-chain-guard/`, `hook-load-migration/`.

## State machines (3)

See `flowcharts/hooks.md`:
- **Execution pipeline** (§2): `enabled? → availability → conditions → schedule → dispatch → success/failure/timeout → log`.
- **ACP action lifecycle** (§4): `PENDING → SPAWNING → HANDSHAKE → SESSION_CREATED → PROMPTING → COLLECTING → DONE/TIMEOUT/ERROR`.
- **Execution-chain guard** (§6): root → running → {chained | blocked_cycle | blocked_depth}.

## Dependências

- `agents` (`.agent.md` defs), `services` (config, ACP client/registry), `prompts`, `utils` (task-parser). 🟢
- Consumed by `commands`, `providers` (hooks tree), `panels`, and `orchestration`/`tasks` (fire `task-completed`/`task-failed`). 🟢
- External: `vscode` (`workspaceState`, `FileSystemWatcher`, Git extension API, `LanguageModel` API), `node:crypto`, `node:child_process` (ACP), GitHub MCP server. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Normalized event model (`events[]`) superseding legacy `trigger`, kept for migration | `types.ts:54`; `hook-manager.ts:389` | 🟢 (ADR-0011) |
| Completion via filesystem watchers + parse-validate, not command dispatch | `command-completion-detector.ts:27` | 🟢 |
| Per-execution chain context (cycle set + depth) | `hook-executor.ts:908` | 🟢 |
| Template variables gated per trigger via `availableFor` | `template-variable-constants.ts:73` | 🟢 |

## Estado Interno

In-memory `hooks: Hook[]` (loaded/migrated from `workspaceState`); FIFO execution-log buffer (max 100); trigger history (max 50); MCP discovery cache (TTL 5 min). 🟢

## Observabilidade

`HookExecutionLog` per execution with `contextSnapshot`; telemetry success/failure; `DevinProgressEvent`-style trigger history. 🟢

## Riscos e Lacunas

- 🔴 `TemplateVariableParser.validateVariables` is a **stub** (always valid, TODO Phase 4) — `availableFor` gating is not enforced at parse time. See `questions.md`.
- 🟡 `executeHooksForTrigger` non-blocking branch is commented "parallel" but `await`s sequentially (`hook-executor.ts:884-895`) — effectively sequential.
