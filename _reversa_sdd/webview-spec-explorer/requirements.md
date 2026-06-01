# webview-spec-explorer (module)

> Module-level `requirements.md`. Bounded context: **Presentation infra** (webview SPA).
> Source: `ui/src/components/spec-explorer/`, `ui/src/features/{create-spec-view,create-steering-view,simple-view,interactive-view}/`, `ui/src/services/spec-explorer.ts`, `ui/src/stores/spec-explorer-store.ts` (~2,733 LOC, 20 files).
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`webview-spec-explorer` is the spec authoring + review-flow webview surface. It covers four mounted pages — `simple` (demo), `interactive` (message playground), `create-spec` and `create-steering` (autosaving forms) — plus the **Spec Explorer review-flow components** (ready-to-review / changes / archived lists, change-request form/actions) backed by an observable store and a request/response messaging service. 🟢

> ⚠️ This module **deviates** from the no-`src/`-import rule (R-X-6) and uses its own `acquireVsCodeApi()` instead of the shared bridge — see `questions.md`.

## Responsabilidades

- Fetch review/archived specs + change requests (request/response, 5 s timeout). 🟢
- Maintain an observable store (`useSyncExternalStore`) over `reviewSpecs`/`archivedSpecs`. 🟢
- Render review-lane lists + the change-request form (validation + duplicate detection). 🟢
- Drive create-spec / create-steering authoring forms (autosave, dirty/close guard). 🟢

## Regras de Negócio

- 🔴 **R-X-6 violation:** spec types imported directly from `src/features/spec/review-flow/types` (compile-time coupling). 🔴 `spec-explorer-store.ts:2`; `change-request-form.tsx:11`
- Service uses a **separate** `acquireVsCodeApi()` (`window.specExplorerVscode`), not `@/bridge/vscode`. 🔴 `services/spec-explorer.ts:100`
- Fetch ops resolve `[]` after a 5 s timeout (no hang on a silent host). 🟢 `services/spec-explorer.ts:167,189`
- ChangeRequestForm requires title + description + severity; duplicate via `normalizeTitle` vs non-`addressed` CRs. 🟢 `change-request-form.tsx:72,104`
- create-spec: description required; 600 ms debounced autosave → `vscode.setState` + `create-spec/autosave`; import confirms overwrite; `beforeunload` guard when dirty. 🟢 `create-spec-view/index.tsx:104,305,140`
- create-steering: summary required, other 3 optional; `areFormsEqual` dirty check; 600 ms autosave; `beforeunload` guard. 🟢 `create-steering-view/index.tsx:155,38,126`
- interactive-view: Cmd/Ctrl+Enter sends; uses **command**-keyed messages. 🟢 `interactive-view/index.tsx:31,24`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Fetch + store + render | Must | fetch (5 s timeout → []); store notify; lists render |
| RF-02 | File change request | Must | action → `fileChangeRequest`; render `ChangeRequestForm` |
| RF-03 | CR form validation | Must | title+description+severity required; duplicate detection |
| RF-04 | create-spec form | Must | description required; autosave; import overwrite confirm; close guard |
| RF-05 | create-steering form | Must | summary required; autosave; close guard |
| RF-06 | Navigate / interactive / simple | Should | navigateToSpec; command-keyed playground; static view |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Resiliência | 5 s timeout fallback prevents UI hang on a silent host | `services/spec-explorer.ts:167` | 🟢 |
| Usabilidade | Debounced autosave + dirty/close guard prevent data loss | `create-spec-view/index.tsx:140` | 🟢 |
| Consistência | ⚠️ 3 messaging styles coexist (inconsistent with the single bridge) | `flowcharts/webview-spec-explorer.md` §4 | 🔴/🟡 |

## Critérios de Aceitação

```gherkin
Dado o host silencioso
Quando fetchReadyToReviewSpecs é chamado
Então resolve [] após 5s (RF-01)

Dado um título de CR que normaliza igual a um CR não-addressed
Quando digitado
Então um aviso de duplicata aparece (RF-03)

Dado um create-spec com mudanças não salvas
Quando o usuário fecha
Então um close-attempt(hasDirtyChanges=true) é postado e a confirmação do host é honrada (RF-04)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Review flow + CR form + create forms (RF-01–RF-05) | Must | Spec review + authoring |
| Navigate/interactive/simple (RF-06) | Should | Secondary surfaces |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `services/spec-explorer.ts` | `fetchReadyToReviewSpecs` (154), `submitChangeRequest` (206), `navigateToSpec` (222) | 🟢 |
| `stores/spec-explorer-store.ts` | `SpecExplorerStore` (11), `useSpecExplorerStore` (73) | 🟢 |
| `components/spec-explorer/change-request-form.tsx` | `ChangeRequestForm` (47), `normalizeTitle` (44) | 🟢 |
| `features/create-spec-view/index.tsx` | `CreateSpecView` (55), `persistDraft` (71) | 🟢 |
| `features/create-steering-view/index.tsx` | `CreateSteeringView` (78), `validateForm` (152) | 🟢 |

> See `questions.md` for the 🔴 R-X-6 drift + messaging-style inconsistency.
