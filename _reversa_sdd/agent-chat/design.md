# agent-chat (module), Design Técnico

> Module-level `design.md`. Focus: HOW the module is built, from the legacy code.
> Source: `src/features/agent-chat/`. Confidence: 🟢 unless noted.

## Interface

The module exposes a service-oriented API consumed by `providers`, `panels`, `commands`, and (via postMessage) `webview-agent-chat`.

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `AgentChatSessionStore.initialize` | `()` | `Promise<void>` | Restart-restore, idempotent — `agent-chat-session-store.ts:164` |
| `AgentChatSessionStore.createSession` | `(input: CreateSessionInput)` | `Promise<AgentChatSession>` | `:240` |
| `AgentChatSessionStore.appendMessages` | `(sessionId, messages)` | `Promise<void>` | Triggers archival — `:284` |
| `AgentChatSessionStore.flushForDeactivation` | `()` | `Promise<void>` | Atomic shutdown stamp — `:475` |
| `AcpChatRunner.start` | `(initialPrompt: string)` | `Promise<void>` | `acp-chat-runner.ts:252` |
| `AcpChatRunner.submit` | `(content: string)` | `Promise<void>` | `:297` |
| `AcpChatRunner.cancel` / `retry` | `()` | `Promise<void>` / `Promise<string>` | `:823` / `:857` |
| `AgentCapabilitiesService.resolve` | `(agentId)` | `ResolvedCapabilities` | `:134` |
| `AgentWorktreeService.create/inspect/cleanup` | worktree lifecycle | `WorktreeHandle` / inspection / void | `:151/269/318` |
| `AgentChatRegistry.checkCapacity` | `(source, cap)` | `CapacityCheck` | `:224` |
| `ModelDiscoveryService.getModels` | `(providerId)` | `Promise<DiscoveredModels>` | `:141` |
| `PendingWritesStore.enqueueWrite/flush` | write-gate buffer | `Promise<PendingWriteResolution>` | `:93/127` |

## Tipos de domínio (catálogo)

| Tipo | Local | Forma resumida |
|------|-------|----------------|
| `AgentChatSession` | `types.ts:380` | Root aggregate: id, source (`acp`/`cloud`), agentId, capabilities, executionTarget, lifecycleState, worktree?, cloud?, timestamps |
| `SessionLifecycleState` | `types.ts:18` | `initializing\|running\|waiting-for-input\|completed\|failed\|cancelled\|ended-by-shutdown`; `TERMINAL_STATES` at `:33` |
| `ChatMessage` (union by `role`) | `types.ts:367` | `user\|agent\|thought\|plan\|system\|tool\|error`; common `id/sessionId/timestamp/sequence` |
| `UserChatMessage` | `types.ts:235` | `content`, `isInitialPrompt`, `deliveryStatus` (`pending\|queued\|delivered\|rejected`), `rejectionReason?` |
| `ToolCallChatMessage` | `types.ts:331` | `toolCallId`, `status` (`pending\|running\|succeeded\|failed\|cancelled`), `affectedFiles?` |
| `WorktreeHandle` | `types.ts:151` | `id`, `absolutePath`, `branchName`, `baseCommitSha`, `status` (`created\|in-use\|abandoned\|cleaned`) |
| `ExecutionTarget` (union) | `types.ts:140` | `{local} \| {worktree, worktreeId} \| {cloud, providerId, cloudSessionId}` |
| `PendingWrite` | `pending-writes-store.ts:57` | `id`, `path`, `proposedContent`, `oldText`, `linesAdded/Removed?` |
| `SessionManifest(Entry)` | `types.ts:563/581` | Persisted index (`schemaVersion:1`, entries with denormalized lifecycle/target/timestamps) |
| `ResolvedCapabilities` | `types.ts:117` | `{source: agent\|catalog\|none, modes, models, thinkingLevels?, agentRoles?, acceptsFollowUp}` |

## Fluxo Principal (visão de módulo)

1. A command/provider calls `store.createSession`; capabilities are resolved (`AgentCapabilitiesService.resolve`). 🟢
2. If `executionTarget.kind === 'worktree'`, `AgentWorktreeService.create` adds an isolated branch. 🟢
3. An `AcpChatRunner` is constructed and `start()`ed; it subscribes to the ACP event stream (from `services/acp`). 🟢
4. The runner projects events → transcript mutations via `appendMessages` (which may trigger archival). 🟢
5. Turn finishes → if a follow-up is queued it dispatches; else transitions to `waiting-for-input`. 🟢
6. `writeTextFile` RPCs are buffered into `PendingWritesStore` and resolved by user Accept/Reject. 🟢
7. Cancel/deactivate/error → terminal state → worktree cleanup (if any) → registry removal. 🟢

> Detailed flows live in the use-case folders: `start-and-run-session/`, `transcript-archival/`, `worktree-lifecycle/`.

## State machines (5)

See `_reversa_sdd/flowcharts/agent-chat.md` for diagrams.

- **Session lifecycle** — `types.ts:18-43`, `acp-chat-runner.ts:890-911`. Terminal states absorbing.
- **User-message delivery** — `types.ts:229-243`, `acp-chat-runner.ts:304-328`: `pending → queued → delivered | rejected`.
- **Tool-call status** — `types.ts:311-316`, `acp-chat-runner.ts:674-741`: `pending → running → succeeded/failed/cancelled`.
- **Worktree status** — `types.ts:151-168`: `created → in-use → cleaned | abandoned`.

## Dependências

- `services/acp` (acp-session-manager, acp-client) — spawns/drives ACP sessions; source of the event stream. 🟢
- `services/document-preview-service` — artifact sections. 🟢
- `cloud-agents` — cloud polling/registry feeding the cloud read-only adapter. 🟢
- `hooks` — agent presets, Copilot model cache. 🟢
- `utils` — IDE-host detection (ACP eligibility). 🟢
- External: `vscode`, `node:crypto` (`randomUUID`), `node:fs`. No third-party diff library — `diff-stats.ts` is hand-rolled. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Two-store split: in-memory `AgentChatRegistry` vs persisted `AgentChatSessionStore` (manifest + JSONL transcripts) | `agent-chat-registry.ts`, `agent-chat-session-store.ts` | 🟢 |
| Hybrid capability resolution, agent-reported wins over static catalog | `agent-capabilities-service.ts:140` | 🟢 |
| Cloud sessions modeled as read-only mirrors through a dedicated adapter | `cloud-chat-adapter.ts`; `types.ts:539` | 🟢 |
| Worktree-based isolation as a first-class execution target | `agent-worktree-service.ts`; `types.ts:140` | 🟢 |

## Estado Interno

`AgentChatRegistry` holds the live index of sessions/panels/runners (memory). `AgentChatSessionStore` persists the manifest (`schemaVersion:1`) and per-session JSONL transcripts; archived slices live in sibling JSONL files (`hasArchive`/`transcriptArchived`). 🟢

## Observabilidade

`telemetry.ts` emits session/turn events; lifecycle transitions and capacity decisions are logged. 🟡 exact event names not enumerated here — see `telemetry.ts`.

## Riscos e Lacunas

- 🟡 The cloud read-only adapter shares the `AgentChatSession` shape; the canonical vs non-canonical session shape question is a cross-module concern (see `orchestration/autonomous-task-loop`).
- 🟢 The "one panel per session" rule is enforced by the command handler, not this module (see `commands`).
