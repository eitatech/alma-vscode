# change-model, Tarefas de Implementação

## Pré-requisitos

- [ ] `agent-chat` registry/store/runner + ACP session manager + `ACP_NOT_SUPPORTED`

## Tarefas

- [ ] T-01, Implement `handleChangeModel` + `tryAcpSetModel`
  - Origem no legado: `agent-chat-commands.ts:487,528,545-551`
  - Critério de pronto: set_model; `ACP_NOT_SUPPORTED` → fallback; other errors re-thrown
  - Confiança: 🟢

- [ ] T-02, Implement `handleChangeMode` (next-turn timing)
  - Origem no legado: `agent-chat-commands.ts:462,475-484`
  - Critério de pronto: transcript record before patch (R-AC-8)
  - Confiança: 🟢

- [ ] T-03, Implement `handleChangeExecutionTarget` (immutability)
  - Origem no legado: `agent-chat-commands.ts:584,594-596`
  - Critério de pronto: reject when running
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, ACP_NOT_SUPPORTED → fallback (RF-02)
- [ ] TT-02, Other set_model error re-thrown (RF-02)
- [ ] TT-03, Mode recorded before patch (R-AC-8)
- [ ] TT-04, Target change while running rejected (RF-05)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
