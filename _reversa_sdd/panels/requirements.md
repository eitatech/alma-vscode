# panels (module)

> Module-level `requirements.md`. Bounded context: **Presentation infra**.
> Source: `src/panels/` (~2,018 LOC, 8 files). Complexity: medium.
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`panels` are standalone `vscode.WebviewPanel` wrappers (editor-area panels) — the counterpart to the sidebar providers. Each class owns one panel's lifecycle: create/reveal, load the shared React bundle by **page id** via `getWebviewContent`, broker that surface's `postMessage` protocol, and dispose idempotently. Members: the per-session Agent Chat panel, the singleton Welcome screen, the read-only Document Preview, a lightweight New Session picker, and Cloud Agent / Devin progress panels. No domain logic — projection + routing only. Two files use DI/host abstraction for testability. 🟢

## Responsabilidades

- Create/reveal/dispose webview panels by page id. 🟢
- Broker each panel's `postMessage` protocol; buffer until `*/ready` where applicable. 🟢
- Project feature-layer state (sessions, transcripts, documents) to the webview. 🟢
- Route user actions back to runners/services/commands. 🟢

## Regras de Negócio

- **R-AC-11** `AgentChatPanel` does **not** call `registry.attachPanel`; the command handler is the single source of truth for registration (one-panel-per-session). 🟢 `agent-chat-panel.ts:203-212`
- **R-AC-3** Cloud (read-only) sessions reject `input/submit`; terminal sessions reject follow-up. 🟢 `agent-chat-panel.ts:404-420`
- No runner / runner lacks `submit` ⇒ message `rejected`. 🟢 `agent-chat-panel.ts:422-445`
- Transcript pushed as append-only deltas (diff by id). 🟢 `agent-chat-panel.ts:550-565`
- `WelcomeScreenPanel` is a process-wide singleton (`static currentPanel`); `show()` reveals existing. 🟢 `welcome-screen-panel.ts:58,82`
- `NewSessionPanel` self-disposes after every start attempt (hand off to the real panel). 🟢 `new-session-panel.ts:199-204`
- `DocumentPreviewPanel` is read-only: `edit-attempt` warns, never mutates. 🟢 `document-preview-panel.ts:158-163`
- Panels created with `enableScripts + retainContextWhenHidden + localResourceRoots:[extensionUri]`. 🟢
- Cloud progress `displayStatus` from the active provider's `getStatusDisplay`, fallback raw status. 🟢 `cloud-agent-progress-panel.ts:119`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Register panel types | Must | `gatomia.{agentChatPanel,agentChat.newSession,welcomeScreen,documentPreview,cloudAgentProgress,devinProgress}` |
| RF-02 | Agent Chat panel lifecycle | Must | idempotent open/reveal; one-shot `onDidDispose`; no `attachPanel` (R-AC-11) |
| RF-03 | Input submit + delivery | Must | optimistic pending → delivered/rejected; cloud/terminal/no-runner rejection (R-AC-3) |
| RF-04 | Readiness gate | Must | welcome + preview buffer until `*/ready` then flush FIFO |
| RF-05 | New session handoff | Should | self-dispose after start attempt |
| RF-06 | Cloud progress projection | Should | sessions → DTO with provider display status |
| RF-07 | Read-only preview | Should | edit-attempt warns, no mutation |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Testabilidade | DI/host abstraction allows unit tests without VS Code | `agent-chat-panel.ts:89`; `new-session-panel.ts` (DI) | 🟢 |
| Performance | Append-only deltas + retainContextWhenHidden | `agent-chat-panel.ts:550` | 🟢 |
| Confiabilidade | Ready-gated buffering avoids lost messages | `flowcharts/panels.md` §1 | 🟢 |

## Critérios de Aceitação

```gherkin
Dado o AgentChatPanel aberto para uma sessão
Quando open() é chamado de novo
Então o painel existente é revelado (idempotente), sem novo registro (R-AC-11)

Dado uma sessão cloud
Quando input/submit chega
Então a mensagem é marcada rejected (read-only) (R-AC-3)

Dado o NewSessionPanel
Quando o usuário inicia uma sessão
Então onStart roda e o painel se autodescarta (handoff)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Panel types + chat lifecycle + submit + readiness (RF-01–RF-04) | Must | Core panel surfaces |
| New session + progress + preview (RF-05–RF-07) | Should | Supporting surfaces |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `agent-chat-panel.ts` | `open` (195), `handleInputSubmit` (382), `flushTranscriptDeltas` (550), `readTranscript` (571) | 🟢 |
| `welcome-screen-panel.ts` | `show` (82), `flushPendingMessages` (307) | 🟢 |
| `document-preview-panel.ts` | `renderDocument` (59) | 🟢 |
| `new-session-panel.ts` | `open` (103), `handleStart` (193) | 🟢 |
| `cloud-agent-progress-panel.ts` | `sendSessionData` (107) | 🟢 |
| `devin-progress-panel.ts` / `*-message-handler.ts` | progress routers | 🟢 |

> See `questions.md` for the 🟡 possibly-dormant New Session + Devin progress panels.
