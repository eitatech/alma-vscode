# trigger-matching-and-blocking, Tarefas de Implementação

## Pré-requisitos

- [ ] `executeHook` pipeline + hook store implemented (see `../execute-hook-on-operation/`, `../tasks.md`)

## Tarefas

- [ ] T-01, Implement match + deterministic sort
  - Origem no legado: `hook-executor.ts:835-858`
  - Critério de pronto: enabled hooks matching agent+op+timing (legacy or normalized), sorted by createdAt (R-HK-1)
  - Confiança: 🟢

- [ ] T-02, Implement blocking decision
  - Origem no legado: `hook-executor.ts:873-882`
  - Critério de pronto: `before` + `waitForCompletion` awaits before proceeding; else non-blocking (R-HK-2)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Two matching hooks run in createdAt order (R-HK-1)
- [ ] TT-02, before+waitForCompletion blocks the operation (R-HK-2)
- [ ] TT-03, No matches → operation proceeds

## Ordem Sugerida

1. T-01 → T-02.

## Lacunas Pendentes (🔴)

None. 🟡 decide intended parallelism for the non-blocking branch.
