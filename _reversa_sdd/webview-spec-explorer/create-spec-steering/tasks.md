# create-spec-steering, Tarefas de Implementação

## Pré-requisitos

- [ ] `webview-shared` `@/bridge/vscode` + `vscode.setState`; shared `StatusBanner`

## Tarefas

- [ ] T-01, Implement draft hydrate + ready/init
  - Origem no legado: `create-spec-view/index.tsx:55`; `create-steering-view/index.tsx:78`
  - Critério de pronto: getState draft + host init hydrate
  - Confiança: 🟢

- [ ] T-02, Implement debounced autosave
  - Origem no legado: `create-spec-view/index.tsx:71,140`
  - Critério de pronto: 600 ms → setState + autosave; skip when unchanged
  - Confiança: 🟢

- [ ] T-03, Implement validation + submit + result
  - Origem no legado: `create-steering-view/index.tsx:152`; `create-spec-view/index.tsx:104`
  - Critério de pronto: required field; submit; success/error banner
  - Confiança: 🟢

- [ ] T-04, Implement dirty/close guard (+ spec import/attach)
  - Origem no legado: `create-spec-view/index.tsx:285,305`; `create-steering-view/index.tsx:289`
  - Critério de pronto: close-attempt(dirty) → confirm-close; markdown import overwrite; image attach
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, 600 ms autosave persists (RF-02)
- [ ] TT-02, Missing required field blocks submit (RF-03)
- [ ] TT-03, Dirty close guard round-trips (RF-05)

## Ordem Sugerida

1. T-01 → T-02 → T-03 → T-04.

## Lacunas Pendentes (🔴)

None.
