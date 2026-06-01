# autonomous-task-loop, Design Técnico

> HOW the loop runs. Source: `autonomous-agent-loop.ts` (166), `flowcharts/orchestration.md` §3.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `AutonomousAgentLoopService.startTask` | `(taskId)` | `string \| undefined` (sessionId) | `:67` |
| `AutonomousAgentLoopService.completeTask` | `(taskId, success, errorMessage?)` | `void` | `:103` |
| `AutonomousAgentLoopService.handleRegistryChange` | `()` | `void` | `:140` |

## Fluxo Principal (§3)

1. `startTask` — only from `queued`; generate a `sessionId` (UUID); register an agent-chat session; set `sessionToTaskMap[sessionId]=taskId`; set task `running`. 🟢
2. `completeTask(taskId, success, error?)` — set `completed`/`failed`; fire `orchestration.task-completed`/`task-failed` with the task JSON as `outputContent`. 🟢
3. `handleRegistryChange` — on registry change, map recent sessions to running tasks and mark them completed/failed (heuristic). 🟢/🔴

## Fluxos Alternativos

- **startTask on non-queued task:** returns `undefined`. 🟢

## Dependências

- `agent-chat` (`AgentChatRegistry` / `AgentChatSessionStore`), `tasks` (`NormalizedTask`), `hooks` (`TriggerRegistry`), `node:crypto`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Bridge tasks→sessions via a session⇄task map | `autonomous-agent-loop.ts:67` | 🟢 |
| Fire hooks on task terminal (closes the automation loop) | `:127` | 🟢 |

## Estado Interno

`activeTasks: Map<taskId, NormalizedTask>`, `sessionToTaskMap: Map<sessionId, taskId>`. 🟢

## Observabilidade

`orchestration.task-completed`/`task-failed` hook triggers. 🟢

## Riscos e Lacunas

- 🔴 **Non-canonical session shape** (`:76-86`): builds `{ agentName, messages, systemPrompt, capabilities: {} }`, missing required canonical fields (`agentId`, `agentDisplayName`, `ResolvedCapabilities`, `executionTarget`, `workspaceUri`). A canonical reimplementation must construct a real `AgentChatSession`.
- 🔴 **Bogus terminal check**: `handleRegistryChange` checks `lifecycleState !== "error"`, but `"error"` is not a `SessionLifecycleState` (terminal set: `completed/failed/cancelled/ended-by-shutdown`). Completion detection is provisional ("assuming … means done for now").

> See `../questions.md`.
