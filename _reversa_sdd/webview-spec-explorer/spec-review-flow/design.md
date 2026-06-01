# spec-review-flow, Design Técnico

> HOW the review flow works. Source: `services/spec-explorer.ts`, `stores/spec-explorer-store.ts`, `flowcharts/webview-spec-explorer.md` §1.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `SpecExplorerService.initializeMessageListener` | `()` | void | own `acquireVsCodeApi` |
| `fetchReadyToReviewSpecs` / `fetchChangeRequests` | `()` | `Promise<[]>` | 5 s timeout — `:154/177` |
| `specExplorerActions.setReviewSpecs` / `setArchivedSpecs` | store mutation | — | `:83` |

## Fluxo Principal (§1)

1. mount → `initializeMessageListener` (`acquireVsCodeApi` → `window.specExplorerVscode`). 🟢
2. `fetchReadyToReviewSpecs` / `fetchChangeRequests` → post `ready-to-review:fetch` / `changes:fetch`. 🟢
3. host responds within 5 s? yes → `on specs-updated`/`changes:updated` → resolve; no → timeout → resolve []. 🟢
4. `specExplorerActions.setReviewSpecs/setArchivedSpecs` → `store.notify` → `useSyncExternalStore` re-render. 🟢
5. lists render; actions: File Change Request → `fileChangeRequest(specId)` → render form; Open → `navigateToSpec`. 🟢

## Algorithm

**Promise-with-timeout request/response** — `on(type)` one-shot subscription + `setTimeout(5000)` → []. 🟢

## Dependências

- own `acquireVsCodeApi` (`window.specExplorerVscode`), the observable store. 🔴 (drift)

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Request/response with timeout fallback | `services/spec-explorer.ts:167` | 🟢 |
| ⚠️ Separate VS Code API instance (not the shared bridge) | `:100` | 🔴 (see `../questions.md`) |

## Estado Interno

`reviewSpecs` + `archivedSpecs` (store); pending one-shot subscriptions. 🟢

## Observabilidade

Timeout → empty (silent). 🟡

## Riscos e Lacunas

- 🔴 Own `acquireVsCodeApi` instance; calling `acquireVsCodeApi()` more than once globally throws — confirm only this module calls it for its surface (see `../questions.md`).
