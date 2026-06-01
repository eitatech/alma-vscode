# panels (module), Design Técnico

> Module-level `design.md`. Source: `src/panels/`. Confidence: 🟢 unless noted.

## Interface (registered panels)

| Panel | viewType | File:line |
|-------|----------|-----------|
| Agent Chat (editor) | `gatomia.agentChatPanel` | `agent-chat-panel.ts:157` |
| New Agent Session | `gatomia.agentChat.newSession` | `new-session-panel.ts:86` |
| Welcome | `gatomia.welcomeScreen` | `welcome-screen-panel.ts:57` |
| Document Preview | `gatomia.documentPreview` | `document-preview-panel.ts:38` |
| Cloud Agent Progress | `gatomia.cloudAgentProgress` | `cloud-agent-progress-panel.ts:36` |
| Devin Progress | `gatomia.devinProgress` | `devin-progress-panel.ts:29` |

## Key functions

| Símbolo | Assinatura | Observação |
|---------|-----------|------------|
| `createDefaultAgentChatPanelHost` | `(context) => AgentChatPanelHost` | wraps real `createWebviewPanel` — `:89` |
| `AgentChatPanel.open` / `handleInputSubmit` / `flushTranscriptDeltas` | lifecycle + submit + delta | `:195/382/550` |
| `WelcomeScreenPanel.show` / `flushPendingMessages` | singleton + ready gate | `:82/307` |
| `DocumentPreviewPanel.renderDocument` | reveal + `preview/load-document` | `:59` |
| `NewSessionPanel.open` / `handleStart` | open + self-dispose | `:103/193` |
| `CloudAgentProgressPanel.sendSessionData` | session projection | `:107` |

## Fluxo Principal (visão de módulo)

1. **Agent Chat panel** — idempotent open; wire protocol; manifest-driven deltas. 🟢 (→ `agent-chat-panel-lifecycle/`)
2. **Submit** — optimistic pending → delivered/rejected. 🟢 (→ `input-submit-delivery/`)
3. **New session** — picker → start → self-dispose handoff. 🟢 (→ `new-session-panel/`)
4. **Cloud progress** — project sessions → DTO. 🟢 (→ `cloud-agent-progress-panel/`)
5. **Welcome / Preview** — ready-gated buffering (§1). 🟢

## State machines (4)

See `flowcharts/panels.md`:
- **Readiness gate** (§1, welcome/preview): buffer until `*/ready` → flush.
- **AgentChatPanel** (§2): `closed → open → disposed` (one-shot `_onDidDispose`).
- **NewSessionPanel** (§4): `created → open → disposed`; reopen-after-dispose throws.
- **User-message delivery** (§3): `pending → delivered | rejected`.

## Dependências

- Consumes `agent-chat`, `cloud-agents`, `devin`, `commands` (`NewSessionProviderItem`), `services` (preview wiring), `utils/get-webview-content`. 🟢
- Reused by `providers` (welcome/hooks), `commands`, `extension.ts`. 🟢
- External: `vscode` (Webview/Panel APIs, `ViewColumn`, `EventEmitter`), `node:crypto`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Host/DI abstraction for testable panels | `agent-chat-panel.ts:89` | 🟢 |
| Command handler owns panel↔session registration (not the panel) | `agent-chat-panel.ts:203-212` | 🟢 (R-AC-11) |
| Singleton Welcome panel | `welcome-screen-panel.ts:58` | 🟢 |
| Read-only preview (edit-attempt warns) | `document-preview-panel.ts:158` | 🟢 |

## Estado Interno

Per-panel: `pendingMessages`, `isWebviewReady`, `knownMessageIds`, `_onDidDispose` emitter, transcript memento scope. 🟢

## Observabilidade

`telemetry.PANEL_OPENED`; preview logs every message to an `OutputChannel`. 🟢

## Riscos e Lacunas

- 🟡 `new-session-panel.ts` ships a stub HTML; the real picker may live in the agent-chat composer (see `questions.md`).
- 🟡 `devin-progress-panel.ts` + `devin-message-handler.ts` look superseded by the Cloud Agent panel (spec 016) — possibly dormant (see `questions.md`).
- 🟡 `readTranscript` casts into the store's memento (`transcriptKeyFor`) rather than a public API — fragile coupling.
