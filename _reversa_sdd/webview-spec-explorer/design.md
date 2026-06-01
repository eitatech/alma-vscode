# webview-spec-explorer (module), Design Técnico

> Module-level `design.md`. Source: see requirements. Confidence: 🟢 unless noted.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `SpecExplorerService.fetchReadyToReviewSpecs` / `fetchChangeRequests` | request/response | `Promise<[]>` (5 s timeout) | `services/spec-explorer.ts:154/177` |
| `SpecExplorerService.submitChangeRequest` / `fileChangeRequest` / `navigateToSpec` | host actions | — | `:206/199/222` |
| `SpecExplorerStore` / `useSpecExplorerStore` / `specExplorerActions` | observable store | state / selector | `stores/spec-explorer-store.ts:11/73/83` |
| `CreateSpecView` / `CreateSteeringView` | authoring views | JSX | `:55/78` |
| `ChangeRequestForm` / `normalizeTitle` | review form | JSX / string | `change-request-form.tsx:47/44` |

## Messaging styles (⚠️ 3 coexist — §4)

| Surface | Bridge | Message style |
|---------|--------|---------------|
| spec-explorer review | own `acquireVsCodeApi` (`window.specExplorerVscode`) | type-keyed (`ready-to-review:*`, `changes:*`, `change-request:*`, `spec:navigate`) |
| create-spec / create-steering | shared `@/bridge/vscode` + `vscode.setState` | `create-spec/*`, `create-steering/*` |
| interactive-view | shared `@/bridge/vscode` | command-keyed (`interactive-view.*`) |
| simple-view | none | static |

## Fluxo Principal (visão de módulo)

1. **Review** — service fetches (5 s timeout → []) → store → lists → file change request → form. 🟢 (→ `spec-review-flow/`)
2. **CR form** — title/description/severity validation + duplicate detection. 🟢 (→ `change-request-form/`)
3. **Authoring** — create-spec/create-steering autosave + close guard. 🟢 (→ `create-spec-steering/`)

## State machines

No FSM — a flat observable store. Request/response + form-lifecycle flows. See `flowcharts/webview-spec-explorer.md` §1–§4. 🟢

## Dependências

- `webview-shared` (`@/bridge/vscode`, `pill-button`, `textarea-panel`). Crosses to extension `spec` + `steering`. 🟢
- ⚠️ **Compile-time** import from `src/features/spec/review-flow/types`. 🔴
- External: `react`, `lucide-react`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| `useSyncExternalStore` observable store | `spec-explorer-store.ts:11` | 🟢 |
| Promise-with-timeout request/response | `services/spec-explorer.ts:167` | 🟢 |
| 600 ms debounced autosave + `vscode.setState` | `create-spec-view/index.tsx:140` | 🟢 |
| ⚠️ Own `acquireVsCodeApi` + `src/` type import (drift) | `services/spec-explorer.ts:100`; `spec-explorer-store.ts:2` | 🔴 |

## Estado Interno

`SpecExplorerStore` (`reviewSpecs`, `archivedSpecs`); per-view form state + `lastPersistedRef`. 🟢

## Observabilidade

Timeout fallbacks; submit success/error banners. 🟡

## Riscos e Lacunas

- 🔴 **R-X-6 drift**: `src/` type import + own `acquireVsCodeApi` — breaks on extension-type changes and bypasses the shared bridge. See `questions.md`.
- 🟡 Three messaging styles coexist (inconsistent).
