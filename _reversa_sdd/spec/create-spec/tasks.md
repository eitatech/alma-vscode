# create-spec, Tarefas de Implementação

## Pré-requisitos

- [ ] `spec-manager` active-system detection + `utils/chat-prompt-runner`
- [ ] A create-spec webview panel host

## Tarefas

- [ ] T-01, Implement the create-spec webview protocol + draft autosave
  - Origem no legado: `create-spec-input-controller.ts:125`; `types.ts` (CreateSpec* messages)
  - Critério de pronto: init/autosave/import/attach/submit/close-attempt handled
  - Confiança: 🟢

- [ ] T-02, Implement the submission strategy factory
  - Origem no legado: `spec-submission-strategy.ts:14,49,62`
  - Critério de pronto: OpenSpec reads prompt + STOP-for-approval; SpecKit strategy; result reported (R-SP-12)
  - Confiança: 🟢

- [ ] T-03, Implement import-markdown + attach-images (capped)
  - Origem no legado: `create-spec-input-controller.ts`; `flowcharts/spec.md` §5
  - Critério de pronto: `.md` import returns content; images returned as capped data URLs
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, OpenSpec submit requires prompt file (R-SP-12)
- [ ] TT-02, SpecKit submit uses the SpecKit strategy
- [ ] TT-03, Close with unsaved draft → confirm-close

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None. 🟡 confirm image data-URL cap.
