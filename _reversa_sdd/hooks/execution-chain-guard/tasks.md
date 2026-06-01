# execution-chain-guard, Tarefas de Implementação

## Pré-requisitos

- [ ] `ExecutionContext` type + `MAX_CHAIN_DEPTH` constant defined (see `../tasks.md` T-01)
- [ ] `executeHook` pipeline available

## Tarefas

- [ ] T-01, Implement `createExecutionContext`
  - Origem no legado: `hook-executor.ts:908`
  - Critério de pronto: fresh executionId, depth 0, empty executedHooks
  - Confiança: 🟢

- [ ] T-02, Implement cycle + depth guards
  - Origem no legado: `hook-executor.ts:920,927`
  - Critério de pronto: re-entry → `CircularDependencyError`; depth≥10 → `MaxDepthExceededError` (R-HK-3)
  - Confiança: 🟢

- [ ] T-03, Wire depth increment on chaining
  - Origem no legado: `flowcharts/hooks.md` §6
  - Critério de pronto: chained hook runs with depth+1 and inherited set
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Self-triggering hook → CircularDependencyError (R-HK-3)
- [ ] TT-02, 11-deep chain → MaxDepthExceededError (R-HK-3)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
