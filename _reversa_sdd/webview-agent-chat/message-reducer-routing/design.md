# message-reducer-routing, Design Técnico

> HOW incoming routing works. Source: `use-session-bridge.ts:194-447`, `flowcharts/webview-agent-chat.md` §2.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `translateIncoming` | `(activeId, initialId, data)` | `BridgeAction \| undefined` | `:296` |
| `reducer` | `(state, action)` | state | `:194` |
| `applyPatch` | `(message, patch)` | message | `:447` |

## Incoming map (§2)

| Host message | Action |
|--------------|--------|
| `session/loaded` | ready=true, replace transcript |
| `messages/appended` | Set-dedup by id |
| `messages/updated` | per-variant `applyPatch` |
| `session/lifecycle-changed` | update lifecycle |
| `session/cleared` | reset + clearedReason |
| `catalog/loaded` | catalog + modelsLoading |
| `session/models-changed` | update models |
| `sessions/list-changed` | update list |
| `pending-writes/changed` | update pending writes |
| `permission-default/changed` | only ask/allow/deny |

## Session scoping

`messages/*`, `lifecycle-changed`, `models-changed`, `pending-writes/changed` → dropped if `payload.sessionId != activeSessionId`. Panel `session/loaded` dropped if `session.id != initialSessionId`. 🟢

## Algorithms

- **postMessage translation** — `type → INCOMING_HANDLERS[type]` → typed action (or undefined); scoping before dispatch. 🟢
- **Idempotent append** — `Set` of seen ids. 🟢
- **Per-variant patch** — `messages/updated` patches the discriminated-union member without widening. 🟢

## Dependências

- The reducer state shape (`types.ts`). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Handler table over a big switch (complexity ceiling) | `use-session-bridge.ts:296` | 🟢 |
| Scope-before-dispatch (no cross-session bleed) | `:347-418` | 🟢 |

## Estado Interno

`AgentChatBridgeState` + seen-id `Set`. 🟢

## Observabilidade

Unrouted/mismatched messages silently dropped. 🟡

## Riscos e Lacunas

None. 🟢
