# action-form-routing (use-case)

> Use-case under `webview-hooks-view`. The hook form routes the parameter sub-form by action type.
> Source: `components/hook-form.tsx`, action sub-forms, `argument-template-editor.tsx`, `flowcharts/webview-hooks-view.md` §5.

## Visão Geral

`HookForm` switches the parameter sub-form based on `action.type` (6 variants: agent, git, github, custom, mcp, acp), each capturing its own parameters, plus the `$variable` template editor for passing trigger context to actions. 🟢

## Responsabilidades

- Route to the correct sub-form by `action.type`. 🟢
- Capture per-type params (agent command; git op+template; github 11 ops; custom agent/prompt/tools/cli; mcp model/prompt/tools; acp command/instruction). 🟢
- Provide the `$variable` template editor. 🟢

## Regras de Negócio

- 6 action types → 6 sub-forms. 🟢 `flowcharts/webview-hooks-view.md` §5
- `waitForCompletion` only meaningful for `before` timing. 🟢 `types.ts:27`
- ACP mode is `local` only (v1). 🟢 `types.ts:202`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Routing | Must | `action.type` selects the matching sub-form |
| RF-02 | agent/git/github forms | Must | command / op+template / 11-op github form |
| RF-03 | custom/mcp/acp forms | Must | custom (agent/prompt/tools/cli); mcp (model/prompt/tools); acp (command/instruction + known-agents) |
| RF-04 | Template editor | Should | `$variable` editor for trigger context |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Coerência | Sub-forms mirror the extension action-param contracts | `hooks/contracts.md` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado action.type = mcp
Quando o form renderiza
Então MCPActionPicker + MCPToolsSelector (modelId/prompt/selectedTools) são exibidos (RF-03)

Dado action.type = acp
Quando o form renderiza
Então o ACPAgentForm (agentCommand/taskInstruction + known-agents) é exibido (RF-03)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Routing + all 6 forms (RF-01–RF-03) | Must | Action configuration |
| Template editor (RF-04) | Should | Context passing |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `components/hook-form.tsx` | action-type switch | 🟢 |
| `components/{github-action-form,mcp-action-picker,mcp-tools-selector}.tsx` | sub-forms | 🟢 |
| `components/argument-template-editor.tsx` | `$variable` editor | 🟢 |
