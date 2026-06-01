# start-and-run-session (use-case)

> Use-case under `agent-chat`. The end-to-end runtime of a local ACP session.
> Source: `acp-chat-runner.ts`, `agent-chat-registry.ts`, `flowcharts/agent-chat.md` §1–§4.

## Visão Geral

Starting a new agent chat session, dispatching the initial prompt, streaming the agent's turn (messages, thoughts, plans, tool calls), gating file writes, queuing at most one follow-up, and ending the session (naturally, by cancel, by error, or by shutdown). This is the core conversational loop. 🟢

## Responsabilidades

- Enforce the concurrent-session capacity cap before creating an ACP session. 🟢
- Subscribe to the ACP event stream and project each event into a transcript mutation. 🟢
- Maintain the **turn-in-flight** flag and the single queued follow-up slot. 🟢
- Apply mode/model changes on the next turn (audited via a system message). 🟢
- Drive lifecycle transitions and trigger end-of-session cleanup. 🟢

## Regras de Negócio

- **R-AC-1** New runs always create a new session; terminal states are absorbing. 🟢 `acp-chat-runner.ts:304`
- **R-AC-2** At most one queued follow-up while a turn is in flight; second submit throws. 🟢 `acp-chat-runner.ts:310`
- **R-AC-8** Mode/model changes apply on the next turn, audited via system message; execution target immutable after first turn. 🟢 `acp-chat-runner.ts:985`
- Capacity: when ACP sessions ≥ cap, prompt the user to cancel an idle (waiting-for-input) session before starting. 🟢 `agent-chat-registry.ts:224`; `cap-warning-prompt.ts`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Capacity gate before start | Must | At cap, a QuickPick offers to cancel an idle session; cancelling proceeds, else aborts |
| RF-02 | Start session and dispatch initial prompt | Must | `start(prompt)` → `running`; initial `UserChatMessage` with `deliveryStatus='delivered'` |
| RF-03 | Project ACP events to transcript | Must | `agent-message-chunk`→`AgentChatMessage`; `agent-thought-chunk`→`ThoughtChatMessage`; `plan-update`→idempotent `PlanChatMessage`; `tool-call`→`ToolCallChatMessage(pending)`; `tool-call-update`→patch status+affectedFiles |
| RF-04 | Buffer `writeTextFile` as a pending write | Must | RPC enqueues a `PendingWrite`, emits `pending-writes/changed`, blocks the turn until resolved |
| RF-05 | Single queued follow-up | Must | Submit while idle → dispatch; submit while in-flight → queue (one only); second queue throws (R-AC-2) |
| RF-06 | Turn finish handling | Must | `turn-finished` dispatches a queued follow-up if present, else transitions to `waiting-for-input` |
| RF-07 | Cancel / deactivate / error end the session | Must | `cancel()`→`cancelled`; deactivate→`ended-by-shutdown`; error→`failed`; each triggers cleanup |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Confiabilidade | Errors in the event stream emit an `ErrorChatMessage` and transition to `failed` rather than crashing | `acp-chat-runner.ts` (error branch); `flowcharts/agent-chat.md` §1 | 🟢 |
| Segurança | The turn blocks on pending writes until the user resolves them | `pending-writes-store.ts:87` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado capacidade disponível e um agente ACP selecionado
Quando o usuário inicia a sessão com um prompt
Então a sessão entra em 'running' e a mensagem inicial é entregue (delivered)

Dado um turno em andamento que emite um writeTextFile
Quando o agente solicita a escrita
Então um PendingWrite é enfileirado e o turno bloqueia até Accept/Reject

Dado um turno em andamento
Quando o usuário envia um follow-up e depois um segundo follow-up
Então o primeiro é enfileirado e o segundo lança erro (R-AC-2)

Dado uma sessão em 'running'
Quando ocorre um erro no stream de eventos
Então uma ErrorChatMessage é emitida e a sessão transiciona para 'failed'
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Start + dispatch + event projection (RF-02, RF-03) | Must | The conversation cannot exist without it |
| Pending-write gate (RF-04) | Must | Safety boundary |
| Follow-up queueing (RF-05, RF-06) | Must | Core turn discipline |
| Capacity gate (RF-01) | Should | Protects resources; has a user prompt |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `acp-chat-runner.ts` | `start` (252), `submit` (297), `onAcpEvent` (473), `handleAgentChunk` (632), `handleTurnFinished` (743), `cancel`/`retry` (823/857) | 🟢 |
| `agent-chat-registry.ts` | `checkCapacity` (224) | 🟢 |
| `cap-warning-prompt.ts` | capacity QuickPick | 🟢 |
| `pending-writes-store.ts` | `enqueueWrite` (93) | 🟢 |
