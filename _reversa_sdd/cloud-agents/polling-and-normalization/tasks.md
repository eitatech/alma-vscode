# polling-and-normalization, Tarefas de Implementação

## Pré-requisitos

- [ ] `cloud-agents` storage + registry + adapters implemented (see `../tasks.md`)
- [ ] Event emitters for update/completed/error/credential-expiry

## Tarefas

- [ ] T-01, Implement `getSessionsToPoll` (grace-period filter)
  - Origem no legado: `agent-polling-service.ts:217`
  - Critério de pronto: force → all non-read-only; else active + grace (5m known / 1h unknown), exclude terminal PRs (R-CD-5, R-CD-8)
  - Confiança: 🟢

- [ ] T-02, Implement `pollOnce` with backoff + credential-expiry
  - Origem no legado: `agent-polling-service.ts:154,306`
  - Critério de pronto: 3-failure stop; credential error fires `onCredentialExpiry` and halts (R-CD-4)
  - Confiança: 🟢

- [ ] T-03, Implement `applyUpdate` + terminal task derivation
  - Origem no legado: `agent-polling-service.ts:255,346`
  - Critério de pronto: terminal → derive task statuses; merge; set timestamps; fire events (R-CD-6)
  - Confiança: 🟢

- [ ] T-04, Implement `normalizeSession` (poll + load)
  - Origem no legado: `agent-session-storage.ts:248`
  - Critério de pronto: terminal → tasks SKIPPED/derived; undefined PR → merged (COMPLETED) else open
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Grace filter includes terminal-with-open-PR within window, excludes terminal PRs (R-CD-5)
- [ ] TT-02, 3 consecutive failures stop the interval (R-CD-4)
- [ ] TT-03, Credential error fires `onCredentialExpiry` (RF-06)
- [ ] TT-04, Terminal normalization derives task + PR states (R-CD-6)

## Ordem Sugerida

1. T-01 → T-02 → T-03 → T-04.

## Lacunas Pendentes (🔴)

- 🔴 Coordinate with `devin` poller to avoid double-polling the same session (see `../questions.md`).
