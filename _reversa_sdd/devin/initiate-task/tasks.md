# initiate-task, Tarefas de Implementação

## Pré-requisitos

- [ ] `devin` module infra (client factory, retry, credentials, git, storage) implemented (see `../tasks.md`)
- [ ] A clean git repo with a remote

## Tarefas

- [ ] T-01, Implement git pre-flight + commit/push gate
  - Origem no legado: `git-validator.ts:44`; `git-operations.ts:38,62-82`
  - Critério de pronto: dirty/non-repo aborts; clean → add/commit-if-changes/push (R-CD-11)
  - Confiança: 🟢

- [ ] T-02, Implement prompt builders (single + task group)
  - Origem no legado: `devin-session-manager.ts:334,360,368,402`
  - Critério de pronto: group prompt forces one PR / base branch (R-CD-9)
  - Confiança: 🟢

- [ ] T-03, Implement client resolution + createSession + persist
  - Origem no legado: `devin-session-manager.ts:159,220`; `devin-api-client-factory.ts:38`
  - Critério de pronto: version resolved; session saved INITIALIZING; credentials markUsed; poller started if idle
  - Confiança: 🟢

- [ ] T-04, Implement sequential batch processing
  - Origem no legado: `batch-processor.ts:122`
  - Critério de pronto: one session per task, partial-failure tolerant, progress events
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Dirty repo aborts (R-CD-11)
- [ ] TT-02, cog_ without orgId throws (R-CD-1)
- [ ] TT-03, Task group prompt forces one PR / base branch (R-CD-9)
- [ ] TT-04, Created session persisted INITIALIZING and poller started

## Ordem Sugerida

1. T-01 → T-02 → T-03 → T-04.

## Lacunas Pendentes (🔴)

None. 🟡 confirm push-succeeds-but-create-fails handling.
