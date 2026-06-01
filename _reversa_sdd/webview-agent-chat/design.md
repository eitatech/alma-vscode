# webview-agent-chat (module), Design Técnico

> Module-level `design.md`. Source: `ui/src/features/agent-chat/`. Confidence: 🟢 unless noted.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `useSessionBridge` | `(initialSessionId?)` | `AgentChatBridge` | store + send/receive — `use-session-bridge.ts:480` |
| `reducer` | `(state, BridgeAction)` | state | `:194` |
| `translateIncoming` | `(activeId, initialId, data)` | `BridgeAction \| undefined` | `:296` |
| `applyPatch` | per-variant patch | message | `:447` |
| `AgentChatFeature` | `()` | JSX | shell — `index.tsx:34` |
| `InputBar` / `resolveDisabledReason` | composer + gating | JSX / reason | `input-bar.tsx:94/259` |
| `NewSessionComposer` | empty-state form | JSX | `new-session-composer.tsx:83` |

## Tipos (contract mirror)

`types.ts` (418 LOC) mirrors `src/features/agent-chat/types.ts` + webview projections: `AgentChatSessionView`, `AgentChatCatalog`, `SidebarSessionListItem`. **No `src/` import.** 🟢 (R-X-6)

## Fluxo Principal (visão de módulo)

1. **Mount** — read surface + session id; `useSessionBridge` → `useReducer(INITIAL_STATE)` → post `agent-chat/ready` → listen. 🟢 (→ `bridge-lifecycle/`)
2. **Incoming** — `translateIncoming` (type → handler, session-scoped) → dispatch → reducer. 🟢 (→ `message-reducer-routing/`)
3. **Render** — ready? bound? → transcript + input bar / sidebar list + composer / fallback. 🟢
4. **Gating** — InputBar precedence + composer canSubmit. 🟢 (→ `inputbar-composer-gating/`)

## State machines

The bridge reducer is the hub; it projects the host's `SessionLifecycleState` (no FSM of its own). See `flowcharts/webview-agent-chat.md` §1–§5. 🟢

## Dependências

- `webview-shared` (`@/bridge/vscode`). Crosses the bridge to the extension `agent-chat` (every `agent-chat/*` message). 🟢
- External: `react`, `@vscode/codicons`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Single `useReducer` bridge store | `use-session-bridge.ts:480` | 🟢 |
| `INCOMING_HANDLERS` table + session scoping | `use-session-bridge.ts:296,322-440` | 🟢 |
| Two surfaces (sidebar/panel) from one tree | `index.tsx:34` | 🟢 |
| Contract-mirror types (no `src/` import) | `types.ts:11` | 🟢 (R-X-6) |

## Estado Interno

`AgentChatBridgeState` (ready, transcript, activeSessionId, catalog, modelsLoading, pendingWrites, permissionDefault, sessionList, clearedReason) + seen-id `Set`. 🟢

## Observabilidade

Render branches + retryable-error surfacing (`findLatestRetryableError`). 🟡

## Riscos e Lacunas

- 🟡 The contract mirror must be kept in lockstep with `src/` types (parity tests guard drift — see `webview-shared`).
