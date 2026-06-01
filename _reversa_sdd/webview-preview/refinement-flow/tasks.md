# refinement-flow, Tarefas de Implementação

## Pré-requisitos

- [ ] `webview-shared` bridge; host `preview/refine/*` contract

## Tarefas

- [ ] T-01, Implement `submitRefinement` bridge
  - Origem no legado: `api/refine-bridge.ts:79-87`
  - Critério de pronto: requestId + 10 s; pending map; result correlation
  - Confiança: 🟢

- [ ] T-02, Implement RefineDialog + validation
  - Origem no legado: `components/refine/refine-dialog.tsx:30,66`
  - Critério de pronto: issueType + ≥20-char description; inline errors
  - Confiança: 🟢

- [ ] T-03, Implement UpdateDocumentButton (dependency sync)
  - Origem no legado: `components/refine/update-document-button.tsx`
  - Critério de pronto: map changedDependencies → submitRefinement(update, other)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, <20-char description blocked (RF-01)
- [ ] TT-02, requestId mismatch ignored (RF-03)
- [ ] TT-03, 10 s timeout rejects (RF-03)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
