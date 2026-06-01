# spec-review-flow, Tarefas de Implementação

## Pré-requisitos

- [ ] The observable store; the (own or shared) VS Code API bridge

## Tarefas

- [ ] T-01, Implement service init + fetch with timeout
  - Origem no legado: `services/spec-explorer.ts:154,167,189`
  - Critério de pronto: listener init; fetch → [] after 5 s
  - Confiança: 🟢

- [ ] T-02, Implement store update + list render
  - Origem no legado: `stores/spec-explorer-store.ts`
  - Critério de pronto: setReviewSpecs/setArchivedSpecs → notify → lists
  - Confiança: 🟢

- [ ] T-03, Implement file/navigate actions
  - Origem no legado: `services/spec-explorer.ts:199,222`
  - Critério de pronto: File Change Request → form; Open → navigate
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Fetch timeout → [] (RF-01)
- [ ] TT-02, Store update re-renders lists (RF-02)
- [ ] TT-03, File Change Request renders form (RF-03)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

- 🔴 Bridge decision (own vs shared) — see `../questions.md`.
