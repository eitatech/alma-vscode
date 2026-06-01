# mcp-discovery-grouping, Design Técnico

> HOW MCP discovery + grouping work. Source: `hooks/use-mcp-servers.ts`, `lib/mcp-utils.ts`, `flowcharts/webview-hooks-view.md` §3–§4.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `useMCPServers` | `()` | `{servers, loading, error, discover}` | `:110` |
| `groupToolsByProvider` | `(servers, selectedTools)` | groups | `:232` |
| `extractServerIdFromToolName` | `(toolName)` | serverId | `lib/mcp-utils.ts:40` |

## Discovery (§3)

mount → `discover` → `hooks/mcp-discover` → host `mcp-servers` (set + loading=false) / `mcp-error` (set error) → `groupToolsByProvider(servers, selectedTools)` → server groups (alpha by name; tools alpha by displayName) → selected tool whose server not in list → append synthetic `Other` (`isOther=true`) → `MCPToolsSelector` renders. 🟢

## Tool-name parsing (§4)

`extractServerIdFromToolName(toolName)`:
1. starts with `mcp_`? no → `toolName.toLowerCase()` fallback. 🟢
2. strip `mcp_` → contains `/` or `.`? yes → `pathEnd = max(lastIndexOf('/'), lastIndexOf('.'))` → underscore after `pathEnd` = boundary. 🟢
3. no → first `_` index → found? substring before it; not → whole string. 🟢
4. lowercase server id. 🟢

## Dependências

- `webview-shared` `@/bridge/vscode`; the host MCP discovery. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Boundary detection handles path/domain server ids | `mcp-utils.ts:40-82` | 🟢 |
| Synthetic `Other` group for orphaned selections | `use-mcp-servers.ts:232` | 🟢 |

## Estado Interno

`servers`, `loading`, `error`; the grouped view. 🟢

## Observabilidade

Discovery loading/error states. 🟡

## Riscos e Lacunas

- 🟡 Parsing mirrors the extension-side `correlateToolWithServer` heuristic (`utils`) — keep them consistent (both 🔴 imperfect for unconventional names).
