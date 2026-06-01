# new-session-panel, Tarefas de Implementação

## Pré-requisitos

- [ ] ACP provider registry update event; `NewSessionProviderItem`
- [ ] 🟡 Confirm this panel is still reachable (vs the composer) — see `../questions.md`

## Tarefas

- [ ] T-01, Implement `open` (throw-if-disposed, reveal, create+broadcast)
  - Origem no legado: `new-session-panel.ts:103`
  - Critério de pronto: disposed→throw; existing→reveal; else create + `new-session/providers`
  - Confiança: 🟢

- [ ] T-02, Implement start + self-dispose handoff
  - Origem no legado: `new-session-panel.ts:193,199-204`
  - Critério de pronto: valid payload → `onStart` → finally dispose
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Open-after-dispose throws (RF-01)
- [ ] TT-02, Start → onStart → dispose (RF-03)

## Ordem Sugerida

1. T-01 → T-02.

## Lacunas Pendentes (🔴)

None. 🟡 reachability vs composer (see `../questions.md`).
