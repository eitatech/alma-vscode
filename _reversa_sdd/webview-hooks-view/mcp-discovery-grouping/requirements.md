# mcp-discovery-grouping (use-case)

> Use-case under `webview-hooks-view`. Discover MCP servers/tools, parse tool names, group by provider.
> Source: `hooks/use-mcp-servers.ts`, `lib/mcp-utils.ts`, `flowcharts/webview-hooks-view.md` §3–§4.

## Visão Geral

`useMCPServers` discovers MCP servers (auto on mount, manual force-refresh), parses each tool's server id from its name, and `groupToolsByProvider` groups tools under their server (two-level alpha sort), collecting selected tools from unknown servers into a synthetic `Other` group. 🟢

## Responsabilidades

- Discover via `hooks/mcp-discover`; handle `mcp-servers`/`mcp-error`. 🟢
- `extractServerIdFromToolName`: parse `mcp_<server>_<tool>` (handle `.`/`/`). 🟢
- `groupToolsByProvider`: group + dual-sort; orphan selected → `Other`. 🟢
- Format server/tool display names (known map + acronyms). 🟢

## Regras de Negócio

- Server ids never contain `_`; may contain `.` (domain) or `/` (path); boundary = first `_` after the last `/`/`.`. 🟢 `mcp-utils.ts:40-82`
- Servers alpha by name; tools alpha by displayName; unknown-server selected → synthetic `Other`. 🟢 `use-mcp-servers.ts:232`
- Auto-discover on mount; `discover(true)` forces cache refresh. 🟢 `use-mcp-servers.ts:204,119`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Discovery | Should | `hooks/mcp-discover`; servers/error → state; loading flag |
| RF-02 | Tool-name parse | Should | `extractServerIdFromToolName` handles simple/path/domain ids |
| RF-03 | Grouping | Should | provider groups, two-level alpha sort, `Other` for orphans |
| RF-04 | Display format | Should | known-server map + acronym title-casing |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Resiliência | Discovery carries loading/error; no hang | `use-mcp-servers.ts:110` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado o tool "mcp_github.com_create_issue"
Quando extractServerIdFromToolName roda
Então o server id "github.com" é parseado (boundary após o ".") (RF-02)

Dado um tool selecionado de um servidor não listado
Quando groupToolsByProvider roda
Então ele aparece num grupo sintético "Other" (RF-03)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Discovery + parse + group (RF-01–RF-03) | Should | MCP action tool selection |
| Display format (RF-04) | Should | Readability |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `hooks/use-mcp-servers.ts` | `useMCPServers` (110), `groupToolsByProvider` (232), discover (119,204) | 🟢 |
| `lib/mcp-utils.ts` | `extractServerIdFromToolName` (40), `formatServerName` (129), `formatDisplayName` (201) | 🟢 |
