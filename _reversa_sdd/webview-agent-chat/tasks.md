# webview-agent-chat (module), Tarefas de Implementação

## Pré-requisitos

- [ ] `webview-shared` `@/bridge/vscode`; React 18
- [ ] `types.ts` contract mirror in lockstep with `src/features/agent-chat/types.ts` (R-X-6)

## Tarefas

- [ ] T-01, Define `types.ts` (contract mirror + webview projections)
  - Origem no legado: `types.ts:11`
  - Critério de pronto: mirrors extension types; no `src/` import (R-X-6)
  - Confiança: 🟢

- [ ] T-02, Implement `useSessionBridge` (reducer + send/receive)
  - Origem no legado: `use-session-bridge.ts:194,296,447,480`
  - Critério de pronto: reducer; `translateIncoming` scoping; Set-dedup; applyPatch
  - Confiança: 🟢

- [ ] T-03, Implement `AgentChatFeature` shell
  - Origem no legado: `index.tsx:34,242,251`
  - Critério de pronto: surface/session detection; render tree; retryable-error surfacing
  - Confiança: 🟢

- [ ] T-04, Implement `InputBar` + `NewSessionComposer`
  - Origem no legado: `input-bar.tsx:94,259,300`; `new-session-composer.tsx:83`
  - Critério de pronto: gating precedence; composer canSubmit + provider-switch reset
  - Confiança: 🟢

- [ ] T-05, Implement transcript/chips/session/pending-writes components
  - Origem no legado: `chat-transcript.tsx`, `chat-message-item.tsx`, `tool-call-card.tsx`, chip-*, `session-switcher.tsx`, `pending-changes-bar.tsx`
  - Critério de pronto: per-role rendering; chip chrome; switching; Accept/Reject bar
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Appended re-delivery deduped (RF-03)
- [ ] TT-02, InputBar precedence readOnly→!acceptsFollowUp→terminal (RF-05)
- [ ] TT-03, Composer canSubmit requires provider + prompt (RF-06)
- [ ] TT-04, No `src/` imports (R-X-6)

## Ordem Sugerida

1. T-01 → T-02 → T-03 → T-04 → T-05.

## Lacunas Pendentes (🔴)

None. 🟡 keep the contract mirror in sync.
