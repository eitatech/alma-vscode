# create-spec-steering, Design Técnico

> HOW the authoring forms work. Source: `create-spec-view/index.tsx`, `create-steering-view/index.tsx`, `flowcharts/webview-spec-explorer.md` §3.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `CreateSpecView` / `persistDraft` | view + autosave | JSX / void | `:55/71` |
| `CreateSteeringView` / `validateForm` | view + validation | JSX / errors | `:78/152` |

## Fluxo Principal (§3)

1. mount → `readPersistedDraft` (`vscode.getState`) → post `create-*/ready`. 🟢
2. host `create-*/init`? → hydrate form + `vscode.setState`. 🟢
3. field change → `isDirty = value != lastPersisted` → debounce 600 ms → `persistDraft` (`vscode.setState` + `create-*/autosave`). 🟢
4. Submit → required field present (spec: description; steering: summary)? no → field error + focus; yes → `create-*/submit`. 🟢
5. host `submit:success` → clear submitting; `submit:error` → banner. 🟢
6. Cancel / `beforeunload` → dirty? → `create-*/close-attempt(hasDirtyChanges=true)` → host `confirm-close(shouldClose)` → no → "close cancelled" warning. 🟢

## Dependências

- `webview-shared` `@/bridge/vscode` + `vscode.setState`; `lucide-react` (spec icons); shared `StatusBanner` (reused by steering). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Draft persisted to `vscode.setState` (survives webview reload) | `create-spec-view/index.tsx:140` | 🟢 |
| Dirty/close guard via host round-trip | `:285` | 🟢 |

## Estado Interno

form data, `lastPersistedRef`, submitting/submissionError, dirty flag. 🟢

## Observabilidade

submit success/error banner. 🟡

## Riscos e Lacunas

None. 🟢 (these views use the shared bridge — unlike the review service.)
