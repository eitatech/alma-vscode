# spec (module), Tarefas de Implementação

## Pré-requisitos

- [ ] `utils` spec-kit adapter + chat-prompt-runner; `hooks` TriggerRegistry
- [ ] A writable `.vscode/gatomia/spec-review-state.json`
- [ ] SpecKit `.specify/` and/or OpenSpec `openspec/` present

## Tarefas

- [ ] T-01, Define review-flow types + persisted shapes
  - Origem no legado: `review-flow/types.ts:10,20,29,47,66,76,98`; `review-flow/storage.ts`
  - Critério de pronto: entities + enums + `Persisted*` (Date⇄ISO) compile
  - Confiança: 🟢

- [ ] T-02, Implement the FSM (validate + normalize + stamp)
  - Origem no legado: `review-flow/state.ts:128-151,271,299-306`
  - Critério de pronto: valid transitions only; `readyToReview`→`review`; date stamps (R-SP-1, R-SP-3)
  - Confiança: 🟢

- [ ] T-03, Implement gating (send-to-review + archive)
  - Origem no legado: `review-flow/state.ts:694,887`
  - Critério de pronto: blockers accumulated; transitions gated (R-SP-2, R-SP-5)
  - Confiança: 🟢

- [ ] T-04, Implement CR lifecycle + dedupe + auto-return
  - Origem no legado: `change-requests-service.ts:34`; `duplicate-guard.ts:53`; `state.ts:447,768`
  - Critério de pronto: create→reopened; attach→inProgress; done→addressed; dup rejected (R-SP-4, R-SP-7, R-SP-8)
  - Confiança: 🟢

- [ ] T-05, Implement state persistence + telemetry
  - Origem no legado: `review-flow/state.ts:56-123`; `review-flow/telemetry.ts`
  - Critério de pronto: load-on-first-access, write-after-mutation; transition telemetry
  - Confiança: 🟢

- [ ] T-06, Implement two-system submission + active-system detection
  - Origem no legado: `spec-manager.ts:130`; `spec-submission-strategy.ts:14,62`
  - Critério de pronto: explicit setting wins, else auto-detect, else prompt; OpenSpec requires prompt file (R-SP-9, R-SP-12)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Invalid transition rejected; legacy alias normalized (R-SP-1)
- [ ] TT-02, Send-to-review blocked by pending items (R-SP-2)
- [ ] TT-03, CR creation reopens spec; all-done addresses it (R-SP-4)
- [ ] TT-04, Duplicate CR title rejected (R-SP-8)

## Ordem Sugerida

1. T-01 → T-02 → T-03 → T-04 → T-05.
2. T-06 (submission) + use-case folders.

## Lacunas Pendentes (🔴)

- 🔴 Wire a real CR→tasks generator (replace `dispatchToTasksPrompt` mock) — see `questions.md`.
