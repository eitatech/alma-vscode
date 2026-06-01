# register-chat-participants, Tarefas de Implementação

## Pré-requisitos

- [ ] `agents` module types + `tool-registry` + `resource-cache` implemented (see `../tasks.md`)
- [ ] VS Code Copilot Chat API available

## Tarefas

- [ ] T-01, Implement the Chat-API availability gate
  - Origem no legado: `flowcharts/agents.md` §1; `chat-participant-registry.ts`
  - Critério de pronto: missing API → log + skip, never throws
  - Confiança: 🟢

- [ ] T-02, Implement discovery + parse + validate pipeline
  - Origem no legado: `agent-loader.ts:26,54,95,143,154,165,243`
  - Critério de pronto: recursive `.agent.md` scan; frontmatter required; `/help` injected; invalid skipped + logged
  - Confiança: 🟢

- [ ] T-03, Implement `registerAgent` (idempotent participant creation)
  - Origem no legado: `chat-participant-registry.ts:71`
  - Critério de pronto: chat participant created with icon + followups; already-registered agents skipped
  - Confiança: 🟢

- [ ] T-04, Implement `handleChatRequest` (parse → resources → execute → render)
  - Origem no legado: `chat-participant-registry.ts:147`
  - Critério de pronto: command resolved; unknown → help; tool executed; success/failure rendered with metadata/guidance
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Missing Chat API skips gracefully (RF-01)
- [ ] TT-02, Valid agents registered, invalid skipped (RF-02, RF-03)
- [ ] TT-03, `@agent /cmd` routes to the bound tool (RF-04)
- [ ] TT-04, Unknown command renders help, no exception (RF-05)

## Ordem Sugerida

1. T-01 → T-02 → T-03 → T-04.

## Lacunas Pendentes (🔴)

None.
