# webview-shared (module), Tarefas de Implementação

## Pré-requisitos

- [ ] Vite single-bundle config (`#root[data-page]`); React 18
- [ ] `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`, `@vscode/codicons`

## Tarefas

- [ ] T-01, Implement bootstrap + page registry
  - Origem no legado: `index.tsx:10,16`; `page-registry.tsx:107`
  - Critério de pronto: createRoot; data-page (default simple); lazy renderers; "Unknown page" fallback
  - Confiança: 🟢

- [ ] T-02, Implement the VS Code bridge + dev fallback
  - Origem no legado: `bridge/vscode.ts:18,47`
  - Critério de pronto: `acquireVsCodeApi` once; dev echo (getState→{}, setState→no-op)
  - Confiança: 🟢

- [ ] T-03, Implement themed primitives
  - Origem no legado: `components/ui/{button,vscode-select,vscode-checkbox}.tsx`; `{icon,pill}-button.tsx`; `textarea-panel.tsx:26`
  - Critério de pronto: CVA Button; themed select/checkbox; auto-grow textarea
  - Confiança: 🟢

- [ ] T-04, Implement utilities
  - Origem no legado: `lib/utils.ts:4`; `utils/relative-time.ts:12`; `lib/document-title-utils.ts`
  - Critério de pronto: `cn`; `formatRelativeTime` thresholds; `toFriendlyName`
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Known data-page mounts lazy feature (RF-01)
- [ ] TT-02, Unknown data-page → "Unknown page" (RF-01)
- [ ] TT-03, Dev fallback installed outside VS Code (RF-03)
- [ ] TT-04, formatRelativeTime thresholds (RF-05)

## Ordem Sugerida

1. T-02 (bridge) → T-01 (bootstrap) → T-03 (primitives) → T-04 (utils).

## Lacunas Pendentes (🔴)

- 🔴 Register `devin-progress`/`cloud-agent-progress` pages OR remove the panels that request them (see `questions.md`).
