# preview-lifecycle, Tarefas de Implementação

## Pré-requisitos

- [ ] `webview-shared` bridge; `mermaid`; the markdown renderer (see `../markdown-pipeline/`)

## Tarefas

- [ ] T-01, Implement ready + store subscription + section render
  - Origem no legado: `preview-app.tsx:91`; `preview-store.ts`
  - Critério de pronto: ready; load-document/show-placeholder; sections/code/fallback
  - Confiança: 🟢

- [ ] T-02, Implement Mermaid mount loop
  - Origem no legado: `preview-app.tsx:162,178`
  - Critério de pronto: createRoot into `.mermaid` with hashed id; cleanup unmounts
  - Confiança: 🟢

- [ ] T-03, Implement click delegation + form/update banners
  - Origem no legado: `preview-app.tsx:57-88`
  - Critério de pronto: task-group + `.md` link delegated; forms/update rendered conditionally
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Sections render + mermaid mounts (RF-02, RF-03)
- [ ] TT-02, `.md` link → open-file (RF-05)
- [ ] TT-03, No metadata → fallback (RF-02)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
