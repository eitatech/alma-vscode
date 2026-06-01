# webview-hooks-view (module), Tarefas de Implementação

## Pré-requisitos

- [ ] `webview-shared` `@/bridge/vscode`; React 18
- [ ] Extension `hooks` message contracts + MCP discovery + ACP catalog
- [ ] 🔴 Resolve duplicate components (see `questions.md`) before reimplementation

## Tarefas

- [ ] T-01, Define `types.ts` (hook model + dual-keyed unions)
  - Origem no legado: `features/hooks-view/types.ts:27,202,389-503,467`
  - Critério de pronto: Hook + 6 action params + CopilotCliOptions + MCP/ACP + message unions
  - Confiança: 🟢

- [ ] T-02, Implement `HooksView` + dual-keyed `sendMessage`
  - Origem no legado: `index.tsx:14,29,30,54,68,103`
  - Critério de pronto: CRUD; type+command; form not reset on sync; exec-status merge
  - Confiança: 🟢

- [ ] T-03, Implement `HookForm` + 6 action sub-forms
  - Origem no legado: `components/hook-form.tsx`; action forms; `argument-template-editor.tsx`
  - Critério de pronto: action-type routing; `$variable` template editor
  - Confiança: 🟢

- [ ] T-04, Implement MCP utils + discovery hooks
  - Origem no legado: `lib/mcp-utils.ts:40,129`; `hooks/use-mcp-servers.ts:110,232`
  - Critério de pronto: tool-name parse; format; group + Other; auto/force discover
  - Confiança: 🟢

- [ ] T-05, Implement CLI option panels + ACP/known-agents
  - Origem no legado: `components/cli-options/*`; `hooks/use-acp-agents.ts`, `use-known-acp-agents.ts`
  - Critério de pronto: 6 CLI panels; ACP local config + known-agents panel
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Create omits host-assigned fields (RF-06)
- [ ] TT-02, Dual-keyed read `type ?? command` (RF-02)
- [ ] TT-03, `mcp_github_*` → server github (RF-04)
- [ ] TT-04, action.type routes to the right sub-form (RF-03)

## Ordem Sugerida

1. T-01 → T-02 → T-03 → T-04 → T-05.

## Lacunas Pendentes (🔴)

- 🔴 Pick the canonical trigger-selector + cli-options set (see `questions.md`).
