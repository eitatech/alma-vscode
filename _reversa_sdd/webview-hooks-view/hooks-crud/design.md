# hooks-crud, Design Técnico

> HOW CRUD + dual-keyed protocol work. Source: `features/hooks-view/index.tsx`, `flowcharts/webview-hooks-view.md` §1–§2.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `HooksView` | `()` | JSX | orchestrator — `:14` |
| `sendMessage` | `(type, payload?)` | void | adds `command = type.replace(/\//g,'.')` — `:29` |

## Fluxo Principal (§1)

1. mount → `sendMessage('hooks/ready')` + `hooks/list`. 🟢
2. host `hooks/sync` → `setHooks` · `isLoading=false` · prune execution statuses. 🟢
3. `showForm?` no → HooksList (toggle/edit/delete); yes → HookForm (create|edit). 🟢
4. toggle → `hooks/toggle`; delete → `hooks/delete`; edit → `setEditingHook + showForm`. 🟢
5. submit editing → `hooks/update (id+updates)`; submit new → `hooks/create` (omit host-assigned); cancel → close. 🟢
6. `hooks/execution-status` → merge by hookId; `hooks/show-logs` → ExecutionLogsList + requestLogs; `hooks/error` → render + format validationErrors. 🟢

## Dual-keyed protocol (§2)

Out: `type: hooks/x` + `command: hooks.x` → `vscode.postMessage`. In: `messageType = type ?? command`; `body = payload ?? data`; switch on both spellings. 🟢

## Dependências

- `webview-shared` `@/bridge/vscode`; HooksList/HookForm/ExecutionLogsList components. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Dual-keyed for backward compat | `index.tsx:30,54` | 🟡 |
| Form preserved across sync | `index.tsx:68` | 🟢 |

## Estado Interno

`hooks`, `executionStatuses`, `showForm`, `editingHook`, logs. 🟢

## Observabilidade

Error formatting (validationErrors); status badges. 🟢

## Riscos e Lacunas

- 🟡 Dual-keyed handling duplicates every case for both spellings — error-prone if a spelling is missed.
