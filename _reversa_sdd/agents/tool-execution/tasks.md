# tool-execution, Tarefas de Implementação

## Pré-requisitos

- [ ] `agents` types + `error-formatter` available (see `../tasks.md`)
- [ ] A `ToolExecutionContext` factory (workspace/vscode/chatContext/telemetry)

## Tarefas

- [ ] T-01, Implement `register` with name validation + uniqueness
  - Origem no legado: `tool-registry.ts:25,38,40,47`
  - Critério de pronto: rejects names not matching `^[a-z0-9.-]+$`; duplicate throws
  - Confiança: 🟢

- [ ] T-02, Implement `execute` with handler lookup + timing
  - Origem no legado: `tool-registry.ts:67`
  - Critério de pronto: runs handler, records `durationMs` in metadata, returns `ToolResponse`
  - Confiança: 🟢

- [ ] T-03, Implement missing-handler error
  - Origem no legado: `flowcharts/agents.md` §3; `tool-registry.ts:67`
  - Critério de pronto: unknown tool throws listing available tools
  - Confiança: 🟢

- [ ] T-04, Implement error wrapping + `formatError`
  - Origem no legado: `error-formatter.ts:12,49,270,294`
  - Critério de pronto: handler throw → `ToolExecutionError` → categorized + sanitized `FormattedError` + telemetry
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Duplicate tool name registration throws (RF-01)
- [ ] TT-02, Successful execution records duration (RF-02)
- [ ] TT-03, Unknown tool throws with available list (RF-03)
- [ ] TT-04, Handler throw produces a categorized, sanitized error (RF-04)

## Ordem Sugerida

1. T-01 → T-02 → T-03 → T-04.

## Lacunas Pendentes (🔴)

None. 🟡 confirm parameter-validation depth.
