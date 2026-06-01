# start-new-session, Tarefas de Implementação

## Pré-requisitos

- [ ] `agent-chat` registry/store + `startAcpSession` + cap-warning-prompt
- [ ] `panels.createPanel`

## Tarefas

- [ ] T-01, Implement `enforceConcurrentCap`
  - Origem no legado: `agent-chat-commands.ts:234,238-260`
  - Critério de pronto: prompt decision; fail closed without helper
  - Confiança: 🟢

- [ ] T-02, Implement `handleStartNew` (wire + attachPanel)
  - Origem no legado: `agent-chat-commands.ts:207,221-226`
  - Critério de pronto: start → register → attachRunner → createPanel → attachPanel → reveal (R-AC-11)
  - Confiança: 🟢

- [ ] T-03, Implement the tier QuickPick
  - Origem no legado: `agent-chat-new-session.ts:127,183,209-235`
  - Critério de pronto: tiered items; install-required opens URL; else task prompt → startNew
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Cap cancel-and-start cancels idle then starts (RF-01)
- [ ] TT-02, attachPanel called once in handler (R-AC-11)
- [ ] TT-03, install-required opens URL (RF-03)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
