# inputbar-composer-gating, Tarefas de Implementação

## Pré-requisitos

- [ ] The bridge (catalog, modelsLoading, probeModels) + `types.ts`

## Tarefas

- [ ] T-01, Implement `InputBar` + `resolveDisabledReason`
  - Origem no legado: `input-bar.tsx:94,121,130,153,259`
  - Critério de pronto: precedence disabled reason; Enter/Shift+Enter; non-empty Send; busy→Stop
  - Confiança: 🟢

- [ ] T-02, Implement `ModelChip`
  - Origem no legado: `input-bar.tsx:300-386`
  - Critério de pronto: dynamic/loading/static/hidden per state
  - Confiança: 🟢

- [ ] T-03, Implement `NewSessionComposer` gating
  - Origem no legado: `new-session-composer.tsx:83,92,129,195,233,425,456`
  - Critério de pronto: first-enabled default; canSubmit; provider-switch reset + re-probe; label suffixes
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, readOnly disables InputBar (RF-01)
- [ ] TT-02, Empty value disables Send (RF-02)
- [ ] TT-03, Provider switch resets + re-probes (RF-06)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
