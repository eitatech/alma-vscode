# autonomous-task-loop (use-case)

> Use-case under `orchestration`. Bridges Kanban tasks to spawned agent-chat sessions. 🟡 prototype.
> Source: `autonomous-agent-loop.ts`, `flowcharts/orchestration.md` §3.

## Visão Geral

Starts a claimed task by spawning an agent-chat session, maps `sessionId ⇄ taskId`, and on session terminal (or manual completion) marks the task completed/failed and fires the corresponding `orchestration` hook trigger. 🟡 This is an early implementation with a known 🔴 gap (see `questions.md`).

## Responsabilidades

- `startTask`: only from `queued`; generate `sessionId`, register an agent-chat session, map session⇄task, set `running`. 🟢
- `completeTask`: mark completed/failed and fire the hook with task JSON. 🟢
- `handleRegistryChange`: sync terminal agent sessions back to task state (heuristic). 🟢/🔴

## Regras de Negócio

- **R-OR-3** `startTask` only proceeds from `queued`. 🟢 `autonomous-agent-loop.ts:67`
- **R-OR-4** On task terminal, fire `orchestration.task-completed`/`task-failed` with the task JSON as `outputContent`. 🟢 `autonomous-agent-loop.ts:127-138`
- 🔴 `handleRegistryChange` treats any mapped recent session as terminal and checks `lifecycleState !== "error"` — `"error"` is **not** a canonical `SessionLifecycleState`. 🔴 `autonomous-agent-loop.ts:140`
- 🔴 The constructed `AgentChatSession` (`:76-86`) uses a simplified shape that does not match the canonical type. 🔴

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Start from queued | Must | `startTask(taskId)` returns a `sessionId` only when the task is `queued`; sets `running` |
| RF-02 | Session⇄task mapping | Must | `sessionToTaskMap` links the spawned session to the task |
| RF-03 | Complete task | Must | `completeTask(taskId, success, error?)` sets terminal state and fires the hook (R-OR-4) |
| RF-04 | Terminal sync | Should | `handleRegistryChange` maps terminal sessions to task completion (🔴 heuristic) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Observabilidade | Hook trigger carries the task JSON for downstream automation | `autonomous-agent-loop.ts:127` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma task em estado queued
Quando startTask é chamado
Então um agent-chat session é spawnado, mapeado e a task vai para running (R-OR-3)

Dado uma task running concluída
Quando completeTask(true) é chamado
Então a task vira completed e orchestration.task-completed é disparado (R-OR-4)
```

> 🔴 The acceptance for RF-04 (terminal sync) cannot be guaranteed until the session-shape / completion-detection gap is resolved (see `questions.md`).

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Start + map + complete (RF-01–RF-03) | Must | Core loop |
| Terminal sync (RF-04) | Should | 🔴 heuristic; needs reconciliation |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `autonomous-agent-loop.ts` | `startTask` (67), `completeTask` (103), `handleRegistryChange` (140), session build (76-86) | 🟢 / 🔴 |
