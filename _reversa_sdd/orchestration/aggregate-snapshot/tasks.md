# aggregate-snapshot, Tarefas de Implementação

## Pré-requisitos

- [ ] `agent-chat` registry/store + `cloud-agents` storage/registry available
- [ ] Read-model types defined (see `../tasks.md` T-01)

## Tarefas

- [ ] T-01, Implement `collectAgentChatSessions` (merge registry-wins + degrade)
  - Origem no legado: `orchestration-read-model.ts:178,283`
  - Critério de pronto: active+recent merged, registry wins; read failure → degradedReason + empty
  - Confiança: 🟢

- [ ] T-02, Implement `collectCloudSessions`
  - Origem no legado: `orchestration-read-model.ts:207,313`
  - Critério de pronto: only if storage present; failures → degradedReasons
  - Confiança: 🟢

- [ ] T-03, Implement bucketing + sort + snapshot assembly
  - Origem no legado: `orchestration-read-model.ts:129,397-461`
  - Critério de pronto: correct bucket maps; sort by rank+recency; provider summary attached (R-OR-1)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Registry wins over store for duplicate ids (R-OR-1)
- [ ] TT-02, Bucket maps correct for both sources (§2)
- [ ] TT-03, Missing cloud storage → degradedReason, no throw (R-OR-2)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
