# cloud-dispatch, Tarefas de Implementação

## Pré-requisitos

- [ ] `cloud-agents` registry/storage/polling + `ProviderError`
- [ ] git helpers (branch/remote/featurePath) for `SessionContext`

## Tarefas

- [ ] T-01, Implement `ensureActiveProvider` gate
  - Origem no legado: `cloud-agent-commands.ts:319`
  - Critério de pronto: not selected/credentialed → chain select/configure → return
  - Confiança: 🟢

- [ ] T-02, Implement task extract + duplicate guard
  - Origem no legado: `cloud-agent-commands.ts:347,440-463`
  - Critério de pronto: no task → error; active spec-task → "Open Session / Cancel" (R-CD-13)
  - Confiança: 🟢

- [ ] T-03, Implement `createSessionWithRetry` + persist + poll
  - Origem no legado: `cloud-agent-commands.ts:416,413-438,395-397`
  - Critério de pronto: ≤2 recoverable retries with backoff; storage.create; polling autostart 30 s
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, No provider → chain select/configure (RF-01)
- [ ] TT-02, Duplicate spec-task → Open/Cancel (R-CD-13)
- [ ] TT-03, Recoverable error retried ≤2 then fails (RF-04)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None. 🟡 Devin-vs-cloud ownership (see `cloud-agents/questions.md`).
