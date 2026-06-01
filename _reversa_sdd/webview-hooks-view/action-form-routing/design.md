# action-form-routing, Design Técnico

> HOW form routing works. Source: `components/hook-form.tsx`, sub-forms, `flowcharts/webview-hooks-view.md` §5.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `HookForm` | props (action, onChange) | JSX | action-type switch |
| `argument-template-editor` | props | JSX | `$variable` editor |

## Routing (§5)

`HookForm` switches on `action.type`:
- `agent` → `AgentActionParams` (command). 🟢
- `git` → `GitActionForm` (operation + messageTemplate + …). 🟢
- `github` → `GitHubActionForm` (11 operations + repo/labels/…). 🟢
- `custom` → `CustomActionParams` (agentId/prompt/tools/cliOptions). 🟢
- `mcp` → `MCPActionPicker` + `MCPToolsSelector` (modelId/prompt/selectedTools). 🟢
- `acp` → `ACPAgentForm` (agentCommand/taskInstruction + known-agents panel). 🟢

## Dependências

- The 6 action sub-forms; `argument-template-editor`; the MCP tool selector (see `../mcp-discovery-grouping/`). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| One sub-form per action type | `flowcharts/webview-hooks-view.md` §5 | 🟢 |
| `$variable` template editor shared across forms | `argument-template-editor.tsx` | 🟢 |

## Estado Interno

The current `action` + its params; template editor state. 🟢

## Observabilidade

None (form). 🟢

## Riscos e Lacunas

- 🔴 Two `trigger-action-selector.tsx` exist (313 vs 754) — confirm which feeds this form (see `../questions.md`).
