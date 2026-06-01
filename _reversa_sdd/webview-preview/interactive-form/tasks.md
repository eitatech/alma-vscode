# interactive-form, Tarefas de Implementação

## Pré-requisitos

- [ ] `webview-shared` bridge; host form contract

## Tarefas

- [ ] T-01, Implement `FormStore` FSM + validation engine
  - Origem no legado: `form-store.ts:133,174,293,345`
  - Critério de pronto: init/dirty/validate/prepareSubmission; readOnly gating
  - Confiança: 🟢

- [ ] T-02, Implement `submitForm` bridge
  - Origem no legado: `api/form-bridge.ts:76,79`
  - Critério de pronto: requestId + 10 s; reject on 0 dirty
  - Confiança: 🟢

- [ ] T-03, Implement `PreviewFormContainer` (type-routed fields)
  - Origem no legado: `components/forms/preview-form-container.tsx:49`
  - Critério de pronto: field render by type; submit/discard actions
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, 0-dirty submit rejects (RF-04)
- [ ] TT-02, readOnly blocks updateField (RF-05)
- [ ] TT-03, Invalid field blocks submit (RF-03)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
