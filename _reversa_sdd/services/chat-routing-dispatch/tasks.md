# chat-routing-dispatch, Tarefas de Implementação

## Pré-requisitos

- [ ] `acp-session-manager` + `acp-provider-registry` + `onboarding-service`
- [ ] `utils/ide-host-detector`

## Tarefas

- [ ] T-01, Implement `ChatRouter.resolve/decide` (+60 s cache)
  - Origem no legado: `chat-router.ts:51,71-108,159`
  - Critério de pronto: override / remote-off / auto-probe chain → {acp, copilot-chat}
  - Confiança: 🟢

- [ ] T-02, Implement `rewritePromptForAcp`
  - Origem no legado: `chat-dispatcher.ts:38-61`
  - Critério de pronto: leading `/cmd` → natural language, subsequent lines preserved (R-X-4)
  - Confiança: 🟢

- [ ] T-03, Implement `dispatch` (ACP send + Copilot fallback + files gate)
  - Origem no legado: `chat-dispatcher.ts:83,126-138`
  - Critério de pronto: ACP throw → invalidate + Copilot; files only VS Code≥1.95 (R-X-2)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Remote workspace → Copilot (RF-02)
- [ ] TT-02, `/cmd` rewritten for ACP (R-X-4)
- [ ] TT-03, ACP throw → Copilot fallback (RF-06)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
