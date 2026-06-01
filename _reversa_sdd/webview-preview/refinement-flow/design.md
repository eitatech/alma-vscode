# refinement-flow, Design Técnico

> HOW refine/update round-trips work. Source: `api/refine-bridge.ts`, `components/refine/*`, `flowcharts/webview-preview.md` §3.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `submitRefinement` | `(values)` | `Promise<result>` | requestId + 10 s — `refine-bridge.ts:79` |
| `RefineDialog` | props | JSX | `:32` |
| `UpdateDocumentButton` | props | JSX | dependency banner |

## Fluxo Principal (§3)

1. RefineDialog open → validate (issueType set AND description ≥ 20) → invalid → inline errors; valid → `onSubmit(values)`. 🟢
2. `submitRefinement`: `generateRequestId` (`crypto.randomUUID`) → `pending.set(requestId, {resolve, reject, timer})` + 10 s → `postMessage preview/refine/submit` (+ `submittedAt` ISO). 🟢
3. `window` `preview/refine/result`: match requestId + success → clearTimeout, resolve, RefineConfirmation; match + error → reject; 10 s → reject "Refinement request timed out". 🟢
4. UpdateDocumentButton: map `outdatedInfo.changedDependencies` → `submitRefinement(actionType=update, issueType=other)` → same path. 🟢

## Algorithm

**Request/response correlation** — `pending: Map<requestId, {resolve,reject,timer}>`; single lazy `window` listener; timeout rejects + deletes. 🟢

## Dependências

- `webview-shared` bridge. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| requestId correlation + 10 s timeout | `refine-bridge.ts:84,87` | 🟢 |
| Both refine + update share one bridge | `update-document-button.tsx` | 🟢 |

## Estado Interno

`pending` map; dialog form state. 🟢

## Observabilidade

RefineConfirmation on success. 🟡

## Riscos e Lacunas

None. 🟢
