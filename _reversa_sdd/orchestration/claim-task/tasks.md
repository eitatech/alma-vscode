# claim-task, Tarefas de Implementação

## Pré-requisitos

- [ ] `tasks` `NormalizedTask` with `execution: TaskExecutionMetadata` available
- [ ] `activeTasks` map + `onDidChange` emitter

## Tarefas

- [ ] T-01, Implement `claimTask` eligibility + claim
  - Origem no legado: `autonomous-agent-loop.ts:35,37-51`
  - Critério de pronto: reject running/completed; concurrency gate via `parallelizable`; clone→queued→add→fire→true (R-OR-3)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, running/completed → false (R-OR-3)
- [ ] TT-02, another running + not parallelizable → false (R-OR-3)
- [ ] TT-03, ready task → queued + true + onDidChange fired

## Ordem Sugerida

1. T-01.

## Lacunas Pendentes (🔴)

None. 🟡 confirm whether a max-concurrency cap should bound parallelizable tasks.
