# services (module), Design Técnico

> Module-level `design.md`. Source: `src/services/`. Confidence: 🟢 unless noted.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `AcpClient.ensureStarted` / `start` | spawn + initialize | `Promise<void>` | shared start promise — `acp-client.ts:433/555` |
| `AcpClient.sendPrompt` | `(sessionKey, prompt)` | `Promise<void>` | create-on-demand — `:453` |
| `AcpClient.createSession` | `()` | session | `newSession({cwd, mcpServers:[]})` — `:706` |
| `AcpClient.buildClientHandler` | `()` | SDK `Client` | sessionUpdate/requestPermission/read/writeTextFile — `:888` |
| `AcpClient.setSessionModel` | `(modelId)` | — | `unstable_setSessionModel`; throws `ACP_NOT_SUPPORTED` — `:806` |
| `AcpSessionManager.send` / `sendPromptDirect` | consent → ensureClient → sendPrompt | — | `:156/173` |
| `ChatRouter.resolve` / `decide` | routing | decision (60 s cache) | `chat-router.ts:51/71` |
| `ChatDispatcher.dispatch` | `(prompt)` | route + send/fallback | `chat-dispatcher.ts:83` |
| `rewritePromptForAcp` | `(prompt)` | natural-language prompt | `chat-dispatcher.ts:38` |
| `PromptLoader.renderPrompt` | `(name, vars)` | string | Handlebars + validation — `prompt-loader.ts:157` |
| `RefinementGateway.submitRequest` | `(payload)` | status | `refinement-gateway.ts:105` |
| `DocumentPreviewService.loadDocument` | `(uri)` | `DocumentArtifact` | `document-preview-service.ts:80` |

## Subsystems

| Subsystem | Files | Role |
|-----------|-------|------|
| ACP runtime | `acp/acp-client.ts`, `acp-session-manager.ts`, `acp-provider-registry.ts`, `provider-bridge.ts`, `providers/*` | spawn + drive CLI agents |
| Chat dispatch | `chat-router.ts`, `chat-dispatcher.ts`, `agent-service.ts` | route ACP vs Copilot |
| Documents | `document-preview-service.ts`, `document-dependency-tracker.ts`, `refinement-gateway.ts` | preview + refine |
| Welcome support | `dependency-checker.ts`, `welcome/install-commands.ts`, `welcome/requirements.ts`, `learning-resources.ts`, `system-diagnostics.ts` | onboarding |
| Cross-cutting | `prompt-loader.ts`, `configuration-service.ts`, `onboarding-service.ts` | prompts + config |

## Fluxo Principal (visão de módulo)

1. **ACP** — `ensureStarted` spawns the CLI, drives `ClientSideConnection` over `ndJsonStream`; `sendPrompt` creates a session on demand and routes session-updates. 🟢 (→ `acp-client-lifecycle/`)
2. **Permission/write** — the `Client` handler resolves permission + buffers writes. 🟢 (→ `permission-and-write-approval/`)
3. **Routing** — `ChatRouter.resolve` (cached) → `ChatDispatcher.dispatch` (rewrite or Copilot fallback). 🟢 (→ `chat-routing-dispatch/`)
4. **Refinement** — doc type → SpecKit command → chat. 🟢 (→ `document-refinement/`)

## State machines (3)

See `flowcharts/services.md`:
- **ACP client lifecycle** (§1): `idle → starting → connected → (disposed | process-exited)`.
- **Permission resolution** (§3): allow/deny short-circuit; ask → remembered/prompt.
- **Chat routing decision** (§5): override → remote-off → auto-probe → {acp, copilot-chat}.

## Dependências

- `agent-chat` (`pending-writes-store`, `diff-stats`), `agents` (loader/registry/cache), `prompts/target` (compiled prompts), `utils` (`cli-detector`, `ide-host-detector`, `chat-prompt-runner`). 🟢
- External: `@agentclientprotocol/sdk`, `handlebars`, `gray-matter`, `vscode`, `node:child_process`/`stream`/`crypto`, the ACP Registry CDN. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| ACP integration over stdio JSON-RPC (one subprocess per (providerId,cwd)) | `acp-client.ts`; `acp-session-manager.ts:84` | 🟢 (ADR-0006) |
| Declarative chat routing with 60 s cache + graceful Copilot fallback | `chat-router.ts:159`; `chat-dispatcher.ts:83` | 🟢 |
| Buffered-write approval as a first-class safety gate | `acp-client.ts:942` | 🟢 (ADR-0009) |
| Remembered-permission memo keyed by ToolKind | `acp-client.ts:1510` | 🟢 |

## Estado Interno

Per-`AcpClient`: connection, sessions map, remembered-permission memo, shared start promise. `ChatRouter` decision cache (60 s); registry cache (24 h). 🟢

## Observabilidade

ACP event bus; onboarding/diagnostics surfaced to the welcome screen. 🟢

## Riscos e Lacunas

- 🟡 ACP model-set is experimental (`unstable_setSessionModel`) — callers must handle `ACP_NOT_SUPPORTED`.
