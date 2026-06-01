# pr-state-task-sync, Tarefas de Implementação

## Pré-requisitos

- [ ] `devin` poller emitting `PrStateChangeEvent` (see `../polling-cycle/`)
- [ ] `workspace.fs` read/write access to `tasks.md`

## Tarefas

- [ ] T-01, Implement `markTaskAsCompleted` (idempotent regex)
  - Origem no legado: `spec-status-updater.ts:140`
  - Critério de pronto: `- [ ] TXXX` → `- [x]`; no-op when already `[x]` (R-CD-12)
  - Confiança: 🟢

- [ ] T-02, Implement `updateSpecTaskStatusOnMerge` + conditional persist
  - Origem no legado: `spec-status-updater.ts:91`
  - Critério de pronto: reads tasks.md, applies mutation, writes only if changed
  - Confiança: 🟢

- [ ] T-03, Wire PR-state-change consumer
  - Origem no legado: `devin-polling-service.ts:397`
  - Critério de pronto: `merged` → task update; other states → record PR state only
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, merge marks the checkbox once (R-CD-12)
- [ ] TT-02, Re-processing a merge is idempotent (no double write)
- [ ] TT-03, closed state does not touch tasks.md

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

- 🔴 Single-writer guarantee for `tasks.md` vs `cloud-agents` (see `../questions.md`).
