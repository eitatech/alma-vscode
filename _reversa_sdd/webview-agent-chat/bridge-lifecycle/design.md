# bridge-lifecycle, Design Técnico

> HOW mount/ready/render + actions work. Source: `index.tsx`, `use-session-bridge.ts:480-674`, `flowcharts/webview-agent-chat.md` §1,§3.

## Fluxo Principal (§1)

1. `AgentChatFeature` mounts → `readSurfaceFromDom` (`data-surface`) + `readSessionIdFromDom` (`data-session-id`, ignore `unknown-session`). 🟢
2. `useSessionBridge(panel ? initialSessionId : undefined)` → `useReducer(INITIAL_STATE)`. 🟢
3. effect: `postMessage('agent-chat/ready')` → `window.addEventListener('message')`. 🟢
4. incoming → `translateIncoming` → scope check → `dispatch` → reducer. 🟢
5. render: `!ready` → "Loading session…"; bound → StatusHeader + ChatTranscript + RetryAction? + PendingChangesBar + InputBar; sidebar unbound → SessionsList + NewSessionComposer; panel unbound → "Session not available". 🟢

## Outgoing actions (§3)

`submit → input/submit`; `cancel → control/cancel`; `retry → control/retry`; `change* → control/change-*`; `switchSession → control/switch-session`; `startNewSession → control/new-session`; `requestNewChat → control/request-new-chat`; pending-write settlements → `pending-writes/*`; `changePermissionDefault → control/change-permission-default`; `probeModels → control/probe-models`. All → `vscode.postMessage`. Short-circuit without `activeSessionId` (except the sidebar-only set). 🟢

## Dependências

- `webview-shared` `@/bridge/vscode`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| DOM-attr surface inference | `index.tsx` | 🟢 |
| Ready handshake before any host push | `flowcharts/webview-agent-chat.md` §1 | 🟢 |

## Estado Interno

`AgentChatBridgeState`; the message-event listener. 🟢

## Observabilidade

Render branch + retryable error. 🟡

## Riscos e Lacunas

None. 🟢
