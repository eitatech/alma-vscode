# spec-review-flow (use-case)

> Use-case under `webview-spec-explorer`. Fetch → render → file change request.
> Source: `services/spec-explorer.ts`, `stores/spec-explorer-store.ts`, `components/spec-explorer/*`, `flowcharts/webview-spec-explorer.md` §1.

## Visão Geral

On mount, the spec-explorer initializes its (own) VS Code API listener, fetches ready-to-review specs + change requests (resolving `[]` after 5 s), populates the observable store, and renders the review lanes, from which the user can file a change request or open a spec. 🟢

## Responsabilidades

- Initialize the message listener (`window.specExplorerVscode`). 🟢
- Fetch ready-to-review + changes; timeout → []. 🟢
- Update the store → `useSyncExternalStore` re-render → lists. 🟢
- Handle actions: File Change Request → form; Open spec → navigate. 🟢

## Regras de Negócio

- Fetch resolves `[]` after 5 s. 🟢 `services/spec-explorer.ts:167,189`
- Store mutations replace state immutably; `updateSpec` maps across both lanes by id. 🟢 `spec-explorer-store.ts`
- ⚠️ Uses own `acquireVsCodeApi` + `src/` types (R-X-6 drift). 🔴

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Init + fetch | Must | listener init; fetch posts `ready-to-review:fetch`/`changes:fetch`; 5 s → [] |
| RF-02 | Store update + render | Must | `setReviewSpecs`/`setArchivedSpecs` → notify → lists |
| RF-03 | File change request | Must | action → `fileChangeRequest(specId)` → render form |
| RF-04 | Navigate | Should | open spec → `navigateToSpec(specId, target)` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Resiliência | Timeout fallback prevents hang | `services/spec-explorer.ts:167` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado o host responde dentro de 5s
Quando fetchReadyToReviewSpecs roda
Então o store é atualizado e as listas re-renderizam (RF-01, RF-02)

Dado o usuário clica "File Change Request"
Quando a ação dispara
Então fileChangeRequest(specId) é chamado e o ChangeRequestForm é renderizado (RF-03)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Init+fetch+render+file (RF-01–RF-03) | Must | The review surface |
| Navigate (RF-04) | Should | Navigation aid |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `services/spec-explorer.ts` | `fetchReadyToReviewSpecs` (154), `fileChangeRequest` (199), `navigateToSpec` (222) | 🟢 |
| `stores/spec-explorer-store.ts` | `setReviewSpecs`/`setArchivedSpecs`, `updateSpec` | 🟢 |
| `components/spec-explorer/{ready-to-review,changes,archived}-list.tsx` | lanes | 🟢 |
