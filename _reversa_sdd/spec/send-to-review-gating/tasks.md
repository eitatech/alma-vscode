# send-to-review-gating, Tarefas de Implementação

## Pré-requisitos

- [ ] FSM (`updateSpecStatus`) implemented (see `../status-fsm/`)
- [ ] Spec pending-count fields available

## Tarefas

- [ ] T-01, Implement `canSendToReview` (blocker accumulation)
  - Origem no legado: `review-flow/state.ts:887-929`
  - Critério de pronto: not-found / wrong-status / pending-tasks / pending-checklist blockers (R-SP-2)
  - Confiança: 🟢

- [ ] T-02, Implement `sendToReview` (+ trigger variant)
  - Origem no legado: `review-flow/state.ts:937,657`
  - Critério de pronto: no blockers → transition to review + transition event
  - Confiança: 🟢

- [ ] T-03, Implement forced exit on pending items
  - Origem no legado: `review-flow/state.ts:522-544`
  - Critério de pronto: pending during review → reopened (blockers) / current + warning (R-SP-6)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Pending tasks block with count (R-SP-2)
- [ ] TT-02, Clean current spec transitions to review
- [ ] TT-03, Pending-during-review forces exit (R-SP-6)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None. 🟡 confirm who updates pending counts.
