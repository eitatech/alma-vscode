# orchestration-lanes, Tarefas de Implementação

## Pré-requisitos

- [ ] `webview-shared` bridge + `components/workflow` primitives
- [ ] Host `orchestration` snapshot contract

## Tarefas

- [ ] T-01, Implement ready handshake + snapshot ingest
  - Origem no legado: `orchestration/index.tsx:79`; `flowcharts/webview-orchestration.md` §1
  - Critério de pronto: ready posted; snapshot sets state (EMPTY fallback)
  - Confiança: 🟢

- [ ] T-02, Implement bucket grouping + lane render
  - Origem no legado: `orchestration/index.tsx:60,106`
  - Critério de pronto: 4 lanes with counts + SessionCards
  - Confiança: 🟢

- [ ] T-03, Implement empty-state decision tree + actions
  - Origem no legado: `orchestration/index.tsx:112`
  - Critério de pronto: first-match copy + action; session/header actions posted
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Pre-bucketed sessions land in correct lanes (RF-02)
- [ ] TT-02, Empty + degradedReasons → correct empty-state (RF-03)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
