# panels (module), Tarefas de Implementação

## Pré-requisitos

- [ ] `agent-chat` registry/store/runner + `transcriptKeyFor` + `TERMINAL_STATES`
- [ ] `cloud-agents` storage/registry; `services` preview wiring; `utils/get-webview-content`
- [ ] The shared React webview bundle (page ids)

## Tarefas

- [ ] T-01, Implement `AgentChatPanel` + host abstraction
  - Origem no legado: `agent-chat-panel.ts:89,157,195,203-212`
  - Critério de pronto: idempotent open; one-shot dispose; no `attachPanel` (R-AC-11)
  - Confiança: 🟢

- [ ] T-02, Implement input submit + delivery + transcript deltas
  - Origem no legado: `agent-chat-panel.ts:382,422-445,550-565`
  - Critério de pronto: optimistic pending; cloud/terminal/no-runner rejection; append-only deltas (R-AC-3)
  - Confiança: 🟢

- [ ] T-03, Implement the readiness gate (welcome + preview)
  - Origem no legado: `welcome-screen-panel.ts:103,307`; `document-preview-panel.ts`
  - Critério de pronto: buffer until `*/ready`, flush FIFO; singleton welcome
  - Confiança: 🟢

- [ ] T-04, Implement `NewSessionPanel` (open + self-dispose)
  - Origem no legado: `new-session-panel.ts:103,193,199-204`
  - Critério de pronto: open throws if disposed; start → onStart → always dispose
  - Confiança: 🟢

- [ ] T-05, Implement `CloudAgentProgressPanel` + message handlers
  - Origem no legado: `cloud-agent-progress-panel.ts:107,119`; `*-message-handler.ts`
  - Critério de pronto: session→DTO with provider display status; refresh/open-external/open-pr routed
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Re-open reveals existing panel (R-AC-11)
- [ ] TT-02, Cloud/terminal submit rejected (R-AC-3)
- [ ] TT-03, Welcome/preview buffer until ready (RF-04)
- [ ] TT-04, NewSession self-disposes after start (RF-05)

## Ordem Sugerida

1. T-01 → T-02 → T-03 → T-04 → T-05.

## Lacunas Pendentes (🔴)

None blocking. 🟡 confirm New Session + Devin panel reachability (see `questions.md`).
