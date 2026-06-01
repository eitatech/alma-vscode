# change-request-form, Tarefas de Implementação

## Pré-requisitos

- [ ] Active CR list from the store; `webview-shared` form primitives

## Tarefas

- [ ] T-01, Implement live duplicate detection
  - Origem no legado: `change-request-form.tsx:44,104`
  - Critério de pronto: `normalizeTitle` match among non-addressed → warning
  - Confiança: 🟢

- [ ] T-02, Implement required validation + submit
  - Origem no legado: `change-request-form.tsx:72`
  - Critério de pronto: title+description+severity required; trimmed submit
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Normalized duplicate title warns (RF-01)
- [ ] TT-02, Missing severity blocks submit (RF-02)

## Ordem Sugerida

1. T-01 → T-02.

## Lacunas Pendentes (🔴)

None. 🟡 keep normalization identical to the backend.
