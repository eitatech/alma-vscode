# change-request-lifecycle, Tarefas de Implementação

## Pré-requisitos

- [ ] FSM + state store + duplicate-guard implemented (see `../tasks.md`)
- [ ] A tasks-prompt payload builder; (🔴) a real tasks generator to replace the mock

## Tarefas

- [ ] T-01, Implement `createChangeRequest` (dedupe → add → reopen)
  - Origem no legado: `change-requests-service.ts:34`; `duplicate-guard.ts:53`; `state.ts:351`
  - Critério de pronto: dup rejected; CR open+blocker; spec → reopened (R-SP-4, R-SP-8)
  - Confiança: 🟢

- [ ] T-02, Implement task attach + status updates + blocker toggling
  - Origem no legado: `state.ts:768,824,799,853-867`
  - Critério de pronto: attach → inProgress; all done → addressed (blocker cleared); revert → inProgress (R-SP-4)
  - Confiança: 🟢

- [ ] T-03, Implement auto-return to review
  - Origem no legado: `state.ts:447,477`
  - Critério de pronto: all addressed + tasks done + zero pending → review (R-SP-7)
  - Confiança: 🟢

- [ ] T-04, Implement dispatch CR→tasks (replace mock with real generator)
  - Origem no legado: `tasks-dispatch.ts:76-134`
  - Critério de pronto: build payload → dispatch → convert → attach; **mock removed** (see `../questions.md`)
  - Confiança: 🔴

## Tarefas de Teste

- [ ] TT-01, Duplicate CR title rejected (R-SP-8)
- [ ] TT-02, Create CR reopens spec (R-SP-4)
- [ ] TT-03, All tasks done → CR addressed, blocker cleared (R-SP-4)
- [ ] TT-04, Auto-return to review when conditions met (R-SP-7)

## Ordem Sugerida

1. T-01 → T-02 → T-03.
2. T-04 after a real generator is decided.

## Lacunas Pendentes (🔴)

- 🔴 Replace `dispatchToTasksPrompt` mock with a real tasks generator (see `../questions.md`).
