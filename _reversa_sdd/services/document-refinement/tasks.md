# document-refinement, Tarefas de Implementação

## Pré-requisitos

- [ ] `utils/chat-prompt-runner` (`sendPromptToChat`)
- [ ] `document-dependency-tracker` for update prompts

## Tarefas

- [ ] T-01, Implement type→command map + prompt builders
  - Origem no legado: `refinement-gateway.ts:27-39,105`
  - Critério de pronto: refine/update prompts; default `/speckit.clarify`
  - Confiança: 🟢

- [ ] T-02, Implement `submitRequest` send + status
  - Origem no legado: `refinement-gateway.ts:105`
  - Critério de pronto: `sendPromptToChat` → success/error
  - Confiança: 🟢

- [ ] T-03, Implement `loadDocument` (sectioning + language)
  - Origem no legado: `document-preview-service.ts:80`
  - Critério de pronto: md → `##` sections; code → language inference
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, plan refine → `/speckit.plan` prompt sent (RF-01, RF-02)
- [ ] TT-02, Send failure → error status (RF-03)
- [ ] TT-03, Markdown split into sections by `##` (RF-04)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
