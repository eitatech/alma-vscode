# webview-hooks-view (module), Design Técnico

> Module-level `design.md`. Source: see requirements. Confidence: 🟢 unless noted.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `HooksView` / `sendMessage` | orchestrator + dual-key sender | JSX / void | `index.tsx:14/29` |
| `extractServerIdFromToolName` | `(toolName)` | serverId | `lib/mcp-utils.ts:40` |
| `formatServerName` / `formatDisplayName` | display formatting | string | `:129/201` |
| `groupToolsByProvider` | `(servers, selected)` | groups | `use-mcp-servers.ts:232` |
| `useMCPServers` | discovery hook | `{servers, loading, error, discover}` | `:110` |
| `HookForm` | action-routed form | JSX | `components/hook-form.tsx` |

## Tipos (`features/hooks-view/types.ts`, 503 LOC)

`Hook`, 6 `*ActionParams`, `CopilotCliOptions`, MCP/ACP types, execution logs, and the **dual-keyed** `HooksExtension`/`HooksWebviewMessage` unions. 🟢

## Fluxo Principal (visão de módulo)

1. **CRUD** — ready/list → `hooks/sync` → list/form. 🟢 (→ `hooks-crud/`)
2. **Protocol** — every message carries `type` + `command`; read both spellings. 🟢
3. **MCP** — discover → parse tool names → group + Other. 🟢 (→ `mcp-discovery-grouping/`)
4. **Form routing** — `action.type` switches the sub-form. 🟢 (→ `action-form-routing/`)

## State machines

No formal FSM. `HookExecutionStatusState` (`executing → completed | failed`) is a status projection; the form is a create/edit toggle. See `flowcharts/webview-hooks-view.md` §1–§5. 🟢

## Dependências

- `webview-shared` `@/bridge/vscode`; shared `components/{hooks,cli-options}/`. Crosses to extension `hooks` (+ MCP discovery, model cache, ACP catalog). 🟢
- External: `react`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Dual-keyed protocol for backward compat | `index.tsx:30,54` | 🟡 |
| Form not reset on sync (avoid edit race) | `index.tsx:68` | 🟢 |
| Provider grouping + Other for orphaned selections | `use-mcp-servers.ts:232` | 🟢 |
| Action-type-routed sub-forms | `components/hook-form.tsx` | 🟢 |

## Estado Interno

`hooks`, `executionStatuses` (per hookId), form/edit/logs state; MCP discovery cache. 🟢

## Observabilidade

Execution status badges + logs panel. 🟢

## Riscos e Lacunas

- 🔴 **Duplicate components**: two `trigger-action-selector.tsx` (313 in `components/hooks/`, 754 in `features/hooks-view/components/`) and duplicated `cli-options/*` — which is wired needs confirmation (see `questions.md`).
- 🟡 Dual-keyed protocol is legacy compatibility scaffolding.
