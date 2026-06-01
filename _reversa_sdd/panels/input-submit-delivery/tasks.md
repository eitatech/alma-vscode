# input-submit-delivery, Tarefas de Implementação

## Pré-requisitos

- [ ] `AgentChatPanel` scaffold (see `../agent-chat-panel-lifecycle/`)
- [ ] `agent-chat` runner + `TERMINAL_STATES`

## Tarefas

- [ ] T-01, Implement optimistic append + rejection ladder
  - Origem no legado: `agent-chat-panel.ts:382,404-445`
  - Critério de pronto: pending append; cloud/terminal/no-runner/no-submit rejections (R-AC-3)
  - Confiança: 🟢

- [ ] T-02, Implement submit + delivery patch
  - Origem no legado: `agent-chat-panel.ts:382`
  - Critério de pronto: ok → delivered; throw → rejected: error.message
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Local session → pending then delivered (RF-05)
- [ ] TT-02, Cloud/terminal → rejected (R-AC-3)
- [ ] TT-03, runner.submit throw → rejected with message

## Ordem Sugerida

1. T-01 → T-02.

## Lacunas Pendentes (🔴)

None.
