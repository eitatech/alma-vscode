# input-submit-delivery, Design Técnico

> HOW submit + delivery work. Source: `agent-chat-panel.ts:382-445`, `flowcharts/panels.md` §3.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `AgentChatPanel.handleInputSubmit` | `(content)` | void | `:382` |

## Fluxo Principal (§3)

1. Build a pending `UserChatMessage` (sequence 0; store re-numbers on read). 🟢
2. source == cloud? → append + patch `rejected: read-only cloud`. 🟢
3. `TERMINAL_STATES` has lifecycleState? → append + patch `rejected: terminal state`. 🟢
4. runner attached? no → append + patch `rejected: no runner`. 🟢
5. else post `messages/appended` pending → `runner.submit` exists? no → patch `rejected: no follow-up`. 🟢
6. `await runner.submit(content)` → ok → patch `delivered`; throw → patch `rejected: error.message`. 🟢

## Algorithm

**Optimistic user message** — append `pending` (seq 0) → `runner.submit` → patch `delivered`/`rejected`. Mirrors `agent-chat`'s delivery FSM. 🟢

## Dependências

- `agent-chat` (`TERMINAL_STATES`, the runner, the store for the message append/patch). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Optimistic append before runner result | `flowcharts/panels.md` §3 | 🟢 |
| Layered rejection checks (cloud → terminal → runner → submit) | `agent-chat-panel.ts:404-445` | 🟢 |

## Estado Interno

The pending message id (for the later patch). 🟢

## Observabilidade

Delivery status visible in the webview. 🟡

## Riscos e Lacunas

None notable. 🟢 (mirrors the same rules as `providers/agent-chat-sidebar-binding`).
