# agent-chat-panel-lifecycle, Tarefas de Implementação

## Pré-requisitos

- [ ] `agent-chat` store/registry/runner + `transcriptKeyFor`
- [ ] `utils/get-webview-content`; the agent-chat webview page

## Tarefas

- [ ] T-01, Implement host abstraction + idempotent `open`
  - Origem no legado: `agent-chat-panel.ts:89,195`
  - Critério de pronto: reveal-if-open; create+wire otherwise; no `attachPanel` (R-AC-11)
  - Confiança: 🟢

- [ ] T-02, Implement protocol plumbing (ready/cancel/retry)
  - Origem no legado: `flowcharts/panels.md` §2
  - Critério de pronto: ready→snapshot; cancel/retry→runner
  - Confiança: 🟢

- [ ] T-03, Implement manifest-driven deltas + one-shot dispose
  - Origem no legado: `agent-chat-panel.ts:550-565`
  - Critério de pronto: lifecycle post; append-only deltas; `_onDidDispose` once
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Re-open reveals (idempotent) (RF-01)
- [ ] TT-02, Manifest change appends only fresh messages (RF-03)
- [ ] TT-03, Dispose fires once (RF-04)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None. 🟡 prefer a public store API over `transcriptKeyFor` memento cast.
