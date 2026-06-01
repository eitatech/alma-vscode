# webview-spec-explorer (module), Tarefas de Implementação

## Pré-requisitos

- [ ] `webview-shared` (`@/bridge/vscode`, `pill-button`, `textarea-panel`)
- [ ] Extension `spec` + `steering` message contracts
- [ ] 🔴 Decide on R-X-6 drift remediation (see `questions.md`) before reimplementation

## Tarefas

- [ ] T-01, Implement `SpecExplorerService` (request/response + timeout)
  - Origem no legado: `services/spec-explorer.ts:154,167,206,222`
  - Critério de pronto: fetch → [] after 5 s; submit/file/navigate actions
  - Confiança: 🟢 — ⚠️ migrate to shared bridge if R-X-6 is enforced
- [ ] T-02, Implement the observable store
  - Origem no legado: `stores/spec-explorer-store.ts:11,73,83`
  - Critério de pronto: `useSyncExternalStore`; setReviewSpecs/setArchivedSpecs; selector hook
  - Confiança: 🟢
- [ ] T-03, Implement review lists + `ChangeRequestForm`
  - Origem no legado: `components/spec-explorer/*`
  - Critério de pronto: lists + empty states; form validation + duplicate detection
  - Confiança: 🟢
- [ ] T-04, Implement create-spec + create-steering views
  - Origem no legado: `create-spec-view/index.tsx:55,71`; `create-steering-view/index.tsx:78,152`
  - Critério de pronto: required fields; 600 ms autosave; import overwrite; close guard
  - Confiança: 🟢
- [ ] T-05, Implement interactive + simple views
  - Origem no legado: `interactive-view/index.tsx:12`; `simple-view/index.tsx`
  - Critério de pronto: command-keyed playground; static placeholder
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Fetch timeout → [] (RF-01)
- [ ] TT-02, Duplicate CR title detected (RF-03)
- [ ] TT-03, create-spec dirty close guard (RF-04)
- [ ] TT-04, (if R-X-6 enforced) no `src/` imports + shared bridge

## Ordem Sugerida

1. T-01 → T-02 → T-03 → T-04 → T-05.

## Lacunas Pendentes (🔴)

- 🔴 R-X-6 drift: migrate to the shared bridge + a contract mirror, or accept the coupling (see `questions.md`).
