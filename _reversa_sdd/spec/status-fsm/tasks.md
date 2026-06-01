# status-fsm, Tarefas de Implementação

## Pré-requisitos

- [ ] Review-flow types + state store (see `../tasks.md` T-01, T-05)

## Tarefas

- [ ] T-01, Implement the transition table + `validateStatusTransition`
  - Origem no legado: `review-flow/state.ts:128-143`
  - Critério de pronto: only allowed edges accepted (R-SP-1)
  - Confiança: 🟢

- [ ] T-02, Implement `normalizeStatus` (legacy alias)
  - Origem no legado: `review-flow/state.ts:146-151`
  - Critério de pronto: `readyToReview` → `review`
  - Confiança: 🟢

- [ ] T-03, Implement `updateSpecStatus` (apply + stamp + persist)
  - Origem no legado: `review-flow/state.ts:271,299-306`
  - Critério de pronto: stamps review/archived dates; persists; fires telemetry (R-SP-3)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Valid edge accepted; invalid rejected (R-SP-1)
- [ ] TT-02, readyToReview normalized to review (R-SP-1)
- [ ] TT-03, review entry stamps completedAt + reviewEnteredAt (R-SP-3)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
