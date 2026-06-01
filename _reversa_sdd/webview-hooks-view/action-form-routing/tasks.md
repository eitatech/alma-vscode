# action-form-routing, Tarefas de Implementação

## Pré-requisitos

- [ ] `types.ts` action-param shapes; MCP tools selector (see `../mcp-discovery-grouping/`)

## Tarefas

- [ ] T-01, Implement `HookForm` action-type switch
  - Origem no legado: `components/hook-form.tsx`; `flowcharts/webview-hooks-view.md` §5
  - Critério de pronto: routes to the matching sub-form for all 6 types
  - Confiança: 🟢

- [ ] T-02, Implement the 6 action sub-forms
  - Origem no legado: action forms (`github-action-form`, `mcp-action-picker`, `mcp-tools-selector`, ACP, custom, agent, git)
  - Critério de pronto: each captures its params per the extension contract
  - Confiança: 🟢

- [ ] T-03, Implement `$variable` template editor
  - Origem no legado: `components/argument-template-editor.tsx`
  - Critério de pronto: insert/validate `$variable`s for trigger context
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, mcp type → MCP picker + tools selector (RF-03)
- [ ] TT-02, github type → 11-op form (RF-02)
- [ ] TT-03, acp type → ACP form + known-agents (RF-03)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

- 🔴 Pick the canonical trigger-selector (see `../questions.md`).
