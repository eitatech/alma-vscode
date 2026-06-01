# agent-chat-sidebar-binding, Design Técnico

> HOW the sidebar bridge works. Source: `agent-chat-view-provider.ts` (1405), `flowcharts/providers.md` §1–§2.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `AgentChatViewProvider.resolveWebviewView` | `(view, ctx, token)` | void | `:230` |
| `AgentChatViewProvider.handleWebviewMessage` | `(msg)` | void | router — `:425` |
| `AgentChatViewProvider.reveal` / `focusSession` | dual-id focus | void | `:297/333` |
| `AgentChatViewProvider.bindSession` | `(sessionId)` | `Promise<void>` | `:556` |
| `SidebarSessionBinding.sendSessionLoaded` | snapshot | void | `:980` |
| `SidebarSessionBinding.handleInputSubmit` | submit | void | `:1111` |
| `SidebarSessionBinding.flushTranscriptDeltas` | delta diff | void | `:1264` |

## Fluxo Principal

### Resolve + route (§1)
1. `resolveWebviewView` → set HTML (`get-webview-content agent-chat/sidebar`), wire `onDidReceiveMessage`, push catalog + session list + permission default. 🟢
2. `pendingFocusSessionId?` → `bindSession`; else idle launcher. 🟢
3. Messages: `agent-chat/ready`→re-push; `control/switch-session`→bind; `control/new-session`→dispatch composer; `control/request-new-chat`→start flow (cleared); `control/change-permission-default`→Global config; `control/probe-models`→invalidate; default→`binding.handleWebviewMessage` (if bound). 🟢

### Submit + delta (§2)
1. `input/submit`: sessionId == bound? build pending `UserChatMessage`. 🟢
2. cloud → append + reject (read-only); terminal → append + reject; no runner → append + reject. 🟢
3. else post `messages/appended` pending → `runner.submit`: ok → `delivered`; throw → `rejected: err.message`. 🟢
4. `onDidChangeManifest`: lifecycle changed → post `session/lifecycle-changed`; `maybePushModelsChanged` (diff ids/current); `flushTranscriptDeltas` (diff by `knownMessageIds`) → post only fresh. 🟢

## Fluxos Alternativos

- **No binding for a default message:** ignored (idle). 🟢
- **Dual view:** both `.focus` fired; inactive host-gated one no-ops. 🟢

## Dependências

- `agent-chat` (registry/store/runner/model-discovery/catalog), `utils/get-webview-content`, VS Code config API. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Inner binding object owns the per-session bridge | `:556` | 🟢 |
| Append-only deltas keyed by `knownMessageIds` | `:1264` | 🟢 |
| Permission default centralized in Global config | `:534-550` | 🟢 |

## Estado Interno

The active `SidebarSessionBinding`, `knownMessageIds`, model-probe in-flight promise, `pendingFocusSessionId`. 🟢

## Observabilidade

Telemetry via `agent-chat/telemetry`. 🟢

## Riscos e Lacunas

- 🟡 Restored-state path (3rd view state) details are extensive — see `agent-chat-view-provider.ts` for the full restore flow.
