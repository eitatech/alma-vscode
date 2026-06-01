# polling-cycle, Tarefas de Implementação

## Pré-requisitos

- [ ] `devin` API client + status mapper + storage implemented (see `../tasks.md`)
- [ ] Decision on ownership vs `cloud-agents` poller (see `../questions.md`)

## Tarefas

- [ ] T-01, Implement `pollOnce` poll-set + grace management
  - Origem no legado: `devin-polling-service.ts:234,70,291`
  - Critério de pronto: active + recently-completed; grace=6 while active; stop when empty + grace=0 (R-CD-4, R-CD-5)
  - Confiança: 🟢

- [ ] T-02, Implement `pollSession` (resolve → fresh re-read → update)
  - Origem no legado: `devin-polling-service.ts:305`; `status-mapper.ts:60`
  - Critério de pronto: statusDetail-wins; terminal-in-grace updates PR data only (R-CD-3, R-CD-5)
  - Confiança: 🟢

- [ ] T-03, Implement event emission (status/blocked)
  - Origem no legado: `devin-polling-service.ts:182,197,381`
  - Critério de pronto: StatusChange on change; Blocked on RUNNING→BLOCKED edge
  - Confiança: 🟢

- [ ] T-04, Implement task-status sync (frozen terminals)
  - Origem no legado: `flowcharts/devin.md` §4; `devin-polling-service.ts`
  - Critério de pronto: `SESSION_TO_TASK_STATUS` map; terminal tasks never re-transitioned
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, statusDetail finished overrides base suspended (R-CD-3)
- [ ] TT-02, Grace window runs 6 cycles then stops (R-CD-5)
- [ ] TT-03, Terminal-in-grace updates PR data only (R-CD-5)
- [ ] TT-04, RUNNING→BLOCKED emits a blocked event

## Ordem Sugerida

1. T-01 → T-02 → T-03 → T-04.

## Lacunas Pendentes (🔴)

- 🔴 Coordinate with `cloud-agents` poller (see `../questions.md`).
