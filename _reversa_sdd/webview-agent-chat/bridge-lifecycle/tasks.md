# bridge-lifecycle, Tarefas de Implementação

## Pré-requisitos

- [ ] `webview-shared` `@/bridge/vscode`; the reducer (see `../message-reducer-routing/`)

## Tarefas

- [ ] T-01, Implement surface/session detection + mount
  - Origem no legado: `index.tsx` (readSurface/readSessionId)
  - Critério de pronto: DOM attrs read; `unknown-session` → undefined; ready posted; listener registered
  - Confiança: 🟢

- [ ] T-02, Implement the render decision tree
  - Origem no legado: `index.tsx:34`; `flowcharts/webview-agent-chat.md` §1
  - Critério de pronto: loading / bound / sidebar-unbound / panel-fallback branches
  - Confiança: 🟢

- [ ] T-03, Implement outgoing actions
  - Origem no legado: `use-session-bridge.ts:508-674`
  - Critério de pronto: each action posts the right message; active-session short-circuit
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Ready posted on mount (RF-02)
- [ ] TT-02, Render branches correct (RF-03)
- [ ] TT-03, Action short-circuits without active session (RF-04)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
