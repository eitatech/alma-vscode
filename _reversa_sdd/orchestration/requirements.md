# orchestration (module)

> Module-level `requirements.md`. Bounded context: **Orchestration (MAESTRO)**. Spec lineage: `017-maestro-orchestration`.
> Source: `src/features/orchestration/` (~628 LOC, 2 files). Complexity: medium. 🟡 prototype-stage.
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`orchestration` is the thin backend behind the MAESTRO dashboard / Kanban board. Two responsibilities: (1) a **read-model** aggregating live sessions from `agent-chat` and `cloud-agents` into one bucketed `OrchestrationSnapshot`; and (2) an **autonomous agent loop** that bridges Kanban tasks (`tasks/NormalizedTask`) to spawned `agent-chat` sessions and fires `hooks` triggers on task completion/failure. The Kanban/composer UI lives in `webview-orchestration`. 🟢

## Responsabilidades

- Aggregate agent-chat + cloud sessions into `OrchestrationSessionProjection[]` with buckets. 🟢
- Surface `degradedReasons` (graceful degradation) when upstream wiring is missing. 🟢
- Re-emit `onDidChange` from upstream stores. 🟢
- Claim, start, and complete autonomous tasks; map `sessionId ⇄ taskId`. 🟢
- Fire `orchestration.task-completed`/`task-failed` hook triggers. 🟢

## Regras de Negócio

- **R-OR-1** Snapshot merges agent-chat (active+recent; registry wins over store by id) and cloud sessions, sorted by bucket rank then `lastVisibleActivityAt` desc. 🟢 `orchestration-read-model.ts:136-142,441-461`
- **R-OR-2** Missing wiring (cloud storage/provider) yields `degradedReasons` instead of throwing. 🟢 `orchestration-read-model.ts:189,211,233`
- **R-OR-3** `claimTask` rejects running/completed tasks; rejects a second concurrent task unless `execution.parallelizable`. `startTask` only proceeds from `queued`. 🟢 `autonomous-agent-loop.ts:37-51,67`
- **R-OR-4** On a task reaching terminal, fire `orchestration.task-completed`/`task-failed` with the task JSON as `outputContent`. 🟢 `autonomous-agent-loop.ts:127-138`
- Bucket rank: active(0) → waiting(1) → completed(2) → failed(3). 🟢 `orchestration-read-model.ts:451-461`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Aggregate snapshot | Must | `snapshot()` returns sessions from both sources, bucketed + sorted (R-OR-1) |
| RF-02 | Graceful degradation | Must | Missing cloud wiring → `degradedReasons`, no throw (R-OR-2) |
| RF-03 | Change propagation | Should | `onDidChange` re-emitted from upstream stores |
| RF-04 | Claim task | Must | rejects running/completed; concurrency gated by `parallelizable` (R-OR-3) |
| RF-05 | Start task | Must | only from `queued`; spawns an agent-chat session; maps session⇄task; sets `running` |
| RF-06 | Complete task | Must | manual or session-terminal sync sets completed/failed and fires the hook (R-OR-4) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Resiliência | Read-model never throws on missing wiring (degradedReasons) | `orchestration-read-model.ts:189` | 🟢 |
| Observabilidade | Task terminal states fire hook triggers carrying task JSON | `autonomous-agent-loop.ts:127` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado sessões em agent-chat e cloud-agents
Quando snapshot() é chamado
Então retorna projeções unificadas, agrupadas por bucket e ordenadas por recência (R-OR-1)

Dado que o storage de cloud não está disponível
Quando snapshot() roda
Então degradedReasons contém uma razão legível e nenhuma exceção é lançada (R-OR-2)

Dado uma task já running
Quando claimTask é chamado para outra task não-paralelizável
Então retorna false (R-OR-3)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Snapshot + degradation (RF-01, RF-02) | Must | The dashboard read-model |
| Claim/start/complete (RF-04–RF-06) | Must | The autonomous loop (🟡 prototype) |
| Change propagation (RF-03) | Should | Live UI updates |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `orchestration-read-model.ts` | `snapshot` (129), `collectAgentChatSessions` (178), `collectCloudSessions` (207), bucket/sort (397-461) | 🟢 |
| `autonomous-agent-loop.ts` | `claimTask` (35), `startTask` (67), `completeTask` (103), `handleRegistryChange` (140) | 🟢 / 🔴 (see `questions.md`) |

> See `questions.md` for the 🔴 non-canonical session shape + non-existent `"error"` state gap.
