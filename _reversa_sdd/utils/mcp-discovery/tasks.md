# mcp-discovery, Tarefas de Implementação

## Pré-requisitos

- [ ] `vscode.lm` API; `getMcpConfigPath` (platform-utils); `hooks` MCP types

## Tarefas

- [ ] T-01, Implement `queryMCPServers` + availability guard
  - Origem no legado: `copilot-mcp-utils.ts:87,90-98`
  - Critério de pronto: no lm.tools → []; load mcp.json; group into MCPServer[]
  - Confiança: 🟢

- [ ] T-02, Implement `correlateToolWithServer` heuristics
  - Origem no legado: `copilot-mcp-utils.ts:374,403-404`
  - Critério de pronto: built-in / config-match / `mcp_` prefix / other-tools
  - Confiança: 🟢

- [ ] T-03, Implement `executeMCPTool`
  - Origem no legado: `copilot-mcp-utils.ts:247,262-269`
  - Critério de pronto: `lm.invokeTool` with undefined token
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Missing lm.tools → [] (RF-01)
- [ ] TT-02, `mcp_github_*` → server github (RF-02)
- [ ] TT-03, Unknown tool → other-tools (RF-02)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

- 🔴 Improve correlation for unconventional tool names (see `../questions.md`).
