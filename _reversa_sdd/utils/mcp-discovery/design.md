# mcp-discovery, Design Técnico

> HOW MCP discovery works. Source: `copilot-mcp-utils.ts` (653), `flowcharts/utils.md` §3.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `queryMCPServers` | `()` | `MCPServer[]` | `:87` |
| `correlateToolWithServer` | `(tool, configuredIds)` | `serverId` | `:374` |
| `executeMCPTool` | `(name, input, token)` | result | `:247` |

## Fluxo Principal (§3)

1. `vscode.lm.tools` available? no → `[]`. 🟢
2. `loadMCPConfig` from `mcp.json` (via `getMcpConfigPath`). 🟢
3. for each lm tool → `correlateToolWithServer`:
   - vscode built-in (`vscode_`/`terminal_`/`_confirmation`) → `vscode-tools`. 🟢
   - matches a configured server id (substring/path/hyphen) → `serverId`. 🟢
   - starts with `mcp_<id>_` → extracted `serverId`. 🟢
   - else → `other-tools`. 🟢
4. group into `serverMap` → map to `MCPServer` with formatted names + tools. 🟢

`executeMCPTool` → `lm.invokeTool(name, { input }, token)` with `toolInvocationToken: undefined`. 🟢

## Dependências

- `vscode.lm`, `getMcpConfigPath` (platform-utils), `hooks` MCP types. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Layered correlation heuristics | `copilot-mcp-utils.ts:374` | 🟢 |
| Title-case display with a known-acronym map | `copilot-mcp-utils.ts` | 🟢 |

## Estado Interno

None (per-call). 🟢

## Observabilidade

Graceful empty on unavailability. 🟢

## Riscos e Lacunas

- 🔴 Tools whose names don't encode their server land in `other-tools` — grouping is imperfect for unconventional names (see `../questions.md`).
