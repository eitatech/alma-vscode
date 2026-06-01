# mcp-discovery-grouping, Tarefas de Implementação

## Pré-requisitos

- [ ] `webview-shared` bridge; host MCP discovery responses

## Tarefas

- [ ] T-01, Implement `useMCPServers` (discover + loading/error)
  - Origem no legado: `hooks/use-mcp-servers.ts:110,119,204`
  - Critério de pronto: auto-discover; force-refresh; loading/error
  - Confiança: 🟢

- [ ] T-02, Implement tool-name parsing + display format
  - Origem no legado: `lib/mcp-utils.ts:40,129,201`
  - Critério de pronto: simple/path/domain server id; known-map + acronym formatting
  - Confiança: 🟢

- [ ] T-03, Implement `groupToolsByProvider` (+ Other)
  - Origem no legado: `hooks/use-mcp-servers.ts:232`
  - Critério de pronto: two-level alpha sort; orphan selected → Other
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, domain server id parsed (RF-02)
- [ ] TT-02, orphan selected → Other (RF-03)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None. 🟡 keep parsing consistent with extension-side `utils/correlateToolWithServer`.
