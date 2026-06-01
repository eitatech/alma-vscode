# orchestration (module), Tarefas de Implementação

## Pré-requisitos

- [ ] `agent-chat` registry/store + `cloud-agents` storage/registry available
- [ ] `tasks` `NormalizedTask` model + `hooks` `TriggerRegistry` available
- [ ] Decision on the autonomous-loop session shape (see `questions.md`)

## Tarefas

- [ ] T-01, Define read-model types
  - Origem no legado: `orchestration-read-model.ts:15,23,49`
  - Critério de pronto: `OrchestrationSessionProjection`, `OrchestrationSnapshot`, bucket/source enums compile
  - Confiança: 🟢

- [ ] T-02, Implement `OrchestrationReadModel.snapshot` (aggregate + bucket + sort)
  - Origem no legado: `orchestration-read-model.ts:129,178,207,397-461`
  - Critério de pronto: merges both sources (registry wins), buckets, sorts by rank+recency, degradedReasons (R-OR-1, R-OR-2)
  - Confiança: 🟢

- [ ] T-03, Implement `onDidChange` re-emission
  - Origem no legado: `orchestration-read-model.ts:120`
  - Critério de pronto: upstream store changes propagate
  - Confiança: 🟢

- [ ] T-04, Implement the autonomous loop (claim/start/complete/sync)
  - Origem no legado: `autonomous-agent-loop.ts:35,67,103,140`
  - Critério de pronto: eligibility (R-OR-3); spawn + map; terminal sync; fire hooks (R-OR-4)
  - Confiança: 🟡 — depends on `questions.md` resolution

## Tarefas de Teste

- [ ] TT-01, Snapshot merges + buckets + sorts (R-OR-1)
- [ ] TT-02, Missing cloud wiring → degradedReasons, no throw (R-OR-2)
- [ ] TT-03, claimTask concurrency gate via parallelizable (R-OR-3)
- [ ] TT-04, Task terminal fires the correct hook (R-OR-4)

## Ordem Sugerida

1. T-01 → T-02 → T-03 (read-model first; it's solid).
2. T-04 (loop) only after resolving the session-shape gap.

## Lacunas Pendentes (🔴)

- 🔴 Reconcile the autonomous-loop `AgentChatSession` shape + completion detection with canonical `agent-chat` types (see `questions.md`).
