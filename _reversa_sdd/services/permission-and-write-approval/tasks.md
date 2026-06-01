# permission-and-write-approval, Tarefas de Implementação

## Pré-requisitos

- [ ] ACP `Client` handler scaffold (see `../acp-client-lifecycle/`)
- [ ] `agent-chat/pending-writes-store` + `diff-stats`

## Tarefas

- [ ] T-01, Implement `resolvePermission`
  - Origem no legado: `acp-client.ts:316,1446,1510`
  - Critério de pronto: allow/deny short-circuit; ask → remembered/prompt; live optionId re-resolution
  - Confiança: 🟢

- [ ] T-02, Implement remembered "always" decisions per ToolKind
  - Origem no legado: `acp-client.ts:1446`
  - Critério de pronto: persisted for client lifetime; re-applied on subsequent requests
  - Confiança: 🟢

- [ ] T-03, Implement buffered `writeTextFile`
  - Origem no legado: `acp-client.ts:942-960`
  - Critério de pronto: bufferFileWrites → PendingWrite; Accept writes + resolves; Reject rejects RPC
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, allow/deny short-circuit, no prompt (RF-01)
- [ ] TT-02, allow_always re-resolves current optionId (RF-04)
- [ ] TT-03, Buffered write waits for Accept/Reject (RF-05)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
