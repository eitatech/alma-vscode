# orchestration (module), Design Técnico

> Module-level `design.md`. Source: `src/features/orchestration/`. Confidence: 🟢 unless noted.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `OrchestrationReadModel.snapshot` | `()` | `Promise<OrchestrationSnapshot>` | `:129` |
| `OrchestrationReadModel.onDidChange` | `(listener)` | `Disposable` | re-emits upstream — `:120` |
| `AutonomousAgentLoopService.claimTask` | `(task: NormalizedTask)` | `boolean` | `:35` |
| `AutonomousAgentLoopService.startTask` | `(taskId)` | `string \| undefined` (sessionId) | `:67` |
| `AutonomousAgentLoopService.completeTask` | `(taskId, success, errorMessage?)` | `void` | `:103` |
| `AutonomousAgentLoopService.handleRegistryChange` | `()` | `void` | terminal sync — `:140` |

## Tipos de domínio (catálogo)

| Tipo | Local | Forma |
|------|-------|-------|
| `OrchestrationSessionProjection` | `orchestration-read-model.ts:23` | `id` (`agent-chat:<id>`/`cloud-agent:<localId>`), `source`, `title`, `state`, `bucket`, `lastVisibleActivityAt`, `isBlocked`, `openSessionCommand` |
| `OrchestrationSnapshot` | `:49` | `{ sessions[], cloudProviderRegistryAvailable, cloudProviderCount, activeProvider?, generatedAt, degradedReasons[] }` |
| `OrchestrationSessionBucket` | `:15` | `active\|waiting\|completed\|failed` |
| autonomous loop state | `autonomous-agent-loop.ts` | in-memory `activeTasks: Map<taskId,NormalizedTask>`, `sessionToTaskMap: Map<sessionId,taskId>` |

> `NormalizedTask` + `TaskExecutionMetadata` belong to the `tasks` module.

## Fluxo Principal (visão de módulo)

1. **Read-model** — `snapshot` collects from agent-chat (active+recent, registry wins) and cloud (if wired), projects to unified shape, buckets, sorts, attaches `degradedReasons`. 🟢 (→ `aggregate-snapshot/`)
2. **Loop** — `claimTask` (eligibility) → `startTask` (spawn session, map) → `completeTask`/`handleRegistryChange` (terminal sync) → fire hook. 🟢 (→ `autonomous-task-loop/`, `claim-task/`)

## State machines (2)

See `flowcharts/orchestration.md`:
- **Session bucket** (§2): agent-chat & cloud lifecycle each mapped to `active/waiting/completed/failed`.
- **Autonomous task** (§3): `ready → queued → running → completed/failed`.

## Dependências

- `agent-chat` (`AgentChatRegistry`, `AgentChatSessionStore`, types), `cloud-agents` (`AgentSessionStorage`, `ProviderRegistry`), `tasks` (`NormalizedTask`), `hooks` (`TriggerRegistry`). 🟢
- Consumed by `providers/orchestration-view-provider.ts`, `extension.ts`. 🟢
- External: `vscode` (`EventEmitter`), `node:crypto`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Read-model pattern (pure projection, no own persistence) | `orchestration-read-model.ts` | 🟢 |
| Graceful degradation via `degradedReasons` (never throw) | `orchestration-read-model.ts:189` | 🟢 (ADR-0015) |
| Registry-wins-over-store de-dup by id | `orchestration-read-model.ts:136` | 🟢 |

## Estado Interno

Read-model is stateless (reads upstream). The loop holds two in-memory maps. 🟢

## Observabilidade

`onDidChange` events; hook triggers on task terminal. 🟢

## Riscos e Lacunas

- 🔴 `autonomous-agent-loop` builds a **non-canonical** `AgentChatSession` and checks `lifecycleState !== "error"` (`"error"` is not a valid state). See `questions.md`.
- 🟡 MAESTRO is prototype-stage; the loop is an early implementation.
