# start-and-run-session, Tarefas de Implementação

## Pré-requisitos

- [ ] `agent-chat` module types + stores (see `../tasks.md`) implemented
- [ ] `services/acp` event stream wired and emitting `AcpSessionEvent`s
- [ ] `pending-writes-store` available

## Tarefas

- [ ] T-01, Implement capacity gate before session creation
  - Origem no legado: `agent-chat-registry.ts:224`; `cap-warning-prompt.ts`
  - Critério de pronto: at cap, a QuickPick offers idle sessions to cancel; declining aborts the start
  - Confiança: 🟢

- [ ] T-02, Implement `AcpChatRunner.start` (subscribe + dispatch initial prompt)
  - Origem no legado: `acp-chat-runner.ts:252`
  - Critério de pronto: session transitions to `running`; initial `UserChatMessage` delivered; `turnInFlight=true`
  - Confiança: 🟢

- [ ] T-03, Implement the ACP event dispatcher `onAcpEvent`
  - Origem no legado: `acp-chat-runner.ts:473,632,674-741`
  - Critério de pronto: each event type maps to the correct transcript mutation (see design §6)
  - Confiança: 🟢

- [ ] T-04, Implement `submit` with single queued follow-up
  - Origem no legado: `acp-chat-runner.ts:297,310`
  - Critério de pronto: idle→dispatch; in-flight→queue one; second queue throws (R-AC-2)
  - Confiança: 🟢

- [ ] T-05, Implement `handleTurnFinished` (drain follow-up or go idle)
  - Origem no legado: `acp-chat-runner.ts:743`
  - Critério de pronto: queued follow-up dispatched next turn, else `waiting-for-input`
  - Confiança: 🟢

- [ ] T-06, Implement `writeTextFile` buffering into the pending-write gate
  - Origem no legado: `pending-writes-store.ts:93`; `acp-chat-runner.ts` (write branch)
  - Critério de pronto: RPC enqueues a `PendingWrite`, emits change, blocks turn until resolved
  - Confiança: 🟢

- [ ] T-07, Implement `cancel`/`retry` and deactivation/error paths
  - Origem no legado: `acp-chat-runner.ts:823,857`
  - Critério de pronto: terminal transitions are correct and trigger cleanup + registry removal
  - Confiança: 🟢

- [ ] T-08, Implement next-turn application of mode/model changes
  - Origem no legado: `acp-chat-runner.ts:985`
  - Critério de pronto: a mode/model change applies on the next turn and is audited via a system message (R-AC-8)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Happy path: start → agent chunks → tool call → turn-finished → waiting-for-input
- [ ] TT-02, Error path: stream error → ErrorChatMessage + `failed`
- [ ] TT-03, Second follow-up while in-flight throws (R-AC-2)
- [ ] TT-04, Pending write blocks the turn until Accept/Reject

## Ordem Sugerida

1. T-02/T-03 (start + event dispatch) — the spine.
2. T-04/T-05 (turn discipline).
3. T-06 (write gate), T-07 (termination), T-08 (deferred changes).

## Lacunas Pendentes (🔴)

None. 🟡 `stopReason` interpretation is best-effort.
