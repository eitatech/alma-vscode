# bootstrap-page-selection, Tarefas de Implementação

## Pré-requisitos

- [ ] Vite single-bundle config; the feature pages (lazy)

## Tarefas

- [ ] T-01, Implement bootstrap (createRoot + data-page)
  - Origem no legado: `index.tsx:10,16`
  - Critério de pronto: data-page read (default simple); render renderer or "Unknown page"
  - Confiança: 🟢

- [ ] T-02, Implement the page registry (lazy + unknown)
  - Origem no legado: `page-registry.tsx:107,108`
  - Critério de pronto: 11 pages; `getPageRenderer` undefined for unknown; withSuspense lazy
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Known page mounts lazily (RF-02)
- [ ] TT-02, Unknown page → fallback (RF-03)

## Ordem Sugerida

1. T-02 → T-01.

## Lacunas Pendentes (🔴)

- 🔴 Register or remove `devin-progress`/`cloud-agent-progress` (see `../questions.md`).
