# provider-selection, Tarefas de Implementação

## Pré-requisitos

- [ ] Providers registered with the `TaskService`

## Tarefas

- [ ] T-01, Implement `canHandle` for both providers
  - Origem no legado: `speckit-task-provider.ts:12`; `openspec-task-provider.ts:12`
  - Critério de pronto: openspec/ → OpenSpec; .specify/specs (not openspec) → SpecKit (R-SP-13)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, openspec/ path → OpenSpec (R-SP-13)
- [ ] TT-02, specs/ path → SpecKit (R-SP-13)
- [ ] TT-03, unrelated path → no match

## Ordem Sugerida

1. T-01.

## Lacunas Pendentes (🔴)

None. 🟡 confirm ordering when both signals present.
