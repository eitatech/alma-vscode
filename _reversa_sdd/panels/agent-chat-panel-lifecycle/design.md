# agent-chat-panel-lifecycle, Design Técnico

> HOW the panel runs. Source: `agent-chat-panel.ts` (617), `flowcharts/panels.md` §2.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `createDefaultAgentChatPanelHost` | `(context)` | `AgentChatPanelHost` | wraps `createWebviewPanel` — `:89` |
| `AgentChatPanel.open` | `()` | void | idempotent — `:195` |
| `AgentChatPanel.flushTranscriptDeltas` | `()` | void | append-only — `:550` |
| `AgentChatPanel.readTranscript` | `(id)` | messages | scoped memento — `:571` |

## Fluxo Principal (§2)

1. `open`: opened && panel? → reveal Beside, return. 🟢
2. else `host.createPanel(session)` → wire `onDidReceiveMessage`/`onDidDispose` → subscribe `store.onDidChangeManifest` → telemetry `PANEL_OPENED`. 🟢
3. Messages: `agent-chat/ready` → `sendSessionLoaded` (snapshot + transcript); `input/submit` → `handleInputSubmit`; `control/cancel` → `runner.cancel`; `control/retry` → `runner.retry?`. 🟢
4. `onManifestChanged`: lifecycle != last → post `session/lifecycle-changed (from→to)`; then `flushTranscriptDeltas` (diff vs `knownMessageIds` → append fresh). 🟢

## Fluxos Alternativos

- **Dispose:** fire `_onDidDispose` once → dispose emitter + subscriptions. 🟢

## Dependências

- `agent-chat` (`AgentChatRegistry`/`AgentChatSessionStore`/runner, `transcriptKeyFor`, telemetry), `utils/get-webview-content`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Host abstraction for testability | `:89` | 🟢 |
| Registration owned by the command handler (R-AC-11) | `:203-212` | 🟢 |
| Manifest-subscription drives all UI deltas | `:550` | 🟢 |

## Estado Interno

`panel`, `opened`, `knownMessageIds`, `lastLifecycleState`, `_onDidDispose`. 🟢

## Observabilidade

`telemetry.PANEL_OPENED`. 🟢

## Riscos e Lacunas

- 🟡 `readTranscript` casts into the store memento (`transcriptKeyFor`) instead of a public API — couples the panel to store internals.
