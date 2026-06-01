# start-and-run-session, Design Técnico

> HOW the turn loop is built. Source: `acp-chat-runner.ts` (1082 LOC), `flowcharts/agent-chat.md` §1–§4.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `AcpChatRunner.start` | `(initialPrompt: string)` | `Promise<void>` | Subscribe events, transition `running`, dispatch — `:252` |
| `AcpChatRunner.submit` | `(content: string)` | `Promise<void>` | Append delivered (idle) or queued (in-flight) — `:297` |
| `AcpChatRunner.onAcpEvent` | `(event: AcpSessionEvent)` | `Promise<void>` | Central event dispatcher — `:473` |
| `AcpChatRunner.handleAgentChunk` | `(textDelta, _at)` | `Promise<void>` | Coalesce into turn buffer — `:632` |
| `AcpChatRunner.handleTurnFinished` | `(stopReason)` | `Promise<void>` | Drain follow-up or go idle — `:743` |
| `AcpChatRunner.cancel` / `retry` | `()` | `Promise<void>` / `Promise<string>` | `:823` / `:857` |

## Fluxo Principal

1. **Capacity** — `registry.checkCapacity(source, cap)`; if at cap, `cap-warning-prompt` QuickPick lets the user cancel an idle session, then proceed. 🟢 `agent-chat-registry.ts:224`
2. **Create** — `store.createSession`; resolve capabilities (agent vs catalog). 🟢
3. **Worktree** — if target = `worktree`, `worktreeService.create` (see `worktree-lifecycle/`). 🟢
4. **Start** — `new AcpChatRunner → start()`; subscribe ACP events; transition `running`. 🟢 `:252`
5. **Initial message** — append `UserChatMessage{isInitialPrompt:true, deliveryStatus:'delivered'}`; `dispatchToAcp` sets `turnInFlight=true`. 🟢
6. **Event stream** (`onAcpEvent`, `:473`):
   - `agent-message-chunk` → coalesce into turn buffer, create/update `AgentChatMessage`. 🟢 `:632`
   - `agent-thought-chunk` → update `ThoughtChatMessage`. 🟢
   - `plan-update` → idempotent `PlanChatMessage`. 🟢
   - `tool-call` → `ToolCallChatMessage{status:'pending'}`. 🟢
   - `tool-call-update` → patch `status` + `affectedFiles`. 🟢 `:674-741`
   - `writeTextFile` RPC → `pendingWritesStore.enqueueWrite` + emit `pending-writes/changed`. 🟢
   - `error` → `ErrorChatMessage` + transition `failed`. 🟢
   - `turn-finished` → `handleTurnFinished`. 🟢 `:743`
7. **Turn finish** — if `queuedFollowUp` exists, mark `queued→delivered` and dispatch next turn; else transition `waiting-for-input`. 🟢
8. **User input while waiting** — idle → append delivered + dispatch; in-flight → append queued (one slot, else throw); cancel → `cancel()`; deactivate → shutdown flush. 🟢
9. **End** — terminal state → worktree cleanup (if any) → `registry.removeSession`. 🟢

## Fluxos Alternativos

- **At capacity, user declines to cancel:** start is aborted; no session created. 🟢
- **Pending write rejected:** the write resolves `rejected`; the agent continues without the file applied. 🟢
- **Read-only/terminal session submit:** rejected with a fixed reason (R-AC-3), `deliveryStatus='rejected'`. 🟢

## Dependências

- `services/acp/acp-session-manager` + `acp-client` — the event stream and `set_model`. 🟢
- `pending-writes-store` — write gate. 🟢
- `agent-chat-session-store` — `appendMessages` (which may archive). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Single `turnInFlight` flag + one `queuedFollowUp` slot (not an unbounded queue) | `acp-chat-runner.ts:310` | 🟢 |
| Mode/model changes deferred to next turn, audited via system message | `acp-chat-runner.ts:985` | 🟢 |
| Message-chunk coalescing into a per-turn buffer (not one message per chunk) | `acp-chat-runner.ts:632` | 🟢 |

## Estado Interno

`turnInFlight: boolean`, `queuedFollowUp: UserChatMessage | null`, per-turn agent/thought text buffers keyed by `turnId`. Lifecycle state is the session's `lifecycleState`. 🟢

## Observabilidade

Turn start/finish and lifecycle transitions logged/telemetered via `telemetry.ts`. 🟡

## Riscos e Lacunas

- 🟡 `stopReason` semantics from ACP agents vary; `handleTurnFinished` treats any finish as turn end.
