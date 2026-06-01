# welcome-lifecycle, Tarefas de Implementação

## Pré-requisitos

- [ ] Zustand store + `webview-shared` bridge

## Tarefas

- [ ] T-01, Implement single-init + ready + listener
  - Origem no legado: `welcome-screen.tsx:98,117`
  - Critério de pronto: `initializedRef` guard; ready once; message listener
  - Confiança: 🟢

- [ ] T-02, Implement message routing + loading/error UI
  - Origem no legado: `welcome-screen.tsx:88,131,153`
  - Critério de pronto: state/install/diagnostic/error; spinner + 2 s hint; error banner
  - Confiança: 🟢

- [ ] T-03, Implement section nav + store FSM
  - Origem no legado: `flowcharts/webview-welcome.md` §2,§5; `welcome-store.ts`
  - Critério de pronto: nav scroll + navigate-section; uninitialized→loading→ready/errored
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, StrictMode → ready once (RF-01)
- [ ] TT-02, diagnostic-added capped at 5 (RF-02)
- [ ] TT-03, nav switches section + posts navigate-section (RF-04)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
