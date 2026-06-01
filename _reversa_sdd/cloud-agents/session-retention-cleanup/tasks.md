# session-retention-cleanup, Tarefas de Implementação

## Pré-requisitos

- [ ] `agent-session-storage` delete operation available
- [ ] A trigger (activation hook or interval)

## Tarefas

- [ ] T-01, Implement `cleanup` with 7-day cutoff
  - Origem no legado: `session-cleanup-service.ts:18,40`
  - Critério de pronto: deletes sessions with completion < `now - 7d`; returns count
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Expired sessions deleted, count returned (R-CD-7)
- [ ] TT-02, No expired → returns 0

## Ordem Sugerida

1. T-01.

## Lacunas Pendentes (🔴)

None. 🟡 confirm the timestamp field used for expiry.
