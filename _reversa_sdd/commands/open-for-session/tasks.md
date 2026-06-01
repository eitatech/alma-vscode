# open-for-session, Tarefas de Implementação

## Pré-requisitos

- [ ] `agent-chat` registry/store + `panels.createPanel`

## Tarefas

- [ ] T-01, Implement arg coercion + registry/store fallback
  - Origem no legado: `agent-chat-commands.ts:284,708`
  - Critério de pronto: id coerced; registry miss → store; store miss → return
  - Confiança: 🟢

- [ ] T-02, Implement lazy hydrate + panel reuse
  - Origem no legado: `agent-chat-commands.ts:297-313`
  - Critério de pronto: store-only session registered; focusPanel reuse else create
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Store-only session hydrated + opened (RF-02)
- [ ] TT-02, Existing panel reused (PANEL_REOPENED) (RF-03)

## Ordem Sugerida

1. T-01 → T-02.

## Lacunas Pendentes (🔴)

None.
