# refinement-flow (use-case)

> Use-case under `webview-preview`. Manual refinement (issue report) + dependency-update round-trips.
> Source: `components/refine/*`, `api/refine-bridge.ts`, `flowcharts/webview-preview.md` §3.

## Visão Geral

Both the manual `RefineDialog` (issue report) and the `UpdateDocumentButton` (dependency sync) funnel through `submitRefinement`, a request/response bridge correlated by `requestId` with a 10 s timeout. 🟢

## Responsabilidades

- RefineDialog: validate issueType + description (≥20 chars) → `submitRefinement`. 🟢
- UpdateDocumentButton: map `outdatedInfo.changedDependencies` → `submitRefinement(actionType=update, issueType=other)`. 🟢
- Correlate by `requestId`; resolve on matching success, reject on error/timeout. 🟢

## Regras de Negócio

- RefineDialog: issueType required + description ≥ 20 chars. 🟢 `refine-dialog.tsx:30,66`
- `submitRefinement`: `generateRequestId` (`crypto.randomUUID`), `pending.set` + 10 s timeout, post with `submittedAt` ISO. 🟢 `refine-bridge.ts:79-87`
- Result matched by `requestId`: success → resolve + RefineConfirmation; error → reject; 10 s → reject "timed out". 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Refine validation | Should | issueType set + description ≥ 20 chars; else inline errors |
| RF-02 | Submit round-trip | Should | requestId + 10 s; post `preview/refine/submit` |
| RF-03 | Result correlation | Should | match requestId → resolve/reject; timeout → reject |
| RF-04 | Update action | Should | dependency-update maps to `submitRefinement(update, other)` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Resiliência | 10 s timeout rejects + cleans pending | `refine-bridge.ts:87` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado description < 20 chars no RefineDialog
Quando submete
Então o submit é bloqueado com erro inline (RF-01)

Dado uma resposta com requestId divergente
Quando recebida
Então é ignorada (apenas o requestId correspondente resolve) (RF-03)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Validation + round-trip + correlation (RF-01–RF-03) | Should | Document iteration aid |
| Update action (RF-04) | Should | Dependency sync |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `api/refine-bridge.ts` | `submitRefinement` (79) | 🟢 |
| `components/refine/refine-dialog.tsx` | `RefineDialog` (32), validation (30,66) | 🟢 |
| `components/refine/update-document-button.tsx` | dependency-update banner | 🟢 |
