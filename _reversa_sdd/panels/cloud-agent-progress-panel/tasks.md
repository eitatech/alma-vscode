# cloud-agent-progress-panel, Tarefas de Implementação

## Pré-requisitos

- [ ] `cloud-agents` `AgentSessionStorage` + `ProviderRegistry`
- [ ] The cloud-agent-progress webview page

## Tarefas

- [ ] T-01, Implement `sendSessionData` (project + post)
  - Origem no legado: `cloud-agent-progress-panel.ts:107,119`
  - Critério de pronto: DTO with provider display status; PRs default `open`; `session-update` posted
  - Confiança: 🟢

- [ ] T-02, Implement the message handler
  - Origem no legado: `cloud-agent-message-handler.ts:34`
  - Critério de pronto: refresh-status / open-external / open-pr routed
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Sessions projected with provider display status (RF-02)
- [ ] TT-02, Undefined PR state → 'open' (RF-01)

## Ordem Sugerida

1. T-01 → T-02.

## Lacunas Pendentes (🔴)

None.
