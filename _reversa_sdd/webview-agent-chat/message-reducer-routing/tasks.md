# message-reducer-routing, Tarefas de Implementação

## Pré-requisitos

- [ ] `types.ts` state shape + `BridgeAction` union

## Tarefas

- [ ] T-01, Implement `INCOMING_HANDLERS` + `translateIncoming`
  - Origem no legado: `use-session-bridge.ts:296,322-440`
  - Critério de pronto: each type → action; session scoping before dispatch
  - Confiança: 🟢

- [ ] T-02, Implement `reducer` + Set-dedup + `applyPatch`
  - Origem no legado: `use-session-bridge.ts:194,212,447`
  - Critério de pronto: append dedup; per-variant patch; all action types reduced
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Mismatched session dropped (RF-02)
- [ ] TT-02, Duplicate append deduped (RF-03)
- [ ] TT-03, permission-default filtered to ask/allow/deny (RF-05)

## Ordem Sugerida

1. T-01 → T-02.

## Lacunas Pendentes (🔴)

None.
