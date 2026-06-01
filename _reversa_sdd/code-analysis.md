# Code Analysis — gatomia

> Consolidated technical analysis produced by the Reversa Archaeologist (escavação phase), module by module.
> Confidence scale: 🟢 CONFIRMED (read directly from code) · 🟡 INFERRED · 🔴 GAP (needs human validation).
> Per-module Mermaid flowcharts live in `flowcharts/<module>.md`. Data structures are detailed in `data-dictionary.md`.

## Progress

Modules analyzed: **22 / 22** ✅ — `agent-chat`, `agents`, `cloud-agents`, `devin`, `hooks`, `orchestration`, `spec`, `steering`, `tasks`, `providers`, `services`, `panels`, `commands`, `utils`, `prompts`, `webview-agent-chat`, `webview-spec-explorer`, `webview-hooks-view`, `webview-orchestration`, `webview-preview`, `webview-welcome`, `webview-shared`.

> ✅ **Escavação complete** — all 15 extension modules (`src/`) and all 7 webview modules (`ui/src/`) analyzed.

---

## Module: `agent-chat`

**Path:** `src/features/agent-chat/` · **LOC:** ~5,615 (16 source files) · **Complexity:** 🟢 medium

### Purpose
Chat-panel runtime for autonomous coding agents (ACP local agents and cloud agents). Owns session lifecycle, transcript persistence and archival, capability negotiation, git worktree handling, model discovery, and the pending file-write approval gate. Bridges the VS Code extension host to agent backends via an event stream and exposes a webview-facing API.

### Primary files
| File | Role |
|------|------|
| `acp-chat-runner.ts` (1082) | Core event loop: subscribes to ACP session events, maps them to transcript mutations, manages turn/follow-up queuing, lifecycle transitions, and user-input dispatch. |
| `agent-chat-session-store.ts` (812) | Persistence: manifest + transcript CRUD, archival (count/size thresholds), retention eviction, orphaned-worktree migration, atomic shutdown flush. |
| `types.ts` (664) | Authoritative type definitions (lifecycle states, messages, capabilities, worktrees, execution targets, storage contracts). |
| `agent-capabilities-service.ts` (345) | Hybrid capability resolver (agent-reported merged over static catalog, agent-wins). |
| `agent-chat-registry.ts` (318) | In-memory index of live sessions/panels/runners; concurrent-session capacity cap; shutdown coordination. |
| `agent-worktree-service.ts` (389) | Git worktree lifecycle (create isolated branch, inspect for changes, cleanup with confirmation). |
| `model-discovery-service.ts` (271) | Model-list resolver with 5-min TTL cache and Copilot/ACP/catalog fallback chain. |
| `pending-writes-store.ts` (222) | Buffers agent `writeTextFile` calls and resolves them via user accept/reject. |

### Key functions (🟢 confirmed)
| Function | Location | Signature |
|----------|----------|-----------|
| `AcpChatRunner.start` | acp-chat-runner.ts:252 | `(initialPrompt: string) => Promise<void>` |
| `AcpChatRunner.submit` | acp-chat-runner.ts:297 | `(content: string) => Promise<void>` |
| `AcpChatRunner.onAcpEvent` | acp-chat-runner.ts:473 | `(event: AcpSessionEvent) => Promise<void>` |
| `AcpChatRunner.handleAgentChunk` | acp-chat-runner.ts:632 | `(textDelta: string, _at: number) => Promise<void>` |
| `AcpChatRunner.handleTurnFinished` | acp-chat-runner.ts:743 | `(stopReason: string) => Promise<void>` |
| `AcpChatRunner.cancel` / `retry` | acp-chat-runner.ts:823 / 857 | `() => Promise<void>` / `() => Promise<string>` |
| `AgentChatSessionStore.initialize` | agent-chat-session-store.ts:164 | `() => Promise<void>` (restart-restore, idempotent) |
| `AgentChatSessionStore.createSession` | agent-chat-session-store.ts:240 | `(input: CreateSessionInput) => Promise<AgentChatSession>` |
| `AgentChatSessionStore.appendMessages` | agent-chat-session-store.ts:284 | `(sessionId, messages) => Promise<void>` (triggers archival) |
| `AgentChatSessionStore.flushForDeactivation` | agent-chat-session-store.ts:475 | `() => Promise<void>` (atomic shutdown stamp) |
| `AgentCapabilitiesService.resolve` | agent-capabilities-service.ts:134 | `(agentId) => ResolvedCapabilities` |
| `AgentWorktreeService.create/inspect/cleanup` | agent-worktree-service.ts:151/269/318 | worktree lifecycle |
| `AgentChatRegistry.checkCapacity` | agent-chat-registry.ts:224 | `(source, cap) => CapacityCheck` |
| `ModelDiscoveryService.getModels` | model-discovery-service.ts:141 | `(providerId) => Promise<DiscoveredModels>` |
| `PendingWritesStore.enqueueWrite/flush` | pending-writes-store.ts:93/127 | write-gate buffer |

### State machines
Five state machines (see `flowcharts/agent-chat.md`): **session lifecycle** (`initializing → running ⇄ waiting-for-input`, absorbing terminal states `completed/failed/cancelled/ended-by-shutdown`), **user-message delivery** (`pending → queued → delivered | rejected`), **tool-call status** (`pending → running → succeeded/failed/cancelled`), and **worktree status** (`created → in-use → cleaned | abandoned`).

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| Terminal-state invariant; new runs create new sessions | types.ts:27; acp-chat-runner.ts:304 |
| At-most-one queued follow-up while a turn is in flight (else throws) | acp-chat-runner.ts:310 |
| Transcript archival at >10,000 msgs OR >2 MB (archive oldest 25% to JSONL) | session-store.ts:95,298 |
| Retention cap of 100 sessions; evicted worktrees migrate to orphaned list | session-store.ts:100,268 |
| Concurrent ACP-session cap; idle (waiting-for-input) prioritized for cancel | registry.ts:224 |
| Shutdown atomicity: non-terminal ACP sessions stamped ended-by-shutdown in one update | session-store.ts:475 |
| Cloud sessions are read-only (no submit/retry) | types.ts:539; cloud-chat-adapter.ts |
| Capability precedence: agent-reported wins over catalog | agent-capabilities-service.ts:140 |
| Mode/model change applies to the next turn (audited via system message) | acp-chat-runner.ts:985 |
| Worktree cleanup with dirty/unpushed state requires confirmedDestructive | agent-worktree-service.ts:322 |
| Pending writes block agent execution until accept/reject | pending-writes-store.ts:87 |
| Model-discovery cache TTL: 5 min (resolved) / 1 min ("none") | model-discovery-service.ts:37,176 |

### Algorithms (🟢 confirmed)
- **Transcript archival** — on threshold, pivot at 25% (`Math.floor(len*0.25)`), append oldest slice to JSONL, drop from memory, set `hasArchive`.
- **Capacity check + idle sorting** — filter non-terminal ACP sessions; sort waiting-for-input first, then oldest `updatedAt`.
- **Diff stats** (`diff-stats.ts`) — line-frequency maps; `+`/`-` deltas mirror `git diff --shortstat` (moves over-counted, as in git).
- **Model discovery chain** — Copilot cache → ACP probe → catalog → none, with in-flight promise coalescing.
- **Hybrid capability resolution** — agent-wins merge over catalog, topping up optional fields.
- **Worktree creation** — resolve root → verify git/HEAD → `git worktree add -b` → seed `.gitignore`.

### Dependencies
Internal: `services` (ACP client/registry), `hooks` (agent presets, Copilot model cache), `cloud-agents` (cloud polling/registry), `providers`, `utils` (IDE-host detection). External: `vscode`, `node:crypto` (`randomUUID`), `node:fs`. No third-party diff/algorithm libraries.

---

## Module: `agents`

**Path:** `src/features/agents/` · **LOC:** ~2,554 (11 source files) · **Complexity:** 🟢 medium

### Purpose
Loads agent-definition markdown files (`.agent.md` with YAML frontmatter), validates them, and registers each as a **VS Code chat participant** (GitHub Copilot Chat API). Provides a **tool registry** (named handlers), a **resource cache** (prompts/skills/instructions), a **file-watcher** for hot-reload, and structured **error formatting**.

### Primary files
| File | Role |
|------|------|
| `chat-participant-registry.ts` (488) | Registers agents as chat participants; routes chat requests; executes tools; renders responses/errors; telemetry. |
| `agent-loader.ts` (341) | Discovers `.agent.md`, parses frontmatter (gray-matter), validates, auto-injects `/help`. |
| `tool-registry.ts` (242) | Register/execute named tool handlers; validates names/params; wraps errors; timing. |
| `resource-cache.ts` (308) | Loads + caches prompts/skills/instructions with incremental hot-reload and O(1) lookup. |
| `types.ts` (297) | Core interfaces and error classes. |
| `error-formatter.ts` (308) | Categorizes/sanitizes errors and produces actionable guidance. |
| `file-watcher.ts` (104) | Debounced (500ms) file watcher triggering cache reload. |

### Key functions (🟢 confirmed)
| Function | Location | Signature |
|----------|----------|-----------|
| `AgentLoader.loadAgents` | agent-loader.ts:26 | `(agentsDir) => Promise<AgentDefinition[]>` |
| `AgentLoader.parseAgentFile` | agent-loader.ts:143 | `(filePath) => Promise<AgentDefinition>` |
| `AgentLoader.validateDefinition` | agent-loader.ts:243 | `(agent) => ValidationResult` |
| `ChatParticipantRegistry.registerAgent` | chat-participant-registry.ts:71 | `(agent) => Disposable \| null` |
| `ChatParticipantRegistry.handleChatRequest` | chat-participant-registry.ts:147 | request handler |
| `ToolRegistry.register / execute` | tool-registry.ts:38 / 67 | tool registration + execution |
| `ResourceCache.load / reload / get` | resource-cache.ts:43 / 167 / 264 | cache lifecycle |
| `FileWatcher.onFileChange` | file-watcher.ts:44 | debounced change collector |
| `formatError` | error-formatter.ts:49 | `(error, context?) => FormattedError` |

### State machines
Three (see `flowcharts/agents.md`): **agent lifecycle** (`unloaded → loaded → registered → executing → completed/error`; invalid agents logged, not registered), **resource cache** (`empty → loaded → pending-reload → reloading → loaded`), **tool execution** (`validating → found → executing → completed/failed`).

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| Agent id must be kebab-case `/^[a-z0-9-]+$/` | agent-loader.ts:12,262 |
| name/fullName/description required; ≥1 command; each command needs name/description/tool | agent-loader.ts:272-338 |
| Auto-inject `/help` (tool `agent.help`) when absent | agent-loader.ts:165 |
| Tool name `/^[a-z0-9.-]+$/` and unique (duplicate throws) | tool-registry.ts:25,40,47 |
| Only `.agent.md` processed; recursive scan; frontmatter required | agent-loader.ts:54,95,154 |
| Resource path must be `<dir>/<type>/<name>`; deleted files evicted on reload | resource-cache.ts:216,229 |
| File watcher debounces 500ms (hot-reload) | file-watcher.ts:21 |
| 6 error categories; messages sanitized (paths stripped, capped 200 chars); severity by category | error-formatter.ts:12,270,294 |

### Algorithms (🟢 confirmed)
- **Frontmatter parsing** via gray-matter → `AgentDefinition`, with `/help` auto-injection.
- **Parallel cache load** of prompts/skills/instructions (recursive nested dirs).
- **Incremental reload** — per changed file, update or delete from the right Map.
- **Help formatting** — general command list + command-specific extraction from the agent's markdown body.
- **Error formatting** — type dispatch → categorize → sanitize → actionable guidance.
- **Tool execution** — validate params → lookup handler → run with timing → wrap/format errors.

### Dependencies
Internal: `services` (agent-service orchestrator + configuration-service), `prompts` (resource content). External: `vscode` (Chat API, `workspace.fs`, `FileSystemWatcher`), `gray-matter`, `node:path`.

---

## Module: `cloud-agents`

**Path:** `src/features/cloud-agents/` · **LOC:** ~2,611 (11 source files) · **Complexity:** 🟢 high

### Purpose
Provider-agnostic cloud-agent integration. Abstracts **Devin** (REST) and the **GitHub Copilot coding agent** (GraphQL issues + PR timeline) behind a single `CloudAgentProvider` interface. Owns unified polling (grace periods + backoff), normalized session/task/PR state, credential gating, a provider registry, migration from legacy Devin config, and 7-day session cleanup. Feeds updates to `agent-chat` (spec 018 bridge).

### Primary files
| File | Role |
|------|------|
| `cloud-agent-provider.ts` (135) | `CloudAgentProvider` interface contract (createSession, pollSessions, cancelSession, getExternalUrl, handleBlockedSession). |
| `types.ts` (345) | Canonical types: `AgentSession`, `SessionStatus`, `TaskStatus`, `SessionUpdate`, `PullRequest`, error/action types. |
| `adapters/devin-adapter.ts` (444) | Devin implementation: referential prompt, REST createSession/getSession, status mapping, PR extraction. |
| `adapters/github-copilot-adapter.ts` (533) | GitHub implementation: GraphQL create-issue (agentAssignment), issue/PR timeline polling + mapping. |
| `agent-polling-service.ts` (368) | Poll orchestration: grace-period filtering, backoff (3-failure stop), terminal normalization, credential-expiry callback. |
| `agent-session-storage.ts` (305) | CRUD persistence on `workspaceState`; load-time validation + normalization. |
| `provider-registry.ts` (122) | Register/activate/restore/clear providers. |
| `migration-service.ts` (116) | Legacy-Devin auto-migration + orphaned-config detection. |

### Key functions (🟢 confirmed)
| Function | Location | Signature |
|----------|----------|-----------|
| `CloudAgentProvider.createSession` | cloud-agent-provider.ts:85 | `(task, context) => Promise<AgentSession>` |
| `CloudAgentProvider.pollSessions` | cloud-agent-provider.ts:103 | `(sessions) => Promise<SessionUpdate[]>` |
| `CloudAgentProvider.handleBlockedSession` | cloud-agent-provider.ts:128 | `(session) => ProviderAction \| null` |
| `DevinAdapter.createSession / pollSessions` | devin-adapter.ts:280 / 354 | provider impl |
| `mapDevinToCloudStatus` | devin-adapter.ts:157 | `(devinStatus) => SessionStatus` |
| `GitHubCopilotAdapter.createSession / mapIssueToUpdate` | github-copilot-adapter.ts:161 / 372 | provider impl |
| `AgentPollingService.pollOnce / getSessionsToPoll / applyUpdate` | agent-polling-service.ts:154 / 217 / 255 | poll loop |
| `deriveTerminalTaskStatuses` | agent-polling-service.ts:346 | terminal normalization |
| `AgentSessionStorage.getActive` / `normalizeSession` | agent-session-storage.ts:88 / 248 | persistence + normalization |
| `ProviderRegistry.setActive / restoreActive` | provider-registry.ts:83 / 107 | registry |
| `MigrationService.migrateIfNeeded` | migration-service.ts:65 | legacy migration |
| `SessionCleanupService.cleanup` | session-cleanup-service.ts:40 | 7-day retention |

### State machines
Three (see `flowcharts/cloud-agents.md`): **cloud session** (`PENDING → RUNNING ⇄ BLOCKED → COMPLETED/FAILED/CANCELLED`), **cloud task** (`PENDING → IN_PROGRESS → COMPLETED/FAILED/SKIPPED`), **PR state** (`unknown → open → merged/closed`). Terminal sessions normalize stale task and PR state.

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| Polling: active continuously; open-PR sessions within grace period (5m known / 1h unknown); terminal PRs excluded | agent-polling-service.ts:51,217 |
| Terminal normalization: tasks derived to session status (else SKIPPED); unknown PR → merged (if COMPLETED) else open | agent-polling-service.ts:346; agent-session-storage.ts:248 |
| Credential gating; stop polling after 3 consecutive failures; onCredentialExpiry (FR-020) | agent-polling-service.ts:50,306 |
| Active provider from registry; none → polling skipped; must be registered before activation | provider-registry.ts:72,83 |
| 7-day session retention/cleanup | session-cleanup-service.ts:18,40 |
| Legacy-Devin auto-migration; orphaned active-provider cleared (FR-021) | migration-service.ts:65,90 |
| Inactive provider → its sessions become `isReadOnly`, excluded from polling/active | agent-session-storage.ts:167; agent-polling-service.ts:212 |
| PR reconciliation by URL (preserve createdAt); idempotent updates | adapters; agent-session-storage.ts:149 |

### Algorithms (🟢 confirmed)
- **Poll loop** — grace-period filtering → `provider.pollSessions` → apply updates; backoff stops after 3 failures; credential-expiry callback.
- **Per-provider status mapping** — Devin string map; GitHub issue-state + PR-timeline mapping.
- **Terminal normalization** — derive task statuses + infer PR states for terminal sessions.
- **PR reconciliation** — extract from provider response, match by URL, idempotent merge.
- **Migration** — detect legacy Devin → auto-activate; orphaned-config detection.

### Dependencies
Internal: `devin` (credentials manager, API client/factory, status-mapper), `agent-chat` (consumes `onSessionUpdated`), `providers`, `services`. External: `vscode` (`SecretStorage`, `Memento`, `EventEmitter`), Devin REST API, GitHub GraphQL API, `fetch`, `node:crypto`.

---

## Module: `devin`

**Path:** `src/features/devin/` · **LOC:** ~5,460 (38 source files) · **Complexity:** 🟢 high

### Purpose
The **original, standalone Devin REST integration** (spec `001-devin-integration`). It predates the provider-agnostic `cloud-agents` layer and is still actively wired in `extension.ts` (session manager, polling, cleanup, status/blocked/PR-state listeners). The newer `cloud-agents/adapters/devin-adapter.ts` reuses parts of it (`DevinCredentialsManager`, `DevinApiClientInterface`, `resolveSessionStatus`) — its header states *"Delegates to existing src/features/devin/* modules without breaking changes."* Owns: dual API versioning (v1/v2 vs v3 by token prefix), credentials in `SecretStorage`, session lifecycle + 7-day retention in `workspaceState`, polling (grace cycles + PR-state detection), status mapping, prompt building (single task + task group), sequential batch processing, git validation/commit-push, PR review/link handling, spec `tasks.md` checkbox sync, and a deep error taxonomy with retry/backoff + client-side rate limiting.

### Primary files
| File | Role |
|------|------|
| `devin-polling-service.ts` (487) | Periodic poller (`setInterval`): polls active + recently-completed sessions, resolves status, syncs task statuses, detects PR-state changes, emits status/blocked/PR-state/cycle events. |
| `devin-session-manager.ts` (416) | Orchestrates session creation (`startTask`/`startTaskGroup`), prompt building, local persistence, local-only cancellation. |
| `errors.ts` (331) | Error taxonomy: `DevinError` base + 11 subclasses, `DevinErrorCode` enum, `isRetryableError` guard. |
| `devin-api-client-v1.ts` (240) / `devin-api-client-v3.ts` (219) | Version-specific REST clients (v1/v2 unscoped vs v3 org-scoped) + snake_case→camelCase mappers. |
| `devin-session-storage.ts` (222) | `workspaceState` JSON persistence with in-memory cache, read-time validation, 7-day retention cleanup. |
| `config.ts` (212) | All constants: base URL, token prefixes, polling/retry tuning, storage keys, commands, retention, telemetry prefix. |
| `entities.ts` (194) | Core entity interfaces (all `readonly`): `DevinSession`, `DevinTask`, `DevinCredentials`, `DevinProgressEvent`, `PullRequest`, `TaskArtifact`. |
| `devin-credentials-manager.ts` (187) | `SecretStorage` CRUD; key + metadata stored under separate keys; legacy-format backward-compat. |
| `spec-status-updater.ts` (177) | Marks `- [ ] TXXX` → `- [x]` in `tasks.md` on task completion / PR merge. |
| `retry-handler.ts` (155) / `rate-limiter.ts` (81) | Exponential-backoff retry (honors `Retry-After`); client-side sliding-window rate limiter. |
| `devin-api-client.ts` (152) / `devin-api-http.ts` (130) | Client interface + request/response contracts; shared authenticated `fetch` with HTTP error mapping. |
| `spec-content-reader.ts` (150) | Parses task id/title/description/acceptance-criteria from spec markdown. |
| `git-validator.ts` (143) / `git-operations.ts` (106) | Pre-flight git checks (clean repo, branch, remote); `commit & push` before delegating. |
| `batch-processor.ts` (190) | Sequential one-session-per-task batch with partial-failure tolerance + progress events. |
| `status-mapper.ts` (88) / `api-version-detector.ts` (56) / `devin-api-client-factory.ts` (51) | Status resolution, token-prefix version detection, client factory. |

### Key functions (🟢 confirmed)
| Function | Location | Signature |
|----------|----------|-----------|
| `createDevinApiClient` | devin-api-client-factory.ts:38 | `(opts: CreateClientOptions) => DevinApiClientInterface` |
| `detectApiVersion` | api-version-detector.ts:24 | `(token: string) => ApiVersion` |
| `devinApiRequest` | devin-api-http.ts:31 | `<T>(url, init, token, label) => Promise<T>` |
| `parseRetryAfterMs` | devin-api-http.ts:92 | `(value: string\|null) => number\|undefined` |
| `resolveSessionStatus` / `mapDevinApiStatusToSessionStatus` | status-mapper.ts:60 / 42 | `(apiStatus, statusDetail?) => SessionStatus` |
| `DevinSessionManager.startTask` / `startTaskGroup` | devin-session-manager.ts:159 / 220 | `(params) => Promise<DevinSession>` |
| `DevinSessionManager.cancelSession` | devin-session-manager.ts:283 | `(localId) => Promise<DevinSession>` (local-only) |
| `mapSpecTaskToDevinPrompt` / `mapTaskGroupToDevinPrompt` | devin-session-manager.ts:334 / 360 | `(params) => string` |
| `DevinSessionStorage.save/update/getActive/cleanup` | devin-session-storage.ts:81/102/136/151 | persistence + retention |
| `DevinPollingService.pollOnce` / `pollSession` | devin-polling-service.ts:234 / 305 | poll loop |
| `DevinPollingService.onStatusChange/onBlocked/onPrStateChange` | devin-polling-service.ts:182/197/212 | event subscriptions |
| `DevinCredentialsManager.store/get/markUsed/markInvalid` | devin-credentials-manager.ts:51/80/143/167 | SecretStorage CRUD |
| `withRetry` | retry-handler.ts:51 | `<T>(op, options?) => Promise<T>` |
| `RateLimiter.acquire` | rate-limiter.ts:77 | `() => void` (throws `DevinRateLimitedError`) |
| `validateGitState` / `commitAndPush` | git-validator.ts:44 / git-operations.ts:38 | git pre-flight + commit/push |
| `markTaskAsCompleted` | spec-status-updater.ts:140 | `(content, specTaskId) => string` |
| `extractTaskFromSpec` / `extractIncompleteTasks` | spec-content-reader.ts:53 / 85 | spec markdown parsing |
| `BatchProcessor.processBatch` | batch-processor.ts:122 | `(request) => Promise<BatchResult>` |

### State machines
Two (see `flowcharts/devin.md`): **session status** (`QUEUED/INITIALIZING → RUNNING ⇄ BLOCKED → COMPLETED/FAILED/CANCELLED`, last three terminal via `status-mapper.ts:77`) and **task status** (`PENDING/QUEUED → IN_PROGRESS → COMPLETED/FAILED/CANCELLED`, synced from session status, terminal tasks frozen). PR state (`open → merged/closed`) is detected during polling and drives `tasks.md` updates.

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| Token prefix selects API version: `cog_` → v3 (org-scoped, requires `orgId`), `apk_`/`apk_user_` → v1/v2; unknown prefix throws | api-version-detector.ts:31; config.ts:40,52 |
| v3 client requires non-empty `orgId` (else `DevinOrgIdRequiredError`) | devin-api-client-factory.ts:44; devin-api-client-v3.ts:40 |
| `statusDetail`/`status_enum` overrides base `status` (base can be stale, e.g. "suspended" while finished) | status-mapper.ts:48-71 |
| HTTP mapping: 401/403→auth, 429→rate-limited (parse `Retry-After`), `!ok`→`DevinApiError`, `AbortError`→timeout, else network | devin-api-http.ts:54-81 |
| Cancellation is **local-only** (Devin API exposes no cancel endpoint); rejects sessions already terminal | devin-session-manager.ts:276,292 |
| Task-group prompt forces ONE PR / no per-task branches; branch instructions force PR target = base branch | devin-session-manager.ts:368,402 |
| 7-day session retention; cleanup keeps non-terminal + terminal newer than cutoff | config.ts:130; devin-session-storage.ts:151 |
| Polling: default 5 s (min 3, max 60); `GRACE_CYCLES_AFTER_TERMINAL=6`; recently-completed = terminal + updated <5 min + has PRs | config.ts:62-74; devin-polling-service.ts:70,291 |
| Terminal sessions re-polled in grace window update **only** PR data, not status/tasks | devin-polling-service.ts:352 |
| `RUNNING → BLOCKED` emits blocked event (Devin needs user input) | devin-polling-service.ts:381 |
| PR-state change (e.g. open→merged) emits event → downstream marks `tasks.md` checkbox | devin-polling-service.ts:397; spec-status-updater.ts:91 |
| Retry: 3 attempts, exp backoff `base·2^(n-1)` (base 1 s, cap 30 s, +10% jitter), honors `Retry-After` | config.ts:84-96; retry-handler.ts:133-148 |
| Retryable errors: 5xx `DevinApiError`, network, timeout, rate-limited | errors.ts:99-102,317 |
| Rate limiter: ≥500 ms between calls, ≤60/min (sliding window) | rate-limiter.ts:15,20,44 |
| Network recovery threshold: 5 consecutive failures | network-recovery.ts:23 |
| Session timeout: non-terminal idle >4 h → user warning | session-timeout-handler.ts:18 |
| Pre-flight git: must be a git repo with a clean working tree before starting | git-validator.ts:44-88 |
| `commitAndPush`: `git add -A` → commit only if changes → `git push origin <branch>` | git-operations.ts:62-82 |
| Credentials: API key + metadata stored under separate `SecretStorage` keys; legacy in-JSON-key format read for back-compat | devin-credentials-manager.ts:66-72,86-95 |
| PR actions: `merged`/`closed` → `view` only; else review/approve/request-changes/merge (all currently open the browser) | pr-review-integration.ts:35,106 |

### Algorithms (🟢 confirmed)
- **Token-prefix version detection** — `cog_`→v3, `apk_`→v1; routes to the right client/endpoints.
- **Dual-layer status resolution** — `status_detail` map wins over base `status` map; fallback `RUNNING`.
- **Exponential backoff with jitter** — `base·2^(attempt-1)` capped at 30 s, +0–10% jitter; rate-limit errors use `Retry-After`.
- **Sliding-window rate limiting** — min-interval gate + count of timestamps within the last 60 s.
- **Polling grace window** — after all sessions terminal, keep polling 6 more cycles to catch late PR merges (only terminal sessions <5 min old with PRs).
- **Session→task status sync** — `SESSION_TO_TASK_STATUS` map; terminal tasks are frozen; terminal target stamps `completedAt`.
- **Markdown checkbox mutation** — regex `^(- \[)( )(\] <id>\b)` → `[x]` (idempotent, one write).
- **Spec task extraction** — match `- [ ] TXXX`, gather following non-task lines (≤10) as description and bullet lines as acceptance criteria.

### Dependencies
Internal: consumed by `cloud-agents` (`devin-adapter` reuses credentials/client/status-mapper), `commands` (`devin-commands`, `cloud-agent-commands`), `panels` (`devin-progress-panel`, `devin-message-handler`), `providers` (`devin-progress-provider`), `agent-chat` (`telemetry`), and wired in `extension.ts`. External: `vscode` (`SecretStorage`, `Memento`, `window`, `workspace.fs`, `env`, `Uri`, `OutputChannel`), `node:child_process` (`exec` for git), `node:util` (`promisify`), `node:crypto` (`randomUUID`), `fetch`, Devin REST API (`https://api.devin.ai`).

> 🟡 **INFERRED / overlap note:** `devin` (standalone session-manager/polling/storage) and `cloud-agents` (`agent-polling-service`/`agent-session-storage` + `devin-adapter`) implement overlapping Devin session lifecycles. Both appear wired (standalone Devin path via `devin-commands`/`devin-progress-panel`; unified path via `cloud-agents`). Whether both run simultaneously for the same sessions or are mutually exclusive by entry point needs confirmation in the `commands`/`providers`/`extension` analysis. 🔴 **GAP:** exact division of responsibility (which path "owns" a given session's polling) is not determinable from this module alone.

---

## Module: `hooks`

**Path:** `src/features/hooks/` · **LOC:** ~11,190 (34 source files — largest module) · **Complexity:** 🟢 high

### Purpose
Event-driven **automation engine** (spec `011-custom-agent-hooks`). A *Hook* binds a **trigger** (event source) + optional **conditions** + **schedule** to an **action**. When an SDD agent operation completes (or before it runs), matching hooks fire their action. Six action types: `agent` (SpecKit/OpenSpec command), `git`, `github` (via MCP), `mcp` (MCP server tool), `custom` (Copilot/registry agent), `acp` (local ACP subprocess). Includes `$variable` template substitution, MCP server discovery/execution pooling, a multi-source agent registry, and `workspaceState` persistence. Hooks are detected as "completed" via filesystem watchers (`CommandCompletionDetector`), not just command dispatch.

### Primary files
| File | Role |
|------|------|
| `hook-executor.ts` (1735) | Execution engine: trigger matching, availability pre-checks (MCP/custom agent) with user prompts, condition eval, schedule, action dispatch, success/failure handling, telemetry, execution logs, template expansion, chain-depth/circular-dependency guards, blocking ("before") execution. |
| `types.ts` (1119) | Authoritative contracts: `Hook`, normalized domain model (`EventSource`/`Condition`/`Schedule`), all action params, `MCPServer`/`MCPTool`, `HookExecutionLog`, `ExecutionContext`, constants, type guards. |
| `hook-manager.ts` (938) | Hook CRUD + `workspaceState` persistence, sync+async validation (MCP/agent refs), schema migration, import/export, name-uniqueness, change events. |
| `actions/acp-action.ts` (534) | Spawns a local ACP agent subprocess (stdio/JSON-RPC), runs a session, collects output; rich error taxonomy + lifecycle states. |
| `template-variable-constants.ts` (512) | Variable catalog by category (standard/spec/spec-artifact/repository/agent-metadata/file/output) with `availableFor` trigger gating + lookup helpers. |
| `actions/mcp-action.ts` (473) / `github-action.ts` (454) / `git-action.ts` (246) / `custom-action.ts` (244) / `agent-action.ts` (146) | Per-type action executors, each with its own validation-error classes and result type. |
| `agent-registry.ts` (446) + `agent-registry-types.ts` (255) | Unified registry of invokable agents across sources; availability checks. |
| `template-variable-parser.ts` (362) | `$variableName` extraction/substitution/validation. |
| `services/mcp-client.ts` (310) / `mcp-discovery.ts` (140) / `mcp-execution-pool.ts` (109) / `mcp-parameter-resolver.ts` (83) / `mcp-contracts.ts` (275) | MCP server discovery, tool execution, bounded concurrency, parameter resolution, interfaces. |
| `file-watcher-service.ts` (295) / `services/command-completion-detector.ts` (289) | File-change watching + completion detection that fires triggers. |
| `file-agent-discovery.ts` (272) / `extension-agent-discovery.ts` (258) / `services/acp-agent-discovery-service.ts` (221) / `services/known-agent-*` | Agent discovery from `.agent.md` files, installed extensions, ACP probes, known-agent catalog/preferences. |
| `trigger-registry.ts` (152) | Central `EventEmitter` for trigger events + FIFO history (max 50). |

### Key functions (🟢 confirmed)
| Function | Location | Signature |
|----------|----------|-----------|
| `HookManager.createHook` / `updateHook` / `deleteHook` | hook-manager.ts:132 / 194 / 254 | CRUD (validate → persist → emit) |
| `HookManager.validateHook` | hook-manager.ts:500 | `(hook) => Promise<ValidationResult>` (sync + async MCP/agent) |
| `HookManager.loadHooks` / `migrateHook` | hook-manager.ts:355 / 389 | load + in-place schema migration |
| `HookManager.importHooks` / `exportHooks` | hook-manager.ts:437 / 430 | JSON import (regen ids, skip dupes) / export |
| `HookExecutor.executeHooksForTrigger` | hook-executor.ts:823 | `(agent, operation, timing, event?) => Promise<ExecutionResult[]>` |
| `HookExecutor.executeHook` | hook-executor.ts:~245 | single-hook execution pipeline |
| `HookExecutor.createExecutionContext` / `isCircularDependency` / `isMaxDepthExceeded` | hook-executor.ts:908 / 920 / 927 | chain-guard helpers |
| `HookExecutor.expandTemplate` | hook-executor.ts:1196 | `(template, context) => string` |
| `TriggerRegistry.fireTrigger` / `fireTriggerWithContext` | trigger-registry.ts:57 / 83 | emit trigger event |
| `TemplateVariableParser.extractVariables` / `substitute` / `validateSyntax` | template-variable-parser.ts:181 / 212 / 242 | template ops |
| `getVariablesForTrigger` / `getVariableByName` | template-variable-constants.ts:486 / 501 | variable catalog lookup |
| `CommandCompletionDetector.initialize` / `handleFileChange` | command-completion-detector.ts:92 / — | watcher-driven completion → fire trigger |
| `*ActionExecutor` (acp/mcp/github/git/custom/agent) | `actions/*.ts` | per-type action execution |

### State machines
**Hook execution pipeline** (see `flowcharts/hooks.md`): `enabled? → availability pre-check (MCP/custom) → conditions met? → schedule (immediate/delayed) → dispatch action → success | failure | timeout → record log`. **ACP action lifecycle** (`acp-action.ts`): `PENDING → SPAWNING → HANDSHAKE → SESSION_CREATED → PROMPTING → COLLECTING → DONE | TIMEOUT | ERROR`. **Execution-chain guard**: each chain carries an `executionId`, `executedHooks` set (circular-dependency block) and `chainDepth` (max `MAX_CHAIN_DEPTH=10`).

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| Hooks persisted to `workspaceState` under `gatomia.hooks.configurations`; logs under `gatomia.hooks.execution-logs` | types.ts:570-571; hook-manager.ts:339 |
| Hook name unique, ≤100 chars; id must be UUID v4; immutable fields (`id`/`createdAt`/`executionCount`) cannot be updated | types.ts:556,620; hook-manager.ts:203,720 |
| Migration on load: default `timing="after"`; legacy `trigger` → normalized `events[]` + `schedule:{immediate}`; MCP `agentId` → `modelId` | hook-manager.ts:389-425 |
| Trigger match requires `agent` + `operation` + **same `timing`**; matched hooks sorted by `createdAt` (deterministic order) | hook-executor.ts:835-858 |
| Blocking execution only when `timing="before"` AND `waitForCompletion` set | hook-executor.ts:873-882; types.ts:47 |
| Async validation: MCP action validates server/tool reference; custom action validates agent exists (availability is warn-only) | hook-manager.ts:697-715,798 |
| Circular-dependency block (`executedHooks` set) + max chain depth 10 | types.ts:565; hook-executor.ts:920-928 |
| Action timeout default 30 s (`ACTION_TIMEOUT_MS`); execution logs capped at 100 (FIFO) | types.ts:566-567; hook-executor.ts:1259-1265 |
| Template `$variableName`: missing/undefined → empty string (graceful); invalid name / `$`+space → syntax error | template-variable-parser.ts:212-282 |
| Variables gated per trigger via `availableFor` ( `[]` = all triggers) across 7 categories | template-variable-constants.ts:73-432 |
| MCP discovery cache TTL 5 min; execution concurrency capped at 5; timeout clamp 1 s–5 min | types.ts:577-581 |
| Completion detection: filesystem watchers per operation pattern (e.g. `**/specs/*/spec.md`), parse-validate, debounce 2 s | command-completion-detector.ts:27-72 |
| Trigger history FIFO capped at 50 | types.ts:574; trigger-registry.ts:106 |
| ACP action requires non-empty `agentCommand` + `taskInstruction`; custom action requires `agentId` or legacy `agentName` | hook-manager.ts:647-684 |

### Algorithms (🟢 confirmed)
- **Trigger matching** — filter enabled hooks by agent/operation/timing (legacy `trigger` or normalized `events`), sort by `createdAt`.
- **Schema migration** — in-place upgrade of stored hooks (timing default, legacy→normalized model, field rename) on load.
- **Template substitution** — regex `/\$([a-zA-Z_][a-zA-Z0-9_]*)\b/g`, replace with context value or empty; type-coerce non-strings.
- **Chain-cycle protection** — per-execution `Set<hookId>` + depth counter capped at 10.
- **Completion detection** — hybrid FileSystemWatcher + parseability check + 2 s debounce maps file events to operation triggers.
- **MCP execution pooling** — bounded concurrency (5) over discovered MCP tools with per-call timeout clamping.
- **ACP subprocess session** — spawn agent process, JSON-RPC handshake → session → prompt → collect output, with timeout/error states.

### Dependencies
Internal: `agents` (agent definitions / `.agent.md`), `services` (configuration, ACP client/registry), `prompts`, `utils` (`task-parser`), consumed by `commands`, `providers` (hooks tree), `panels`, and the `orchestration`/`tasks` loops (which fire `task-completed`/`task-failed` triggers). External: `vscode` (`workspaceState`, `EventEmitter`, `FileSystemWatcher`, `window`, Git extension API, `LanguageModel` API), `node:crypto` (`randomUUID`), `node:child_process` (ACP subprocess), GitHub MCP server.

> 🟡 **INFERRED:** In `executeHooksForTrigger` the non-blocking branch is commented *"execute in parallel"* but the loop `await`s each `executeHook` — execution is effectively **sequential** in both branches (`hook-executor.ts:884-895`). 🔴 **GAP:** `TemplateVariableParser.validateVariables` is a **stub** that always returns valid (TODO Phase 4, `template-variable-parser.ts:299-310`) — template/trigger availability warnings are not actually enforced at parse time.

---

## Module: `orchestration`

**Path:** `src/features/orchestration/` · **LOC:** ~628 (2 source files) · **Complexity:** 🟢 medium

### Purpose
Thin backend layer behind the **orchestration dashboard / Kanban board**. Two responsibilities: (1) a **read-model** that aggregates live sessions from both `agent-chat` (local/worktree ACP) and `cloud-agents` into one unified, bucketed `OrchestrationSnapshot`; and (2) an **autonomous agent loop** that bridges the Kanban task model (`tasks/NormalizedTask`) to spawned `agent-chat` sessions and fires `hooks` triggers on task completion/failure. The React Flow composer and Kanban UI themselves live in the webview (`webview-orchestration`, pending); the workflow-composer/Kanban contracts are consumed there.

### Primary files
| File | Role |
|------|------|
| `orchestration-read-model.ts` (462) | Aggregates agent-chat + cloud-agent sessions into `OrchestrationSessionProjection[]`; buckets (active/waiting/completed/failed), derives titles from transcripts, tracks blocked/worktree/external-url/provider info, surfaces `degradedReasons` for missing wiring, re-emits `onDidChange` from upstream stores. |
| `autonomous-agent-loop.ts` (166) | `claimTask` → `startTask` (spawns an agent-chat session) → completion sync; maps `sessionId ⇄ taskId`; fires `orchestration.task-completed`/`task-failed` hook triggers. |

### Key functions (🟢 confirmed)
| Function | Location | Signature |
|----------|----------|-----------|
| `OrchestrationReadModel.snapshot` | orchestration-read-model.ts:129 | `() => Promise<OrchestrationSnapshot>` |
| `OrchestrationReadModel.onDidChange` | orchestration-read-model.ts:120 | `(listener) => { dispose() }` |
| `OrchestrationReadModel.collectAgentChatSessions` / `collectCloudSessions` | :178 / :207 | per-source projection + degradation |
| `toAgentChatProjection` / `toCloudProjection` | :283 / :313 | session → unified projection |
| `bucketForAgentChat` / `bucketForCloud` / `compareSessions` | :397 / :416 / :441 | bucketing + sort (bucket rank, then recency) |
| `AutonomousAgentLoopService.claimTask` | autonomous-agent-loop.ts:35 | `(task: NormalizedTask) => boolean` |
| `AutonomousAgentLoopService.startTask` | autonomous-agent-loop.ts:67 | `(taskId) => string \| undefined` (returns sessionId) |
| `AutonomousAgentLoopService.completeTask` | autonomous-agent-loop.ts:103 | `(taskId, success, errorMessage?) => void` |
| `AutonomousAgentLoopService.handleRegistryChange` | autonomous-agent-loop.ts:140 | syncs terminal sessions → task state |

### State machines
**Orchestration session bucket** (read-model): every session is projected to one of `active | waiting | completed | failed` (agent-chat lifecycle and cloud `SessionStatus` each mapped). **Autonomous task execution** (loop): `ready → queued (claimTask) → running (startTask spawns session) → completed | failed (manual or session-terminal sync)`.

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| Snapshot merges agent-chat (active+recent, registry overrides store by id) and cloud sessions, sorted by bucket rank then `lastVisibleActivityAt` desc | orchestration-read-model.ts:136-142,441-461 |
| Bucket rank order: active(0) → waiting(1) → completed(2) → failed(3) | orchestration-read-model.ts:451-461 |
| agent-chat title derived from first user message, else `agentDisplayName (mode)`; `waiting-for-input` ⇒ blocked | orchestration-read-model.ts:350-362,304 |
| Graceful degradation: missing cloud storage/provider wiring pushes human-readable `degradedReasons` instead of throwing | orchestration-read-model.ts:189,211,233 |
| `claimTask` rejects tasks already running/completed; rejects a new task if another is running unless `execution.parallelizable` | autonomous-agent-loop.ts:37-51 |
| `startTask` only proceeds from `queued`; generates `sessionId` (UUID), registers an agent-chat session, maps session⇄task, sets `running` | autonomous-agent-loop.ts:67-98 |
| On task terminal state, fires `orchestration.task-completed`/`task-failed` trigger with the task JSON as `outputContent` | autonomous-agent-loop.ts:127-138 |

### Algorithms (🟢 confirmed)
- **Two-source session merge** — de-dup by id (registry wins over store), map to unified projection, stable bucket+recency sort.
- **Bucket derivation** — separate lifecycle→bucket maps for agent-chat vs cloud.
- **Title derivation** — first non-empty trimmed user message; fallback to agent/mode label.
- **Completion sync** — on registry change, recent sessions mapped to running tasks are marked completed/failed.

### Dependencies
Internal: `agent-chat` (`AgentChatRegistry`, `AgentChatSessionStore`, types), `cloud-agents` (`AgentSessionStorage`, `ProviderRegistry`, types), `tasks` (`NormalizedTask`), `hooks` (`TriggerRegistry`). Consumed by `providers/orchestration-view-provider.ts` and `extension.ts`. External: `vscode` (`EventEmitter`, `Event`), `node:crypto` (`randomUUID`).

> 🟡 **INFERRED (immature code):** `AutonomousAgentLoopService` is an early implementation (recent commits: *"first autonomous agent execution loop"*). The `AgentChatSession` it constructs (`autonomous-agent-loop.ts:76-86`) uses a simplified shape (`agentName`, `messages`, `systemPrompt`, `capabilities: {}`) that does **not** match the canonical `agent-chat` `AgentChatSession` (which requires `agentId`, `agentDisplayName`, `ResolvedCapabilities`, `executionTarget`, `workspaceUri`, etc.). 🔴 **GAP:** `handleRegistryChange` treats any mapped recent session as terminal and checks `lifecycleState !== "error"`, but `"error"` is **not** a canonical `SessionLifecycleState` (terminal states are `completed/failed/cancelled/ended-by-shutdown`) — completion detection here is heuristic/provisional (the code comment admits *"assuming … means done for now"*). Needs reconciliation with `agent-chat` types during the `tasks`/webview analysis.

---

## Module: `spec`

**Path:** `src/features/spec/` · **LOC:** ~3,635 (17 source files) · **Complexity:** 🟢 high

### Purpose
Spec lifecycle management for **two SDD systems** (SpecKit `.specify/` and OpenSpec `openspec/`, selected via adapter/strategy) plus the **review-flow state machine** (spec `001-auto-review-transition`). Owns: spec creation (webview-driven input → prompt submitted to Copilot Chat), document navigation/CRUD, unified cross-system listing, the spec status FSM (`current → review → reopened → archived`), change-request lifecycle with archival blockers, task dispatch from change requests, auto-review transitions, and rich telemetry. Review-flow state persists to `.vscode/gatomia/spec-review-state.json`.

### Primary files
| File | Role |
|------|------|
| `review-flow/state.ts` (948) | Review-flow FSM (module singleton): spec/change-request/task state, transition validation, gating (`canSendToReview`/`canArchive`), auto-review, JSON persistence, change events, telemetry calls. |
| `create-spec-input-controller.ts` (517) | Create-spec webview panel controller: open, draft autosave, import markdown, attach images, submit (implements the `CreateSpec*` message protocol in `types.ts`). |
| `spec-manager.ts` (466) | Top-level manager: active-system detection (SpecKit/OpenSpec adapter), `executeSpecKitCommand` (fires hook triggers), document open/navigate/delete, unified spec/change listing, OpenSpec apply. |
| `review-flow/telemetry.ts` (315) | ~15 telemetry loggers (status changes, transitions, dispatch, blockers). |
| `review-flow/commands/*.ts` | VS Code command handlers: send-to-review, send-to-archived (211), dispatch-to-tasks (129), reopen-spec, shared args. |
| `review-flow/storage.ts` (174) | (De)serialize `Specification`/`ChangeRequest`/`TaskLink` (Date ⇄ ISO string). |
| `review-flow/tasks-dispatch.ts` (135) | Build payload + dispatch a change request to the "tasks prompt" (**mock** implementation). |
| `review-flow/change-requests-service.ts` (128) | Create change requests with duplicate prevention + reopen transition. |
| `spec-kit-manager.ts` (124) | SpecKit `createFeature`. |
| `review-flow/types.ts` (107) / `types.ts` (106) | Review-flow domain model / create-spec webview message protocol. |
| `spec-submission-strategy.ts` (71) | Strategy: OpenSpec vs SpecKit submission (reads prompt template, sends to chat). |
| `review-flow/duplicate-guard.ts` (69) | Normalized-title uniqueness for non-addressed change requests. |

### Key functions (🟢 confirmed)
| Function | Location | Signature |
|----------|----------|-----------|
| `updateSpecStatus` | review-flow/state.ts:271 | `(specId, newStatus) => Specification \| null` (FSM-validated) |
| `validateStatusTransition` / `normalizeStatus` | review-flow/state.ts:128 / 146 | FSM rules; `readyToReview`→`review` legacy alias |
| `canSendToReview` / `sendToReview` | review-flow/state.ts:887 / 937 | gating (no pending tasks/checklist) + transition |
| `canArchive` / `archiveSpec` / `unarchiveSpec` | review-flow/state.ts:694 / 713 / 736 | archival gating (no blockers) |
| `addChangeRequest` / `updateChangeRequestStatus` | review-flow/state.ts:351 / 395 | CR lifecycle + auto reopen/return |
| `attachTasksToChangeRequest` / `updateTaskStatus` | review-flow/state.ts:768 / 824 | task linkage; all-tasks-done ⇒ CR addressed |
| `shouldReturnToReview` / `returnSpecToReview` | review-flow/state.ts:447 / 477 | auto return when all CRs addressed |
| `sendToReviewWithTrigger` / `initializeAutoReviewTransitions` | review-flow/state.ts:657 / 624 | manual+auto review transitions |
| `createChangeRequest` | review-flow/change-requests-service.ts:34 | dedupe → add → reopen |
| `validateUniqueChangeRequest` / `normalizeTitle` | review-flow/duplicate-guard.ts:53 / 13 | title uniqueness |
| `dispatchToTasksPrompt` | review-flow/tasks-dispatch.ts:76 | **mock** dispatch (latency + 10% fail) |
| `SpecManager.executeSpecKitCommand` | spec-manager.ts:107 | run SDD command + fire trigger |
| `SpecManager.getAllSpecsUnified` / `delete` / `openDocument` | spec-manager.ts:399 / 216 / 151 | cross-system ops |
| `SpecSubmissionStrategyFactory` | spec-submission-strategy.ts:62 | select OpenSpec/SpecKit strategy |
| `CreateSpecInputController.open` | create-spec-input-controller.ts:125 | open create-spec panel |

### State machines
**Spec status FSM** (see `flowcharts/spec.md`): `current → review`; `review → {reopened, archived, current}`; `reopened → review`; `archived → reopened`; `readyToReview` normalized to `review`. **Change-request status**: `open → {blocked, inProgress} → addressed` (re-opens to `inProgress` if a done task is reverted). **Task link**: `open → inProgress → done`. Auto-transitions: all CRs addressed + all tasks done + zero pending ⇒ return to review; new pending tasks/checklist while in review ⇒ exit to `current`/`reopened`.

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| FSM valid transitions enforced; invalid transitions rejected | review-flow/state.ts:135-143,287 |
| `readyToReview` is a legacy alias normalized to `review` | review-flow/state.ts:146-151 |
| Send-to-review gated: must be `current`/`reopened` with **zero** pending tasks + checklist items | review-flow/state.ts:887-929 |
| First entry to `review` stamps `completedAt` + `reviewEnteredAt`; entry to `archived` stamps `archivedAt` | review-flow/state.ts:299-306 |
| Adding a change request while in review transitions spec to `reopened` | review-flow/state.ts:371-378 |
| New change request is `open` + `archivalBlocker=true`; attaching tasks sets `inProgress` + blocker; all tasks done ⇒ `addressed`, blocker cleared | change-requests-service.ts:64-71; state.ts:799,853-867 |
| Archive gated on review status + zero pending + no blocking change requests | review-flow/state.ts:694-708 |
| Unarchive moves `archived → reopened`, clears `archivedAt` | review-flow/state.ts:736-758 |
| Pending tasks/checklist appearing during review force exit (`reopened` if blockers else `current`) with warning | review-flow/state.ts:522-544 |
| Auto-review: on state change, eligible specs auto-sent to review (retry queue on failure) | review-flow/state.ts:552-587,624-633 |
| Duplicate change requests rejected by normalized title (excluding `addressed`) | duplicate-guard.ts:24-50 |
| Review-flow state persisted to `.vscode/gatomia/spec-review-state.json` (load-on-first-access, write-after-mutation) | review-flow/state.ts:56-123 |
| Two spec systems (SpecKit `.specify/` / OpenSpec `openspec/`) abstracted via adapter + submission strategy | spec-manager.ts:130; spec-submission-strategy.ts:14,49,62 |
| OpenSpec submission requires `.github/prompts/openspec-proposal.prompt.md`; prompt instructs agent to STOP for user approval | spec-submission-strategy.ts:20-44 |

### Algorithms (🟢 confirmed)
- **FSM validation** — table of allowed transitions + status normalization (legacy alias).
- **Review gating** — accumulate blocker strings (status, pending tasks, pending checklist).
- **Auto-return to review** — all CRs addressed ∧ all tasks done ∧ zero pending.
- **Auto-review evaluation** — iterate cache + retry queue on each change event.
- **Duplicate detection** — lowercase/trim/collapse-spaces title comparison among non-addressed CRs.
- **Date (de)serialization** — ISO strings ↔ `Date`; optional-count coercion (clamp ≥0, truncate).

### Dependencies
Internal: `utils` (`notification-utils`, `chat-prompt-runner`), `hooks` (`TriggerRegistry`), `services` (spec-kit adapter), `constants`. Consumed by `providers/spec-explorer-provider.ts`, `panels`, `commands`, and the `tasks` module (task dispatch). External: `vscode` (`workspace`, `EventEmitter`, `Uri`, webview), `node:fs` (state file), `node:path`, `node:crypto` (`randomUUID`).

> 🔴 **GAP / mock:** `dispatchToTasksPrompt` (`tasks-dispatch.ts:76-134`) is a **mock** — it simulates 500–1500 ms latency, fails 10% of the time at random, and returns two hard-coded tasks (`Fix: …`, `Verify changes`). The comment states *"In production, this would be a real API call."* The change-request → tasks pipeline is therefore not yet wired to a real generator. 🟡 **INFERRED:** review-flow state is a **module-level singleton** (module-scoped `Map` + `EventEmitter`, not a class), which couples persistence and in-memory cache globally per extension host.

---

## Module: `steering`

**Path:** `src/features/steering/` · **LOC:** ~905 (5 source files) · **Complexity:** 🟢 medium

### Purpose
Manages the AI "steering" documents that shape agent behavior: the project **constitution** (SpecKit) / **AGENTS.md** (OpenSpec), the global Copilot config (`~/.github/copilot-instructions.md`), and project/user **instruction rules** (`*.instructions.md`). Also owns a privacy-sensitive **consent gate** controlling whether the extension may read global (home-directory) Copilot resources for a given workspace. Document creation typically delegates to Copilot Chat (e.g. `/speckit.constitution`).

### Primary files
| File | Role |
|------|------|
| `steering-manager.ts` (367) | Creates global config, project docs (SpecKit constitution via chat / OpenSpec `AGENTS.md`), and project/user instruction rules; detects active SDD system and prompts user when none. |
| `global-resource-access-consent.ts` (293) | 3-state (ask/allow/deny) consent system for reading home-dir Copilot resources; effective-access resolution + modal prompt + multi-tier persistence fallback. |
| `instruction-rules.ts` (110) | Pure helpers: kebab-case name normalization/validation, `*.instructions.md` template, project/user dir URIs, existence assertion. |
| `constitution-manager.ts` (78) | Constitution path resolution, ensure-exists, open (offer create), default-template creation, validate (stub). |
| `types.ts` (57) | Create-steering webview message protocol (summary/audience/keyPractices/antiPatterns). |

### Key functions (🟢 confirmed)
| Function | Location | Signature |
|----------|----------|-----------|
| `SteeringManager.createUserConfiguration` | steering-manager.ts:50 | `() => Promise<void>` (global `~/.github/copilot-instructions.md`) |
| `SteeringManager.createProjectDocumentation` | steering-manager.ts:98 | `() => Promise<void>` (constitution or AGENTS.md by system) |
| `SteeringManager.createProjectInstructionRule` / `createUserInstructionRule` | steering-manager.ts:235 / 297 | `() => Promise<boolean>` |
| `SteeringManager.createConstitutionRequest` | steering-manager.ts:353 | `() => Promise<void>` (→ `/speckit.constitution` chat) |
| `ConstitutionManager.ensureConstitutionExists` / `openConstitution` / `createDefaultConstitution` | constitution-manager.ts:17 / 22 / 44 | constitution file ops |
| `ConstitutionManager.validateConstitution` | constitution-manager.ts:74 | `() => boolean` (**stub** → always true) |
| `normalizeInstructionRuleName` / `buildInstructionRuleTemplate` | instruction-rules.ts:38 / 74 | name validation + template |
| `getEffectiveGlobalResourceAccess` / `isGlobalResourceAccessAllowed` | global-resource-access-consent.ts:145 / 156 | resolve effective access |
| `ensureGlobalResourceAccessConsent` | global-resource-access-consent.ts:235 | `(context, out?) => Promise<boolean>` (modal gate) |
| `setWorkspaceGlobalResourceAccess` | global-resource-access-consent.ts:162 | persist override (fallback chain) |

### State machines
**Global-resource-access consent**: effective access = `ask | allow | deny`, resolved as `workspaceOverride (allow/deny)` else `globalDefault`. On `ask`, a modal prompt offers Allow/Deny/Open-Settings; `allow`/`deny` persist a workspace override, dismissal sets a session flag (no re-prompt that session). **Document creation**: detect SDD system → (SpecKit → constitution via chat) | (OpenSpec → write `AGENTS.md`); prompts to choose system if none detected.

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| Global config written to `~/.github/copilot-instructions.md` (overwrite-confirmed) | steering-manager.ts:50-92 |
| Project docs: SpecKit → `/speckit.constitution <directives>` chat prompt; OpenSpec → `openspec/AGENTS.md` file | steering-manager.ts:153-233 |
| No SDD system detected ⇒ user must pick SpecKit/OpenSpec; choice persisted to settings + adapter re-init | steering-manager.ts:115-151 |
| Instruction-rule name must normalize to lowercase kebab-case (else rejected); file is `<name>.instructions.md` with `applyTo: '**'` frontmatter | instruction-rules.ts:38-76 |
| Project rules → `.github/instructions/`; user rules → `~/.github/instructions/`; refuses to overwrite existing files | steering-manager.ts:259-273,316-323; instruction-rules.ts:98-109 |
| Effective global-resource access: workspace override (allow/deny) wins over global default (`ask`/`allow`/`deny`, default `ask`) | global-resource-access-consent.ts:145-160 |
| Consent persistence fallback chain: workspace config → global config → `.vscode/settings.json` → `workspaceState` | global-resource-access-consent.ts:162-226 |
| Dismissing the consent prompt suppresses re-prompts for the rest of the session | global-resource-access-consent.ts:23,248,284 |

### Algorithms (🟢 confirmed)
- **Kebab-case normalization** — trim/lowercase, collapse non-alphanumerics to `-`, trim dashes, validate against kebab pattern.
- **Effective-access resolution** — workspace override precedence over global default.
- **Multi-tier persistence fallback** — try increasingly broad config targets, finally a JSON settings-file write, finally workspace state.

### Dependencies
Internal: `providers` (`CopilotProvider`), `services` (`PromptLoader`), `utils` (`chat-prompt-runner`, `config-manager`, `spec-kit-adapter`, `spec-kit-utilities`), `constants`. Consumed by `commands`, `providers`, `panels` (create-steering webview). External: `vscode` (`workspace.fs`, `window`, configuration API, `commands`), `node:os` (`homedir`), `node:path`, `node:fs`.

> 🟡 **INFERRED:** `ConstitutionManager.validateConstitution` (`constitution-manager.ts:74-77`) is a **placeholder stub** that always returns `true` ("Placeholder for validation logic") — no constitution validation is performed. The `global-resource-access-consent` gate is a notable security/privacy control worth highlighting in the architecture/permissions analysis.

---

## Module: `tasks`

**Path:** `src/features/tasks/` · **LOC:** ~348 (5 source files) · **Complexity:** 🟢 low

### Purpose
A **pluggable task-source layer** (commit *"pluggable task source layer"*) that reads `tasks.md` from either SDD system and normalizes entries into a common `NormalizedTask` shape consumed by the Kanban board (webview) and the `orchestration` autonomous loop. Providers are registered by name; the right one is selected per file path. The actual markdown parsing is delegated to `utils/task-parser`.

### Primary files
| File | Role |
|------|------|
| `task-model.ts` (73) | Contracts: `NormalizedTask`, `TaskExecutionMetadata`, `ExecutionState`, `NormalizedTaskStatus`, `TaskProvider` interface. |
| `speckit-task-provider.ts` (101) | SpecKit `TaskProvider`: `canHandle` (`.specify`/`specs/`, not `openspec/`); parse + normalize + status/execution mapping. |
| `openspec-task-provider.ts` (98) | OpenSpec `TaskProvider`: `canHandle` (`openspec/`); near-identical normalize/map logic. |
| `task-service.ts` (72) | `TaskService`: registers built-in providers, resolves `tasks.md` via spec adapter, dispatches to the matching provider, graceful "unsupported" fallback; singleton `getTaskService()`. |
| `index.ts` (4) | Barrel re-exports. |

### Key functions (🟢 confirmed)
| Function | Location | Signature |
|----------|----------|-----------|
| `TaskService.getTasksForSpec` | task-service.ts:23 | `(specId) => Promise<NormalizedTask[]>` (resolves tasks.md via adapter) |
| `TaskService.getTasksFromFile` | task-service.ts:38 | `(specId, filePath) => Promise<NormalizedTask[]>` (provider match + fallback) |
| `TaskService.registerProvider` | task-service.ts:15 | `(provider: TaskProvider) => void` |
| `getTaskService` | task-service.ts:67 | `() => TaskService` (singleton) |
| `SpecKitTaskProvider.canHandle` / `getTasks` / `normalizeGroups` | speckit-task-provider.ts:12 / 19 / 45 | path match + parse + normalize |
| `OpenSpecTaskProvider.canHandle` / `getTasks` / `normalizeGroups` | openspec-task-provider.ts:12 / 16 / 42 | path match + parse + normalize |

### State machines
**Task execution state** (`ExecutionState`, consumed by orchestration): `queued → ready → running → blocked → completed | failed | skipped`. Providers seed it from parse status: `completed → completed`, `in-progress → running`, else → `ready`. **Normalized status**: `not-started | in-progress | completed | failed | blocked | skipped`.

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| Provider selection by `canHandle` path test: `openspec/` ⇒ OpenSpec; `.specify`/`specs/` (not openspec) ⇒ SpecKit | speckit-task-provider.ts:12-17; openspec-task-provider.ts:12-14 |
| Task IDs scoped to spec for uniqueness: `${specId}-${task.id}` | speckit-task-provider.ts:55; openspec-task-provider.ts:52 |
| Parse status mapping: `completed`→completed, `in-progress`→in-progress, else→not-started; execution state similarly mapped | speckit-task-provider.ts:78-99 |
| No matching provider ⇒ a single `isUnsupported` placeholder task is returned (graceful degradation) | task-service.ts:44-58 |
| Parse failure ⇒ a single "Failed to parse tasks.md" `isUnsupported` task is returned | speckit-task-provider.ts:27-42 |
| `getTasksForSpec` resolves the `tasks` file path via `SpecSystemAdapter.getSpecFiles`; missing ⇒ empty list | task-service.ts:23-33 |

### Algorithms (🟢 confirmed)
- **Provider dispatch** — first provider whose `canHandle(filePath)` matches handles the file.
- **Group normalization** — flatten parsed `TaskGroup[]` → `NormalizedTask[]`, scoping ids and mapping status/execution state.
- **Graceful degradation** — unsupported/unparseable files yield a single placeholder task instead of throwing.

### Dependencies
Internal: `utils` (`task-parser` — the actual markdown parser; `spec-kit-adapter`), `constants` (`SPEC_SYSTEM_MODE`). Consumed by `orchestration` (`NormalizedTask`/autonomous loop), `providers`/`panels` (Kanban board), webview (`webview-orchestration`). External: none beyond the above (pure TS + Node path semantics via utils).

---

## Module: `providers`

**Path:** `src/providers/` · **LOC:** ~8,774 (18 source files + 4 test files) · **Complexity:** 🟢 high

### Purpose
The **VS Code UI registration layer**: the bridge between extension services and the workbench surfaces. It contains ~10 `TreeDataProvider`s (sidebar tree views), 4 `WebviewViewProvider`s, 2 standalone webview *panels* (welcome, hooks), a `CodeLensProvider`, and a `CopilotProvider` wrapper. Providers hold almost no domain logic of their own — they subscribe to feature-layer events (review-flow state, hook manager/executor, agent-chat registry/store, polling services), project that state into `TreeItem`s or `postMessage` payloads, and translate user/webview actions back into commands and service calls. The most complex member, `agent-chat-view-provider.ts`, is a full bidirectional message bridge with an inner per-session binding.

### Primary files
| File | Role |
|------|------|
| `agent-chat-view-provider.ts` (1405) | Canonical Agent Chat sidebar `WebviewViewProvider` + `AgentChatViewController`. Three states (empty/active/restored); inner `SidebarSessionBinding` mirrors transcript/lifecycle/model/pending-write deltas to the webview; model-discovery probes; catalog/session-list/permission-default broadcasting. |
| `welcome-screen-provider.ts` (1399) | Orchestrates the Welcome webview panel: dependency detection (Copilot Chat/CLI, SpecKit, OpenSpec, Devin/Gemini CLI), editable config, system diagnostics, learning resources, install-command dispatch (clipboard + terminal), per-IDE-host prerequisite gating. |
| `spec-explorer-provider.ts` (1235) | `TreeDataProvider<SpecItem>` for the Specs view: 4 root groups (Current/Review/Archived/Changes), spec→requirements/design/tasks/checklist children, review-flow status filtering, task-progress icons; watches `**/specs/**/*.md` (2 s debounce). |
| `hook-view-provider.ts` (1012) | Manages the Hooks webview *panel* (`gatomia.hooksPanel`): hook CRUD/toggle/list/logs, MCP discovery, agent listing; queues messages until `hooks.ready`; mirrors `HookExecutor` started/completed/failed events as status badges. |
| `actions-explorer-provider.ts` (693) | `TreeDataProvider<ActionItem>`: SpecKit (prompts/agents/instructions/scripts/templates) and OpenSpec (prompts/agents/skills/scripts/templates) resource catalogs grouped by source. |
| `wiki-explorer-provider.ts` (455) | `TreeDataProvider<WikiItem>` for generated wiki docs with per-entry generation status (pending/updating/completed/failed). |
| `steering-explorer-provider.ts` (422) | `TreeDataProvider<SteeringItem>` for constitution/agents (steering) files. |
| `running-agents-tree-provider.ts` (331) | `TreeDataProvider<RunningAgentsTreeItem>`: agent-chat sessions grouped active/recent/orphans, per-lifecycle-state icons. |
| `hooks-explorer-provider.ts` (304) / `cloud-agent-progress-provider.ts` (286) / `devin-progress-provider.ts` (247) | Tree views for hooks (by action type), unified cloud-agent sessions, and standalone Devin sessions/tasks. |
| `copilot-provider.ts` (271) | Wrapper that sends prompts to Copilot Chat / CLI via temp files (WSL path conversion); `CopilotAvailabilityResult` probing. |
| `orchestration-view-provider.ts` (260) | `WebviewViewProvider` (`gatomia.views.orchestration`) for the workflow composer / Kanban board surface. |
| `quick-access-explorer-provider.ts` (214) / `spec-task-code-lens-provider.ts` (104) | Quick-access command tree; CodeLens over `- [ ] TXXX` task lines in spec files. |
| `overview-provider.ts` (45) / `simple-view-provider.ts` (38) / `interactive-view-provider.ts` (53) | Minimal/scaffold views. |

### Registered surfaces (🟢 confirmed view ids)
| Surface | Id / type | File:line |
|---------|-----------|-----------|
| Agent Chat (auxiliary) | `gatomia.views.agentChat` (WebviewView) | agent-chat-view-provider.ts:155 |
| Agent Chat (primary host) | `gatomia.views.agentChatPrimary` | agent-chat-view-provider.ts:150 |
| Specs tree | `gatomia.views.specExplorer` | spec-explorer-provider.ts:42 |
| Orchestration | `gatomia.views.orchestration` (WebviewView) | orchestration-view-provider.ts:30 |
| Hooks panel | `gatomia.hooksPanel` (WebviewPanel) | hook-view-provider.ts:303 |

### Key functions (🟢 confirmed)
| Function | Location | Signature |
|----------|----------|-----------|
| `AgentChatViewProvider.resolveWebviewView` | agent-chat-view-provider.ts:230 | `(view, ctx, token) => void` |
| `AgentChatViewProvider.handleWebviewMessage` | agent-chat-view-provider.ts:425 | inbound message router |
| `AgentChatViewProvider.reveal` / `focusSession` | agent-chat-view-provider.ts:297 / 333 | dual-id focus + bind |
| `AgentChatViewProvider.bindSession` | agent-chat-view-provider.ts:556 | `(sessionId) => Promise<void>` |
| `AgentChatViewProvider.refreshProbes` | agent-chat-view-provider.ts:728 | parallel ACP install probe |
| `SidebarSessionBinding.sendSessionLoaded` | agent-chat-view-provider.ts:980 | full session+transcript snapshot |
| `SidebarSessionBinding.handleInputSubmit` | agent-chat-view-provider.ts:1111 | follow-up submit + delivery patch |
| `SidebarSessionBinding.flushTranscriptDeltas` | agent-chat-view-provider.ts:1264 | append-only delta diff by message id |
| `SpecExplorerProvider.getChildren` | spec-explorer-provider.ts:268 | tree expansion (root groups → specs → files) |
| `WelcomeScreenProvider.installDependency` | welcome-screen-provider.ts:294 | per-dependency install dispatch |
| `HookViewProvider.handleWebviewMessage` | hook-view-provider.ts:401 | hooks CRUD/logs/discovery router |
| `HookViewProvider.initialize` | hook-view-provider.ts:347 | wires manager/executor event mirrors |
| `CopilotProvider.createTempFile` | copilot-provider.ts:47 | temp-file prompt handoff (+WSL) |

### State machines / view models
- **Agent Chat sidebar view** (see `flowcharts/providers.md`): `empty (new-session launcher) → binding → active ⇄ (switch-session) → cleared`. Exactly one `SidebarSessionBinding` alive at a time; cloud sessions render read-only.
- **Webview readiness gate** (hooks panel): messages buffered in `pendingMessages` until `hooks.ready`, then flushed (`hook-view-provider.ts:322,429`).
- **Spec tree model**: root → `{Current Specs | Review | Archived | Changes}`; spec status comes from review-flow `getSpecState` (`current/reopened` ⇒ Current, `review` ⇒ Review, `archived` ⇒ Archived).
- **Running-agents tree**: groups `active / recent / orphans`; lifecycle-state → icon map (`running-agents-tree-provider.ts:314-326`).

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| Chat view declared twice (auxiliary + primary containers), gated by `gatomia.host.chatInPrimary`; `reveal()` fires both `.focus` commands, inactive one no-ops | agent-chat-view-provider.ts:133-150,297-331 |
| Only one session bound at a time; rebinding disposes the prior `SidebarSessionBinding` | agent-chat-view-provider.ts:556-562 |
| Cloud sessions are read-only: follow-up submit is rejected with a fixed reason | agent-chat-view-provider.ts:1133 |
| Terminal-state sessions reject follow-up input | agent-chat-view-provider.ts:1142 |
| Transcript pushed as append-only deltas (diff by message id), not full re-renders | agent-chat-view-provider.ts:1264-1276 |
| `permissionDefault` writes to **Global** config; config-change listener rebroadcasts to webview (single source of truth) | agent-chat-view-provider.ts:534-550,205-209 |
| Model probes coalesce via a single in-flight promise; per-provider `modelsLoading` markers drive the picker placeholder | agent-chat-view-provider.ts:713-726,492-523 |
| Spec tree refresh debounced 2 s on `**/specs/**/*.md` changes and on review-flow state changes | spec-explorer-provider.ts:38,63-76 |
| Spec grouping derived from review-flow status (no status ⇒ Current) | spec-explorer-provider.ts:304-329 |
| GatomIA-CLI install gated on host prerequisites (windsurf⇒Devin CLI; antigravity⇒Gemini CLI; else Copilot Chat+CLI) **plus** ≥1 spec system | welcome-screen-provider.ts:83-116,355-366 |
| Install actions copy the command to clipboard + offer "Open Terminal"; post-install re-probe after 5 s | welcome-screen-provider.ts:309-399,81 |
| 6 editable config keys exposed by the welcome screen | welcome-screen-provider.ts:71-78 |
| Hooks-panel messages buffered until `hooks.ready`, then flushed | hook-view-provider.ts:322-323,429-433 |
| Hook execution status (executing/completed/failed) mirrored from `HookExecutor` events into a per-hook cache | hook-view-provider.ts:347-371,318 |

### Algorithms (🟢 confirmed)
- **Append-only transcript delta** — read persisted transcript, diff against `knownMessageIds`, post only fresh messages (`flushTranscriptDeltas`).
- **Session-title derivation** — first non-empty user message, whitespace-collapsed, truncated to 60 chars with an ellipsis.
- **Dual-view focus** — issue both `<viewId>.focus` commands in parallel; the host-gated one rejects/no-ops.
- **Probe coalescing** — concurrent catalog rebroadcasts share one `refreshProbes()` promise; `Promise.allSettled` over ACP descriptor probes, rebroadcast only when an `installed` flag flips.
- **Discovered-model overlay** — `vscode-lm`/`agent` source replaces static models; `none` empties the picker; `catalog` keeps the static list.
- **Tree projection** — feature-layer state (specs, sessions, hooks, resources) mapped to `TreeItem`s with theme icons/colors and `contextValue`-driven `when` menus.

### Dependencies
Internal (consumes): `agent-chat` (registry/store/model-discovery/catalog/types/telemetry), `spec` (review-flow state, `SpecManager`), `hooks` (`HookManager`/`HookExecutor`/MCP+agent discovery), `cloud-agents` + `devin` (session/task projection), `steering`, `orchestration`/`tasks` (Kanban + composer), `services` (`DependencyChecker`, `SystemDiagnostics`, `LearningResources`, `ConfigManager`), `panels` (`WelcomeScreenPanel`), `utils` (`get-webview-content`, `ide-host-detector`, `task-parser`, `spec-kit-adapter`, `config-manager`), `constants`, `types/welcome`. External: `vscode` (Tree/Webview APIs, `commands`, `workspace`, `window`, `env`, `Uri`, `ThemeIcon`/`ThemeColor`, `FileSystemWatcher`, `EventEmitter`), `node:crypto` (`randomUUID`), `node:fs`/`node:path`.

> 🟡 **INFERRED:** `simple-view-provider.ts`, `interactive-view-provider.ts`, and `overview-provider.ts` look like scaffolding/demo views; whether any are still registered in `extension.ts` is best confirmed during the `commands`/`extension` analysis. 🔴 **GAP:** the exact `package.json` `views`/`viewsContainers` ↔ provider wiring (and which views are contributed vs. dormant) is not determinable from this folder alone.

---

## Module: `services`

**Path:** `src/services/` (incl. `acp/`, `welcome/`) · **LOC:** ~5,974 (22 source files) · **Complexity:** 🟢 high

### Purpose
The **core business-logic layer** sitting beneath `providers`/`panels`/`commands`. Three subsystems dominate: (1) the **ACP runtime** (`acp/`) — the Agent Client Protocol client that spawns local agent CLIs (Devin/Gemini) over stdio JSON-RPC and powers `agent-chat`; (2) the **chat-dispatch pipeline** (`chat-router` → `chat-dispatcher` → ACP or Copilot Chat fallback) plus `agent-service` (chat-participant registration); (3) the **document preview/refinement** subsystem and the **welcome-screen support services** (dependency detection, diagnostics, learning resources, install commands). `prompt-loader` and `configuration-service` are cross-cutting utilities.

### Primary files
| File | Role |
|------|------|
| `acp/acp-client.ts` (1582) | The ACP runtime core. Spawns the provider CLI subprocess, drives `@agentclientprotocol/sdk` `ClientSideConnection` over an `ndJsonStream`, implements the `Client` handler (`sessionUpdate`/`requestPermission`/`readTextFile`/`writeTextFile`), per-session event bus, model probe/set, remembered permission decisions, buffered-write approval. |
| `acp/acp-session-manager.ts` (398) | Coordinates `AcpClient`s keyed by `(providerId, cwd)`; session-key derivation by `SessionMode`; npx-spawn consent gate; permission-default propagation. |
| `document-preview-service.ts` (500) | Loads markdown/code files into a `DocumentArtifact` (section parsing by `##`, code-language inference); change events; dependency tracking. |
| `agent-service.ts` (377) | Discovers `.agent.md` resources, registers chat participants, wires tool-registry + resource-cache, file-watcher hot-reload, config-change handling, telemetry. |
| `dependency-checker.ts` (336) | Detects install status/versions of dependencies (Copilot Chat/CLI, SpecKit, OpenSpec, Devin/Gemini CLI) with TTL caching (spec 006). |
| `acp/acp-provider-registry.ts` (263) | Registry of ACP descriptors: built-ins + remote ACP Registry CDN augmentation (24 h cache, 3 s fetch timeout); `forHost` lookup. |
| `welcome/install-commands.ts` (276) / `welcome/requirements.ts` (160) | Per-platform install-step resolution; `RequirementProfile` (host prerequisite profiles). |
| `document-dependency-tracker.ts` (274) | Tracks document versions + dependencies; detects outdated downstream docs (`OutdatedDocumentInfo`); context-backed singleton. |
| `learning-resources.ts` (227) / `system-diagnostics.ts` (156) | Welcome learning resources (FR-015); error/warning diagnostics with 24 h window + 5-entry cap (FR-013). |
| `acp/provider-bridge.ts` (223) | Side-effect-free builders: descriptors from known-agent catalog or remote registry entries; host-platform + binary selection. |
| `chat-router.ts` (177) / `chat-dispatcher.ts` (158) | Declarative ACP-vs-Copilot routing (60 s cache); dispatch with slash-command rewrite + graceful fallback. |
| `refinement-gateway.ts` (150) | Maps doc type → SpecKit command, formats a refine/update prompt, sends to chat. |
| `prompt-loader.ts` (223) | Singleton; loads built-in compiled prompts + directory `.md` (gray-matter), compiles Handlebars, renders with variable validation. |
| `acp/types.ts` (112) / `acp/providers/*` (35/71/96) | ACP type contracts; built-in Devin/Gemini CLI probes. |
| `onboarding-service.ts` (99) / `configuration-service.ts` (81) | First-run ACP install/auth prompts; frozen `AgentConfiguration` from `gatomia.agents.*`. |

### Key functions (🟢 confirmed)
| Function | Location | Signature |
|----------|----------|-----------|
| `AcpClient.ensureStarted` / `start` | acp-client.ts:433 / 555 | spawn + `initialize(PROTOCOL_VERSION)` (shared start promise) |
| `AcpClient.sendPrompt` | acp-client.ts:453 | `(sessionKey, prompt) => Promise<void>` (create-on-demand, `connection.prompt`) |
| `AcpClient.createSession` | acp-client.ts:706 | `newSession({cwd, mcpServers:[]})` → capture model state |
| `AcpClient.buildClientHandler` | acp-client.ts:888 | returns SDK `Client` (sessionUpdate/requestPermission/readTextFile/writeTextFile) |
| `AcpClient.setSessionModel` | acp-client.ts:806 | experimental `unstable_setSessionModel`; throws `ACP_NOT_SUPPORTED` |
| `dispatchSessionUpdate` / `resolvePermission` | acp-client.ts:1051 / 1510 | session-update router; permission resolver |
| `AcpSessionManager.send` / `sendPromptDirect` | acp-session-manager.ts:156 / 173 | consent → ensureClient → sendPrompt |
| `ChatRouter.resolve` / `decide` | chat-router.ts:51 / 71 | cached ACP-vs-Copilot decision |
| `ChatDispatcher.dispatch` | chat-dispatcher.ts:83 | route → ACP send (rewrite) or Copilot fallback |
| `rewritePromptForAcp` | chat-dispatcher.ts:38 | strips `/cmd` → natural-language for ACP agents |
| `AgentService.initialize` | agent-service.ts:47 | load+register agents, resources, hot-reload |
| `PromptLoader.renderPrompt` | prompt-loader.ts:157 | Handlebars render with variable validation |
| `DocumentPreviewService.loadDocument` | document-preview-service.ts:80 | md/code → `DocumentArtifact` |
| `RefinementGateway.submitRequest` | refinement-gateway.ts:105 | format + `sendPromptToChat` |
| `AcpProviderRegistry.loadRemoteRegistry` | acp-provider-registry.ts:~140 | CDN fetch + cache (24 h TTL) |

### State machines
- **ACP client lifecycle** (see `flowcharts/services.md`): `idle → starting → connected → (disposed | process-exited)`; `ensureStarted` coalesces concurrent starts; process exit/error rejects all pending waiters and clears sessions.
- **Permission resolution**: `allow`/`deny` short-circuit; `ask` checks remembered `allow_always`/`reject_always` (by `ToolKind`) → else prompts user → may persist an "always" decision.
- **Chat routing decision**: `config-override → remote-workspace(off) → auto(host probe: installed→acpSupported→authenticated)` → `{acp | copilot-chat}`, cached 60 s.

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| One `AcpClient` subprocess per `(providerId, cwd)` (worktree isolation); session keys: `_ws_` / `spec:<id>` / `once:<uuid>` | acp-session-manager.ts:84,387-398 |
| `once:` (per-prompt) sessions are deleted after the turn / on cancel | acp-client.ts:483,512 |
| ACP `initialize` advertises fs capabilities `{readTextFile, writeTextFile}`; startup guarded by a timeout | acp-client.ts:628,655 |
| `writeTextFile` buffered for user approval when `bufferFileWrites` (else direct write); rejection surfaced to agent | acp-client.ts:942-960 |
| `requestPermission` honors mode + remembers `allow_always`/`reject_always` per `ToolKind` for the client lifetime | acp-client.ts:316,1510,1446 |
| `setSessionModel` uses experimental `unstable_setSessionModel`; missing ⇒ throw `ACP_NOT_SUPPORTED` (caller downgrades) | acp-client.ts:818-845 |
| `npx` spawns gated behind a one-time consent hook per `(providerId, cwd)` | acp-session-manager.ts:201-225 |
| Routing: `gatomia.chat.provider` override; ACP disabled in remote workspaces; auto picks provider by host + probe | chat-router.ts:71-108,159 |
| ACP dispatch rewrites leading `/command` prompts into natural language (agents would treat `/` as their own command) | chat-dispatcher.ts:38-61,93 |
| Copilot Chat `files` param only sent on VS Code ≥ 1.95.0 | chat-dispatcher.ts:23,126-138 |
| Remote ACP registry cached 24 h, 3 s fetch timeout; remote entries are metadata-only until a spawn command is provided | acp-provider-registry.ts:5-9,85-95 |
| Agent resources hot-reloaded via debounced watcher only when `gatomia.agents.enableHotReload` | agent-service.ts:156-179; configuration-service.ts:33 |
| Refinement maps doc type → SpecKit command (`spec→/speckit.specify`, `plan→/speckit.plan`, `task→/speckit.tasks`, …; default `/speckit.clarify`) | refinement-gateway.ts:27-39 |
| Prompt rendering validates required frontmatter variables before Handlebars compile/render | prompt-loader.ts:166-202 |
| System diagnostics: 24 h rolling window, 5-entry cap | system-diagnostics.ts (FR-013) |

### Algorithms (🟢 confirmed)
- **stdio JSON-RPC bridge** — `spawn` CLI → `Writable/Readable.toWeb` → `ndJsonStream` → `ClientSideConnection`; `PATH` extended via `getExtendedPath()`.
- **Session-update dispatch** — route by `sessionUpdate` kind: `agent_message_chunk`/`agent_thought_chunk`/`user_message_chunk`, `plan`, `available_commands_update`, `current_mode_update`/`session_info_update`/`usage_update`, `tool_call`/`tool_call_update` (extract affected files + diff stats, guess language by extension).
- **Remembered-permission memo** — key by `ToolKind`; re-resolve live `optionId` from the incoming options array (ids rotate per request).
- **Startup-timeout race** — `withStartupTimeout` registers a reject-waiter so a stuck `initialize` (or a process exit) fails fast.
- **Slash-command rewrite** — regex first-line match → `Run the "<cmd>" workflow [with input: …]`, preserving subsequent lines.
- **Markdown sectioning** — split by `##` (fallback any `#`), each heading becomes a `PreviewSection`; non-md files mapped to a syntax language.

### Dependencies
Internal: `features/agent-chat` (`pending-writes-store`, `diff-stats`), `features/agents` (loader/registry/cache/tools), `prompts/target` (compiled prompts), `utils` (`cli-detector`, `ide-host-detector`, `chat-prompt-runner`, `document-title-utils`), `types/*`. Consumed by `providers`, `panels`, `commands`, `extension.ts`, and `agent-chat` (the chat runner drives `AcpSessionManager`). External: `@agentclientprotocol/sdk`, `handlebars`, `gray-matter`, `vscode`, `node:child_process`/`node:fs`/`node:stream`/`node:crypto`, the public ACP Registry CDN.

> 🟡 **INFERRED:** `SpecKitTaskProvider` and `OpenSpecTaskProvider` are **near-duplicates** — identical `normalizeGroups`/`mapStatus`/`mapExecutionState`, differing only in `name` and `canHandle`. A shared base/helper would remove the duplication (Rule of Three). The real parsing complexity lives in `utils/task-parser` (analyzed with the `utils` module).

---

## Module: `panels`

**Path:** `src/panels/` · **LOC:** ~2,018 (8 source files) · **Complexity:** 🟢 medium

### Purpose
Standalone **`vscode.WebviewPanel` wrappers** (editor-area panels) — the counterpart to the sidebar `WebviewViewProvider`s in `providers`. Each class owns one panel's lifecycle: create/reveal a panel, load the shared React bundle by **page id** via `getWebviewContent`, broker that surface's `postMessage` protocol, and dispose idempotently. Members: the full per-session **Agent Chat** panel, the **Welcome** screen (singleton), the read-only **Document Preview**, a lightweight **New Session** picker (stub HTML, *not* the full React app), and two **progress** panels (provider-agnostic Cloud Agent + legacy Devin) with their message handlers. The layer holds no domain logic — it projects feature-layer state to the webview and routes user actions back to runners/services/commands. Two files (`agent-chat-panel.ts`, `new-session-panel.ts`) use **dependency injection / a host abstraction** so they can be unit-tested without a real VS Code environment.

### Primary files
| File | Role |
|------|------|
| `agent-chat-panel.ts` (617) | Per-session Agent Chat editor panel. `AgentChatPanelHost` factory abstraction (prod wraps `window.createWebviewPanel`; tests inject a fake). Handles `agent-chat/*` protocol (ready→session/loaded, input/submit with delivery lifecycle, cancel/retry), forwards store manifest + transcript deltas, fires a one-shot `onDidDispose`. |
| `welcome-screen-panel.ts` (325) | **Singleton** Welcome panel (`static currentPanel`, `show()` reveal-or-create — FR-017). Callback-based (`WelcomeScreenPanelCallbacks`, 11 hooks); buffers messages until `welcome/ready`. |
| `document-preview-panel.ts` (319) | Read-only document preview panel; options-based callbacks (reload, edit-attempt, open-in-editor, form submit, refine submit, execute-task-group, open-file); buffers messages until `preview/ready`; logs every message to an `OutputChannel`. |
| `new-session-panel.ts` (296) | Lightweight agent/task picker (`gatomia.agentChat.newSession`). Ships a minimal HTML stub (React view wired separately); DI via `NewSessionPanelDeps`; **self-disposes after any start attempt**. |
| `cloud-agent-progress-panel.ts` (184) | Provider-agnostic session-progress panel; projects `AgentSession[]` (status/branch/tasks/PRs) from `AgentSessionStorage` + active `ProviderRegistry`; replaces the Devin-specific one. |
| `devin-progress-panel.ts` (127) | Legacy Devin-only progress panel; delegates inbound messages to `handleDevinWebviewMessage`. |
| `cloud-agent-message-handler.ts` (74) | Class router for cloud-agent webview messages (refresh-status, open-external, open-pr). |
| `devin-message-handler.ts` (76) | Function router for Devin webview messages (cancel-session, refresh-status, open-pr, open-devin). |

### Registered panel types (🟢 confirmed)
| Panel | viewType / panelType | File |
|-------|----------------------|------|
| Agent Chat (editor panel) | `gatomia.agentChatPanel` | agent-chat-panel.ts:157 |
| New Agent Session | `gatomia.agentChat.newSession` | new-session-panel.ts:86 |
| Welcome | `gatomia.welcomeScreen` | welcome-screen-panel.ts:57 |
| Document Preview | `gatomia.documentPreview` | document-preview-panel.ts:38 |
| Cloud Agent Progress | `gatomia.cloudAgentProgress` | cloud-agent-progress-panel.ts:36 |
| Devin Progress | `gatomia.devinProgress` | devin-progress-panel.ts:29 |

### Key functions (🟢 confirmed)
| Function | Location | Signature |
|----------|----------|-----------|
| `createDefaultAgentChatPanelHost` | agent-chat-panel.ts:89 | `(context) => AgentChatPanelHost` (wraps real `createWebviewPanel`) |
| `AgentChatPanel.open` | agent-chat-panel.ts:195 | `() => void` (idempotent reveal; wires plumbing) |
| `AgentChatPanel.handleInputSubmit` | agent-chat-panel.ts:382 | optimistic-append → runner.submit → patch delivered/rejected |
| `AgentChatPanel.flushTranscriptDeltas` | agent-chat-panel.ts:550 | append-only diff by `knownMessageIds` |
| `AgentChatPanel.readTranscript` | agent-chat-panel.ts:571 | scoped memento read via `transcriptKeyFor(id)` |
| `WelcomeScreenPanel.show` | welcome-screen-panel.ts:82 | singleton reveal-or-create |
| `WelcomeScreenPanel.postMessage` / `flushPendingMessages` | welcome-screen-panel.ts:103 / 307 | ready-gated buffering |
| `DocumentPreviewPanel.renderDocument` | document-preview-panel.ts:59 | reveal + post `preview/load-document` |
| `NewSessionPanel.open` / `handleStart` | new-session-panel.ts:103 / 193 | open (throws if disposed); start → onStart → always dispose |
| `CloudAgentProgressPanel.sendSessionData` | cloud-agent-progress-panel.ts:107 | project sessions → `session-update` |
| `handleDevinWebviewMessage` | devin-message-handler.ts:34 | free function router |

### State machines
- **Webview-readiness gate** (welcome, document-preview; see `flowcharts/panels.md`): messages pushed to `pendingMessages` until the webview posts `*/ready`, then `flushPendingMessages()` drains the queue; `dispose` resets `isWebviewReady=false` and clears the queue.
- **AgentChatPanel open/dispose**: `closed → open (idempotent reveal) → disposed` (fires `_onDidDispose` exactly once, then disposes the emitter).
- **NewSessionPanel**: `created → open ⇄ reveal → disposed`; reopening after dispose throws; a start attempt always transitions to disposed.
- **User-message delivery** (mirrors `agent-chat`): `pending → delivered | rejected`.

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| AgentChatPanel **does not** call `registry.attachPanel` — the command handler is the single source of truth for registration (one-panel-per-session invariant; regression noted in spec 018) | agent-chat-panel.ts:203-212 |
| Cloud (read-only) sessions reject `input/submit` immediately with a fixed reason | agent-chat-panel.ts:404-411 |
| Terminal-state sessions reject follow-up input | agent-chat-panel.ts:414-420 |
| No runner attached, or runner lacks `submit` ⇒ user message marked `rejected` | agent-chat-panel.ts:422-445 |
| Transcript pushed as append-only deltas (diff by message id), never full re-render | agent-chat-panel.ts:550-565 |
| Transcript read via a tightly-scoped cast into the store's memento (`transcriptKeyFor`) instead of a public API | agent-chat-panel.ts:571-585 |
| WelcomeScreenPanel is a process-wide **singleton** (`static currentPanel`); `show()` reveals the existing instance | welcome-screen-panel.ts:58,82-98 |
| NewSessionPanel self-disposes after every start attempt (success or failure) to hand off to the real Agent Chat panel | new-session-panel.ts:199-204 |
| DocumentPreviewPanel is read-only: `edit-attempt` shows a warning and never mutates | document-preview-panel.ts:158-163 |
| Panels are created with `enableScripts + retainContextWhenHidden + localResourceRoots:[extensionUri]` | all panels (e.g. agent-chat-panel.ts:98-102) |
| Cloud progress `displayStatus` comes from the **active** provider's `getStatusDisplay(session)`, falling back to raw status | cloud-agent-progress-panel.ts:119 |

### Algorithms (🟢 confirmed)
- **Optimistic user message** — append a `pending` `UserChatMessage` (sequence 0; store re-numbers on read) → `runner.submit(content)` → patch `delivered`, or `rejected` with the thrown reason.
- **Append-only transcript delta** — read transcript, push only ids not in `knownMessageIds`.
- **Ready-gated message buffer** — enqueue until `*/ready`, then flush FIFO (welcome + document-preview).
- **Session projection** (cloud progress) — map `AgentSession` → view DTO (tasks, PRs with default `state:'open'`, provider-derived display status).
- **Self-disposal handoff** (new-session) — `try { onStart() } finally { dispose() }`.

### Dependencies
Internal (consumes): `agent-chat` (`AgentChatRegistry`/`AgentChatSessionStore`/types/telemetry, `transcriptKeyFor`, `TERMINAL_STATES`), `cloud-agents` (`AgentSessionStorage`/`ProviderRegistry`/`AgentPollingService`/`logging`/types), `devin` (`DevinSessionManager`/`DevinPollingService`/`DevinSessionStorage`/`error-notifications`), `commands` (`NewSessionProviderItem`), `services` (preview wiring via `types/preview`), `utils` (`get-webview-content`), `types/preview`, `types/welcome`. Consumed by `providers` (welcome/hooks providers reuse `WelcomeScreenPanel`), `commands`, `extension.ts`. External: `vscode` (Webview/Panel APIs, `window`, `ViewColumn`, `Uri`, `env`, `EventEmitter`), `node:crypto` (`randomUUID`).

> 🟡 **INFERRED:** `new-session-panel.ts` ships a placeholder HTML stub ("React view wired separately") — the real picker UI may now live in the `agent-chat-view-provider` composer; whether this panel is still reachable from a command is best confirmed in the `commands` analysis. 🟡 **INFERRED:** `devin-progress-panel.ts` + `devin-message-handler.ts` look superseded by the provider-agnostic Cloud Agent panel (spec 016); both may be dormant.

---

## Module: `commands`

**Path:** `src/commands/` · **LOC:** ~2,019 (4 source files) · **Complexity:** 🟢 medium

### Purpose
The **VS Code command-handler layer**. Each file declares a frozen map of `gatomia.*` command ids and exports `register*Commands(deps): Disposable[]` (called from `extension.ts`), plus the handler logic as **pure, dependency-injected functions** so they are unit-testable without the real command registry or an Extension Development Host. Three command families — Agent Chat panel (spec 018), Cloud Agent multi-provider (spec 016), and legacy Devin (spec 001) — wire user/tree/palette actions to the feature-layer services. The handlers hold the *orchestration* logic (cap enforcement, two-step destructive confirmation, retry, duplicate-dispatch guards); the registration functions are thin `commands.registerCommand` wrappers that also normalize the arg shape (raw string vs. tree-item passed by `view/item/context`).

### Primary files
| File | Role |
|------|------|
| `agent-chat-commands.ts` (749) | 8 Agent Chat commands (`AGENT_CHAT_COMMANDS`): startNew, openForSession, cancel, cleanupWorktree, changeMode/Model/ExecutionTarget, cleanupOrphanedWorktree. `AgentChatCommandsDeps` DI bag with `Pick<>`-narrowed registry/store. |
| `cloud-agent-commands.ts` (620) | 8 Cloud Agent commands (`CLOUD_AGENT_COMMANDS`): selectProvider, changeProvider, configureProvider, dispatchTask, dispatchFullSpec, cancelSession, removeSession, refresh. Retry + duplicate-dispatch guard. |
| `devin-commands.ts` (380) | 5 legacy Devin commands (`DEVIN_COMMANDS`): startTask, configureCredentials, cancelSession, openProgress, startAllTasks (batch). |
| `agent-chat-new-session.ts` (270) | QuickPick flow for `gatomia.agentChat.newSession`: tier-grouped agent picker + task prompt. Owns the `NewSessionProviderItem` type. |

### Command ids (🟢 confirmed)
| Family | Constant | Ids |
|--------|----------|-----|
| Agent Chat | `AGENT_CHAT_COMMANDS` | `gatomia.agentChat.{startNew, openForSession, cancel, cleanupWorktree, changeMode, changeModel, changeExecutionTarget, cleanupOrphanedWorktree}` (+ `newSession` handled in `agent-chat-new-session.ts`) |
| Cloud Agent | `CLOUD_AGENT_COMMANDS` | `gatomia.{selectProvider, changeProvider, configureProvider, dispatchTask, dispatchFullSpec, cancelSession, removeSession, refreshCloudAgents}` |
| Devin | `DEVIN_COMMANDS` | start/configure-credentials/cancel/open-progress/start-all (ids in `features/devin/config`) |

### Key functions (🟢 confirmed)
| Function | Location | Role |
|----------|----------|------|
| `handleStartNew` | agent-chat-commands.ts:207 | cap-check → startAcpSession → registerSession → attachRunner → createPanel → **attachPanel** → reveal |
| `enforceConcurrentCap` | agent-chat-commands.ts:234 | `checkCapacity` → `promptForCap` → abort / cancel-and-start / cancel-only (+ telemetry) |
| `handleOpenForSession` | agent-chat-commands.ts:284 | restart-fallback hydrate from store; `focusPanel` reuse (one-panel-per-session, FR-008) else create |
| `handleChangeModel` / `tryAcpSetModel` | agent-chat-commands.ts:487 / 528 | experimental ACP `session/set_model`; `ACP_NOT_SUPPORTED` ⇒ legacy `recordModelChange` + store |
| `handleChangeMode` | agent-chat-commands.ts:462 | record in transcript first, then persist (effective next turn) |
| `handleChangeExecutionTarget` | agent-chat-commands.ts:584 | reject when `lifecycleState === 'running'` (target immutable after turn) |
| `handleCleanupWorktree` / `…OrphanedWorktree` | agent-chat-commands.ts:409 / 358 | two-step destructive: warning(inspection) → confirm → ok/error |
| `coerceSessionIdArg` | agent-chat-commands.ts:708 | string \| `SessionTreeItemLike` → sessionId |
| `handleNewSession` / `buildQuickPickItems` | agent-chat-new-session.ts:183 / 127 | tier-grouped QuickPick → task prompt → `startNew` |
| `handleDispatchTask` / `createSessionWithRetry` | cloud-agent-commands.ts:347 / 416 | task extract → dup-guard → build context → retry(2) on recoverable `ProviderError` |
| `ensureActiveProvider` | cloud-agent-commands.ts:319 | provider-selected + credentialed gate (chains select/configure commands) |
| `handleStartSingleTask` / `handleStartAllTasks` | devin-commands.ts:165 / 281 | git-validate → confirm → startTask / batch (BatchProcessor + RateLimiter) |

### State machines / decision flows
- **Concurrent-cap enforcement** (see `flowcharts/commands.md`): `checkCapacity.ok? proceed : promptForCap → {abort ⇒ stop | cancel-and-start ⇒ cancel idle + start | cancel-only ⇒ stop}`. Fails closed (abort) when no prompt helper is wired.
- **Two-step worktree cleanup**: `confirmedDestructive:false → inspect → (clean? remove : warning{inspection})`; UI re-invokes `confirmedDestructive:true → remove → ok | error`.
- **Model change**: `acp + manager? set_model → ok | (ACP_NOT_SUPPORTED ⇒ fallback) : fallback`; fallback = `recordModelChange` + `updateSession`.
- **Cloud dispatch**: `ensureActiveProvider → extractTask → dup-running guard → createSessionWithRetry → storage.create → start polling(30s)`.

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| `handleStartNew` is the **single source of truth** for panel registration (`attachPanel`); the panel never self-registers | agent-chat-commands.ts:221-226 |
| Concurrent-ACP-cap enforcement only runs when both `concurrentCap` and `registry.checkCapacity` are wired; otherwise skipped (legacy compat); no prompt helper ⇒ fail closed | agent-chat-commands.ts:238-260 |
| `openForSession` lazily hydrates the registry from the store after a reload (T047), then honors one-panel-per-session via `focusPanel` (emits `PANEL_REOPENED`) | agent-chat-commands.ts:297-313 |
| Mode change recorded in transcript **before** the store patch; takes effect on the next turn (data-model invariant 6) | agent-chat-commands.ts:475-484 |
| Execution-target change rejected once a turn has run (`running` state) — target immutable after first turn | agent-chat-commands.ts:594-596 |
| Worktree cleanup re-throws `WorktreeCleanupWarningRequired` into a `warning` result (two-step destructive confirm) | agent-chat-commands.ts:447-450 |
| `changeModel` prefers experimental `session/set_model`; only `ACP_NOT_SUPPORTED` triggers fallback — other errors are re-thrown to the caller's error boundary | agent-chat-commands.ts:545-551 |
| New-session QuickPick groups by availability tier (Installed / Available via npx / Install required); `install-required` opens the install URL instead of starting; the old npx confirmation modal was removed | agent-chat-new-session.ts:115-165,209-235 |
| Cloud dispatch retries at most twice and only when `ProviderError.recoverable`, with linear backoff `RETRY_DELAY_MS*(attempt+1)` | cloud-agent-commands.ts:413-438 |
| Cloud dispatch blocks duplicates: an active session for the same spec-task id prompts "Open Session / Cancel" instead of dispatching again | cloud-agent-commands.ts:440-463 |
| Cloud cancel refuses read-only sessions (imported from a previous provider) | cloud-agent-commands.ts:555-560 |
| Polling auto-starts at 30 s on first dispatch when not already running | cloud-agent-commands.ts:395-397,507-509 |
| Devin `cog_`-prefixed API keys additionally require an Organization ID (v3 API) | devin-commands.ts:239-249 |
| Devin task start is gated by `validateGitState` + an explicit confirmation dialog | devin-commands.ts:181-199 |
| Tree-context commands accept the whole tree item (not an `arguments` array) and extract ids themselves | agent-chat-commands.ts:684-718; cloud-agent-commands.ts:131-143 |

### Algorithms (🟢 confirmed)
- **Arg coercion** — accept `string | TreeItemLike | undefined`; pull `sessionId`/`localId`/orphan fields, no-op on absence.
- **Tier-grouped QuickPick** — bucket providers into 3 tiers, emit `Separator` items + per-provider entries (source-icon descriptions), re-resolve the pick against the original list (QuickPick may drop custom fields).
- **Bounded recoverable retry** — loop ≤ `MAX_DISPATCH_RETRIES`, retry only `ProviderError.recoverable`, backoff `1000*(attempt+1)` ms.
- **Two-step destructive confirm** — first pass returns `warning{inspection}`, second pass (`confirmedDestructive`) performs the removal.
- **Lazy `vscode` resolution** — `separatorKind()` / `parseUriSafe()` read the enum/`Uri` via `require('vscode')` guarded by try/catch so unit tests run without the module.

### Dependencies
Internal (consumes): `agent-chat` (`AgentChatRegistry`, `AgentChatSessionStore`, `AgentWorktreeService` + `WorktreeCleanupWarningRequired`, `cap-warning-prompt`, telemetry, types), `services` (`acp/types` → `ACP_NOT_SUPPORTED`), `cloud-agents` (`ProviderRegistry`, `AgentSessionStorage`, `AgentPollingService`, `CloudAgentProvider`, `ProviderError`, `SessionStatus`, types, logging), `devin` (`config`, `devin-credentials-manager`, `devin-session-manager`, `git-validator`, `task-initiation-ui`, `batch-processor`/`rate-limiter`/`batch-*`, `spec-content-reader`, telemetry, `errors`/`error-notifications`, `devin-api-client-factory`), `panels` (`DevinProgressPanel`). Consumed by `extension.ts` (registration). External: `vscode` (`commands`, `window`, `workspace`, `Uri`, `QuickPick`/`InputBox`), `node:path` (`dirname`).

> 🟢 **RESOLVED (from `panels`):** the `gatomia.agentChat.newSession` flow is the **QuickPick** in `agent-chat-new-session.ts`, not the `NewSessionPanel` stub — confirming the stub panel is dormant on the active path. 🔴 **GAP:** the `package.json` `contributes.commands` / `menus` (`view/item/context`, command palette `when` clauses, icons) that surface these ids are not in this folder — confirm against `package.json`.

---

## Module: `utils`

**Path:** `src/utils/` · **LOC:** ~4,147 (18 source files, + co-located tests) · **Complexity:** 🟢 high

### Purpose
The **cross-cutting shared-utilities layer** consumed by every other module. Five clusters: (1) the **spec-system abstraction** (a unified facade over SpecKit's numbered `specs/NNN-slug/` + `.specify/` and OpenSpec's `openspec/specs/`); (2) **markdown parsing** (`tasks.md`, checklists, YAML frontmatter, friendly titles); (3) **Copilot / MCP integration** via VS Code's Language Model API (`vscode.lm`); (4) **platform & IDE-host detection** (multi-fork data-dir/MCP-config resolution, CLI probing with extended PATH); and (5) **webview/chat/state/telemetry helpers** (the shared webview HTML builder, the chat-prompt decorator+dispatcher, welcome workspace-state, preview telemetry). Mostly pure functions plus a few module-private singletons (`SpecSystemAdapter`, `ConfigManager`, `TelemetryStore`).

### Primary files
| File | LOC | Role |
|------|-----|------|
| `copilot-mcp-utils.ts` | 653 | MCP over `vscode.lm`: discover servers/tools, `invokeTool`, tool↔server correlation heuristics, display-name formatting. |
| `spec-kit-adapter.ts` | 618 | `SpecSystemAdapter` singleton — unified SpecKit/OpenSpec facade (detect/list/create/getFiles/open). |
| `telemetry.ts` | 513 | In-memory **preview** telemetry (load/diagram/form/refinement trackers, p95 + SC-001/SC-002 targets). |
| `task-parser.ts` | 372 | `tasks.md` → `TaskGroup[]` (inline `T###` + header-style + acceptance-criteria status derivation). |
| `spec-kit-utilities.ts` | 357 | Pure SpecKit helpers (dir parse, slug↔name, feature discovery/numbering, structure validation, path getters). |
| `spec-kit-migration.ts` | 315 | `SpecKitMigration` — OpenSpec→SpecKit migration + constitution generation (**the only disk writer here**). |
| `config-manager.ts` | 239 | `ConfigManager` singleton — `OpenSpecSettings` from `gatomia.*` config + defaults (in-memory merge). |
| `cli-detector.ts` | 188 | `checkCLI` / `getExtendedPath` / `extractVersion` / `locateCLIExecutable` (CLI probing). |
| `platform-utils.ts` | 167 | `getVSCodeUserDataPath` / `getMcpConfigPath` (multi-fork + WSL + profile-aware). |
| `yaml-frontmatter-parser.ts` | 106 | Lightweight frontmatter + `extractDocumentTitle` (no YAML lib). |
| `checklist-parser.ts` | 105 | Checklist `.md` → items + status ratio. |
| `chat-prompt-runner.ts` | 102 | `sendPromptToChat` / `buildFinalPrompt` (instruction+language decoration → dispatcher or chat.open). |
| `workspace-state.ts` | 102 | Welcome-screen `workspaceState` keys + show-on-startup gate. |
| `get-webview-content.ts` | 76 | **Shared webview HTML builder** (CSP + nonce + `data-page` + escaped data-attrs). |
| `ide-host-detector.ts` | 75 | `detectIdeHost` / `isAcpCandidateHost` (appName regex rules). |
| `notification-utils.ts` | 59 | `NotificationUtils` (auto-dismiss/error/warning/info/review-alert). |
| `copilot-chat-utils.ts` | 50 | `addDocumentToCopilotChat` (select-all → `chatgpt.addToThread`). |
| `document-title-utils.ts` | 50 | `toFriendlyName` / `getRelativePath`. |

### Key functions (🟢 confirmed)
| Function | Location | Role |
|----------|----------|------|
| `SpecSystemAdapter.initialize` | spec-kit-adapter.ts:83 | resolve active system (pref → auto-detect → QuickPick if both) + paths |
| `SpecSystemAdapter.getSpecKitFeatureFiles` | spec-kit-adapter.ts:317 | ordered known-file map + `extra:`/`extra-folder:` discovery |
| `parseSpecKitDirectoryName` / `discoverSpecKitFeatures` | spec-kit-utilities.ts:80 / 124 | `NNN-slug` parse; sorted feature list |
| `parseTasksContent` | task-parser.ts:89 | dual-format task parse + status finalizer |
| `queryMCPServers` / `correlateToolWithServer` | copilot-mcp-utils.ts:87 / 374 | group `lm.tools` by server via heuristics |
| `executeMCPTool` | copilot-mcp-utils.ts:247 | `lm.invokeTool(name,{input},token)` |
| `getMcpConfigPath` / `getVSCodeUserDataPath` | platform-utils.ts:108 / 61 | profile-aware mcp.json; multi-fork data dir (+WSL) |
| `checkCLI` / `getExtendedPath` | cli-detector.ts:73 / 19 | version probe with extended PATH + `which` fallback |
| `detectIdeHost` / `isAcpCandidateHost` | ide-host-detector.ts:46 / 69 | host classification; ACP eligibility |
| `getWebviewContent` | get-webview-content.ts:14 | CSP'd webview HTML (shared by all panels/views) |
| `buildFinalPrompt` / `sendPromptToChat` | chat-prompt-runner.ts:46 / 75 | prompt decoration → dispatcher/`chat.open` |
| `SpecKitMigration.migrateAllSpecs` | spec-kit-migration.ts:185 | backup → per-spec migrate → constitution |
| `getPerformanceSummary` | telemetry.ts:345 | avg/median/p95 + per-type rollup |

### State machines / decision flows
- **Spec-system resolution** (see `flowcharts/utils.md`): `user pref? → use it : detect available → (both? QuickPick + persist | one? use it | none? AUTO)`; SpecKit ⇒ `specs/` + `.specify/templates`, OpenSpec ⇒ `openspec/`.
- **Task-status derivation**: header-style task status = acceptance-criteria ratio (all✓ ⇒ completed, some ⇒ in-progress, none ⇒ not-started), overridden by explicit `**STATUS**` markers; inline `- [x] T###` = checked⇒completed.
- **MCP tool→server correlation**: `vscode built-in? → vscode-tools` → configured-id substring/path/hyphen match → `mcp_<id>_` prefix → `other-tools` fallback.
- **MCP config path**: profile dir? → newest profile `mcp.json` → else `User/mcp.json` (returned even if absent, for future creation).
- **Chat dispatch**: `injected ChatDispatcher? → dispatch(files) : chat.open(query[, files if VS Code ≥1.95.0])`.

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| Active spec system: explicit `gatomia.specSystem` wins; else auto-detect; if **both** present and no pref, prompt + persist the choice (cancel ⇒ default SpecKit, not persisted) | spec-kit-adapter.ts:93-144 |
| SpecKit feature dir must match `^\d{3,}-(.+)$`; next number = max existing + 1; features sorted by number | spec-kit-utilities.ts:80-167 |
| Files in a spec dir not in `KNOWN_SPEC_FILES`/`KNOWN_SPEC_FOLDERS` are surfaced as `extra:`/`extra-folder:` entries (extension-generated docs) | spec-kit-adapter.ts:23-36,364-394 |
| Task status: explicit `**STATUS**` marker overrides acceptance-criteria ratio; phase headers excluded via a denylist of summary/meta headings | task-parser.ts:118-124,151-168 |
| MCP discovery degrades gracefully: missing `vscode.lm`/`lm.tools` ⇒ `[]`, never throws on availability check; tools without a matched server fall to `other-tools` | copilot-mcp-utils.ts:90-98,297-324,403-404 |
| `executeMCPTool` invokes `lm.invokeTool` with `toolInvocationToken: undefined` (called outside a chat request, per the VS Code contract) | copilot-mcp-utils.ts:262-269 |
| `mcp.json` resolution is profile-aware: newest-modified profile `mcp.json` wins, else `User/mcp.json`; WSL resolves the Windows `%APPDATA%` via `cmd.exe` + `wslpath` | platform-utils.ts:108-167 |
| `checkCLI` runs with an **extended PATH** (UV/cargo/bun/deno/homebrew); on failure it still `which`/`where`-locates the binary and reports `installed:false` with any captured version | cli-detector.ts:73-188 |
| ACP routing is eligible only on Windsurf/Antigravity **and** non-remote workspaces (`env.remoteName` falsy) | ide-host-detector.ts:69-74 |
| Webview HTML uses a per-render 32-char nonce + strict CSP (`script-src 'nonce-…'`); extra data-attrs are HTML-escaped | get-webview-content.ts:36,47-65 |
| `buildFinalPrompt` appends global + instruction-type-specific custom instructions and a language directive when chatLanguage ≠ "English" | chat-prompt-runner.ts:46-73 |
| `chat.open` only passes the `files` arg on VS Code ≥ 1.95.0 | chat-prompt-runner.ts:14,91-101 |
| Migration always creates a timestamped backup `.openspec-backup-<iso>` before writing; maps OpenSpec `design.md → plan.md`, keeps `requirements.md` as an extra | spec-kit-migration.ts:38-57,255-307 |
| Preview telemetry store is capped at 1000 entries per metric type (oldest pruned); targets SC-001 (95% < 3 s) and SC-002 (90% diagram success) | telemetry.ts:100,145-149,440-451 |

### Algorithms (🟢 confirmed)
- **Dual-format task parse** — single pass with a `finalizeTask` closure; inline-vs-header dispatch, acceptance-criteria accumulation, STATUS/priority/complexity regex extraction.
- **Tool↔server correlation** — layered heuristics (built-in → substring/path/hyphen → `mcp_` prefix → fallback) + title-case display formatting with a known-acronym map.
- **Multi-fork data-dir resolution** — appName → IDE dir name; platform branch (win `%APPDATA%`, WSL via `cmd.exe`+`wslpath`, darwin `Library/Application Support`, linux `.config`).
- **Version extraction** — JSON-first then ordered semver regexes; extended-PATH exec with timeout + signal detection.
- **Frontmatter parse** — regex-delimited block + naive `key: value` (quote stripping), title fallback chain (frontmatter → first H1 → filename).
- **p95 / summary** — sort durations, index `floor(len*0.95)`; per-document-type rollups.
- **Recursive markdown discovery** — `directoryHasMarkdown` DFS to decide whether an unknown subfolder is an extension doc folder.

### Dependencies
Internal (consumes): `constants` (paths/config namespaces/spec modes), `features/hooks` (`MCPServer`/`MCPTool` types), `features/steering` (`ConstitutionManager`), `services` (`ChatDispatcher` type). Consumed by **virtually everything**: `providers`, `panels`, `commands`, `services`, and most `features/*` (e.g. `get-webview-content`, `sendPromptToChat`, `SpecSystemAdapter`, `task-parser`, `cli-detector`, `ide-host-detector` are hubs). External: `vscode` (`lm`, `env`, `commands`, `workspace`, `window`, `extensions`, `version`, `Uri`, `ProgressLocation`), `node:fs`/`fs/promises`, `node:path`, `node:os`, `node:child_process`, `node:util`.

> 🟡 **INFERRED:** `ConfigManager.loadSettings`/`saveSettings` only mutate in-memory state (no persistence write) — VS Code `workspace.getConfiguration` is the real source of truth; `saveSettings` appears to be a partial/legacy persistence path. 🟡 **INFERRED:** `utils/telemetry.ts` is **preview-scoped** and in-memory only (separate from the per-feature `telemetry.ts` event sinks); no external pipeline is wired here. 🔴 **GAP:** `correlateToolWithServer` is heuristic — tools whose names don't encode their server land in `other-tools`, so the server grouping can be imperfect for unconventional MCP tool names.

---

## Module: `prompts`

**Path:** `src/prompts/` (+ generated `src/prompts/target/`) · **LOC:** ~93 (compiled TS) + 4 markdown sources · **Complexity:** 🟢 low

### Purpose
The **built-in prompt-template library**: markdown source prompts with YAML frontmatter and Handlebars placeholders, plus their **compiled TypeScript output** (`target/`). A build step (`npm run build-prompts`) reads each `*.prompt.md` / `*.md`, parses the frontmatter, and emits `target/<name>.ts` exporting a `frontmatter` object, the raw `content` string, and a `default { frontmatter, content }`. `target/index.ts` re-exports every prompt under a camelCased name. These compiled modules are loaded by `services/prompt-loader.ts`, which compiles the Handlebars `content`, validates required variables, and renders. The four prompts implement the **SpecKit workflow chain** (specify → plan → tasks) plus a demo `example`.

### Files
| File | Role |
|------|------|
| `*.prompt.md` / `example.md` (sources) | Authoring format: `--- name/description/version/variables ---` frontmatter + Handlebars `{{var}}` body. |
| `target/<name>.ts` (generated) | `export const frontmatter`, `export const content` (escaped string), `export default {frontmatter, content}`; header `// DO NOT EDIT MANUALLY`. |
| `target/index.ts` (generated) | Barrel re-export: `example`, `specKitPlan`, `specKitSpecify`, `specKitTasks`. |

### Built-in prompts (🟢 confirmed)
| Prompt | Required variable | Purpose |
|--------|-------------------|---------|
| `example` | `name` (string) | Loader-system demo (`Hello {{name}}!`). |
| `spec-kit-specify` | `context` | Generate a spec document from context (Overview/Scenarios/Constraints/Data Model/API/Security; omits "Status"). |
| `spec-kit-plan` | `spec` | Generate an implementation plan (Proposed Changes + Verification Plan). |
| `spec-kit-tasks` | `plan` | Convert a plan into a Markdown task checklist (dependency-ordered). |

### Build pipeline (🟢 confirmed)
See `flowcharts/prompts.md`: `*.md (gray-matter frontmatter + body)` → emit `target/<name>.ts` (`frontmatter` literal + JSON-escaped `content` + default) → regenerate `target/index.ts` barrel. Generated files carry a `DO NOT EDIT MANUALLY` banner; consumed at runtime by `PromptLoader` (Handlebars compile + required-variable validation).

### Dependencies
Internal: consumed by `services/prompt-loader.ts` (built-in prompt registry). The build step is `scripts/build-prompts` wired to `npm run build-prompts` / `build` (esbuild pipeline). External (build only): `gray-matter` (frontmatter parse), `handlebars` (compiled downstream by the loader). External (runtime): none — the generated TS is plain data.

> 🟡 **INFERRED:** the source frontmatter uses YAML `variables.<name>.{required,description}` (and an optional `id`); the compiler preserves these verbatim into the `frontmatter` literal. The actual compiler lives in `scripts/` (outside any analyzed module) — the `target/*.ts` banners (`Auto-generated from …`) are the confirmation. 🔴 **GAP:** whether additional prompts are loaded at runtime from a workspace directory (vs. only these 4 built-ins) is governed by `PromptLoader` + `gatomia.prompts.path` config, analyzed under `services`.

---

# Webview modules (`ui/src/`)

> React 18 SPA built by Vite. Ten "pages" are mounted by `index.tsx` from a `data-page` attribute via `page-registry.tsx` (lazy/code-split). Each webview module talks to the extension host **only** through the `postMessage` bridge (`@/bridge/vscode`) and keeps a hand-maintained mirror of the extension contract types — **no `ui/src` file imports from `src/`**.

---

## Module: `webview-agent-chat`

**Path:** `ui/src/features/agent-chat/` · **LOC:** ~4,541 (25 source files: 22 components + `index.tsx` + `types.ts` + `hooks/use-session-bridge.ts`) · **Complexity:** 🟢 medium

### Purpose
React webview for the Agent Chat Panel — the client half of the extension-side `agent-chat` module. Renders two surfaces from one tree (canonical **sidebar** and legacy editor-area **panel**), holds all chat state in a single `useReducer` store, and drives the host exclusively over the `postMessage` bridge. Owns transcript rendering, the follow-up `InputBar`, the empty-state `NewSessionComposer`, session switching, the pending file-write Accept/Reject bar, and the model / mode / thinking-level / agent-role / permission chips.

### Primary files
| File | Role |
|------|------|
| `hooks/use-session-bridge.ts` (718) | The bridge hub: `useReducer` store, `postMessage` send/receive, incoming→action translation (`INCOMING_HANDLERS`), per-variant `applyPatch`. |
| `types.ts` (418) | Contract mirror of `src/features/agent-chat/types.ts` + webview-only projections (`AgentChatSessionView`, `AgentChatCatalog`, `SidebarSessionListItem`). |
| `index.tsx` (261) | `AgentChatFeature` shell: surface/session-id detection, render decision tree, retryable-error surfacing. |
| `components/input-bar.tsx` (507) | Follow-up composer; disabled-reason precedence; `ModelChip` + thinking/agent-role/permission chips. |
| `components/new-session-composer.tsx` (483) | Empty-state launch form; provider/model/thinking/role/agent-file selection + submit gating. |
| `components/chip-overflow-bar.tsx` (241) · `picker-bar.tsx` (205) · `chip-dropdown.tsx` (189) | Shared chip chrome: responsive overflow row, mode/model/target pickers, chip-styled dropdown. |
| `components/chat-message-item.tsx` (232) · `chat-transcript.tsx` (101) · `tool-call-card.tsx` (182) | Per-role message rendering, scroll container, tool-call card with affected-file diff stats. |
| `components/session-switcher.tsx` (149) · `sessions-list.tsx` (104) · `pending-changes-bar.tsx` (131) | Session switching, recent-session list, pending file-write Accept/Reject bar. |

### Key functions / hooks (🟢 confirmed)
| Function | Location | Signature / role |
|----------|----------|------------------|
| `useSessionBridge` | use-session-bridge.ts:480 | `(initialSessionId?) => AgentChatBridge` — store + send/receive |
| `reducer` | use-session-bridge.ts:194 | `(state, BridgeAction) => AgentChatBridgeState` |
| `translateIncoming` | use-session-bridge.ts:296 | `(activeId, initialId, data) => BridgeAction \| undefined` |
| `applyPatch` | use-session-bridge.ts:447 | per-variant discriminated-union patch |
| `AgentChatFeature` | index.tsx:34 | feature shell / render decision tree |
| `findLatestRetryableError` / `deriveProviderIdForSession` | index.tsx:251 / 242 | backward error scan / `cloud.providerId ?? agentId` |
| `InputBar` / `resolveDisabledReason` / `ModelChip` | input-bar.tsx:94 / 259 / 300 | follow-up composer, gating, chip render contract |
| `NewSessionComposer` | new-session-composer.tsx:83 | empty-state launch form |

### State machines
The bridge `reducer` is the hub; it does not own a lifecycle FSM but projects the host's `SessionLifecycleState` and renders against it. See `flowcharts/webview-agent-chat.md` for the bridge lifecycle, incoming-message routing, outgoing actions, the `InputBar` enablement decision, and the `NewSessionComposer` submit gating.

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| Webview MUST NOT import from `src/`; `types.ts` is the contract mirror, updated in lockstep | types.ts:11 |
| Appended messages are `Set`-deduped by `id` (idempotent re-delivery) | use-session-bridge.ts:212 |
| Panel surface ignores `session/loaded` whose `session.id != initialSessionId` | use-session-bridge.ts:337 |
| Active-session scoping: messages/lifecycle/models/pending-writes dropped when `sessionId != activeSessionId` | use-session-bridge.ts:347-418 |
| `permission-default/changed` only accepts `ask` \| `allow` \| `deny` | use-session-bridge.ts:428 |
| InputBar disabled by precedence: `readOnly` → `!acceptsFollowUp` → `terminal` | input-bar.tsx:121,259 |
| Enter submits, Shift+Enter newlines; submit requires non-empty trimmed value | input-bar.tsx:130,153 |
| ModelChip: dynamic `<select>` if `availableModels` non-empty → loading label → static `modelLabel` → hidden | input-bar.tsx:300-386 |
| Composer default provider = first `enabled`; `canSubmit` = providerId set AND non-empty prompt; Cmd/Ctrl+Enter submits | new-session-composer.tsx:92,233,425 |
| Switching provider resets model/thinking/role, keeps agent file (workspace-scoped), re-probes models | new-session-composer.tsx:129,195 |
| Provider label suffixes by availability ("(via npx)", "(install required)") | new-session-composer.tsx:456 |

### Algorithms (🟢 confirmed)
- **Reducer-based bridge** — single `useReducer`; idempotent append via a `Set` of seen ids; `messages/updated` applies per-variant patches without widening the discriminated union.
- **postMessage translation layer** — `type → INCOMING_HANDLERS[type]` returns a typed `BridgeAction` (or `undefined`), with session-id scoping applied before `dispatch`; keeps the hook under the Biome cognitive-complexity ceiling.
- **Surface inference** — `data-surface` (`sidebar`/`panel`) + `data-session-id` (ignoring `"unknown-session"`) read off the root DOM node drive binding mode and the empty-state render branch.

### Dependencies
Internal (webview): `webview-shared` (`@/bridge/vscode`). Crosses the `postMessage` bridge to the extension-side `agent-chat` module (every `agent-chat/*` message). External: `react` (`useReducer`/`useCallback`/`useEffect`/`useMemo`), `@vscode/codicons` (toolbar glyphs). 🟡 INFERRED: the chip components (`chip-dropdown`, `chip-overflow-bar`, `provider-icon`) are local to this module, not shared infra.

---

## Module: `webview-spec-explorer`

**Path:** `ui/src/components/spec-explorer/`, `ui/src/features/{create-spec-view,create-steering-view,simple-view,interactive-view}/`, `ui/src/services/spec-explorer.ts`, `ui/src/stores/spec-explorer-store.ts` · **LOC:** ~2,733 (20 source files) · **Complexity:** 🟢 medium

### Purpose
Spec authoring + review-flow webview surfaces. Covers four mounted "pages" — `simple` (static demo), `interactive` (extension message playground), `create-spec` and `create-steering` (autosaving authoring forms) — plus the **Spec Explorer review-flow components** (ready-to-review / changes / archived lists, change-request form/actions, send-to-review & archive buttons) backed by an observable store and a request/response messaging service.

### Primary files
| File | Role |
|------|------|
| `services/spec-explorer.ts` (233) | `SpecExplorerService`: own `acquireVsCodeApi()` (`window.specExplorerVscode`), `SpecExplorerMessage` contract, promise-with-5s-timeout fetches, change-request submit/file, navigate. |
| `stores/spec-explorer-store.ts` (89) | `SpecExplorerStore`: `useSyncExternalStore` observable for `reviewSpecs`/`archivedSpecs`; `specExplorerActions` + `useSpecExplorerStore(selector)`. |
| `features/create-spec-view/index.tsx` (415) | `CreateSpecView`: description form, 600 ms autosave, markdown import, image attachments, dirty/close guard. |
| `features/create-steering-view/index.tsx` (380) | `CreateSteeringView`: 4-field steering form (summary required), autosave, dirty/close guard. |
| `components/spec-explorer/change-request-form.tsx` (235) | `ChangeRequestForm`: title/description/severity validation + duplicate-title detection. |
| `components/spec-explorer/{ready-to-review,changes,archived}-list.tsx` (134/143/150) | Review-lane lists with empty states and per-spec actions. |
| `features/interactive-view/index.tsx` (132) | `InteractiveView`: command-keyed message playground (Cmd/Ctrl+Enter to send). |
| `features/simple-view/index.tsx` (18) | Static placeholder view (sample GIF). |

### Key functions / components (🟢 confirmed)
| Function | Location | Role |
|----------|----------|------|
| `SpecExplorerService.fetchReadyToReviewSpecs` / `fetchChangeRequests` | services/spec-explorer.ts:154 / 177 | request/response with 5 s timeout → `[]` |
| `SpecExplorerService.submitChangeRequest` / `fileChangeRequest` / `navigateToSpec` | services/spec-explorer.ts:206 / 199 / 222 | host actions |
| `SpecExplorerStore` (+ `useSpecExplorerStore`, `specExplorerActions`) | stores/spec-explorer-store.ts:11 / 73 / 83 | observable store + selector hook |
| `CreateSpecView` / `persistDraft` | create-spec-view/index.tsx:55 / 71 | authoring view + debounced autosave |
| `CreateSteeringView` / `validateForm` | create-steering-view/index.tsx:78 / 152 | authoring view + summary-required validation |
| `ChangeRequestForm` / `normalizeTitle` | change-request-form.tsx:47 / 44 | review-input form + duplicate detection |
| `InteractiveView` | interactive-view/index.tsx:12 | message playground |

### State machines
No FSM — the store is a flat observable (`reviewSpecs` + `archivedSpecs`). The review/create flows are request/response and form-lifecycle driven; see `flowcharts/webview-spec-explorer.md`.

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| ⚠️ Spec types imported directly from `src/features/spec/review-flow/types` (compile-time coupling — deviates from `webview-agent-chat` no-`src/` rule) | spec-explorer-store.ts:2; change-request-form.tsx:11; ready-to-review-list.tsx:9 |
| Service uses a **separate** `acquireVsCodeApi()` (`window.specExplorerVscode`), not the shared `@/bridge/vscode` | services/spec-explorer.ts:100 |
| Fetch operations resolve `[]` after a 5 s timeout (no hang on a silent host) | services/spec-explorer.ts:167,189 |
| ChangeRequestForm requires title + description + severity; duplicate detection via `normalizeTitle` (lowercase/trim/collapse-ws) against non-`addressed` CRs | change-request-form.tsx:72,104 |
| create-spec: description required (trimmed); 600 ms debounced autosave → `vscode.setState` + `create-spec/autosave`; markdown import confirms overwrite when text present; `beforeunload` guard when dirty | create-spec-view/index.tsx:104,305,140,285 |
| create-steering: summary required, other 3 fields optional; `areFormsEqual` dirty check; 600 ms autosave; `beforeunload` guard | create-steering-view/index.tsx:155,38,126,289 |
| interactive-view: Cmd/Ctrl+Enter sends; uses **command**-keyed messages (`interactive-view.sendMessage`/`showMessage`) | interactive-view/index.tsx:31,24 |

### Algorithms (🟢 confirmed)
- **Observable store** — `useSyncExternalStore` with a `Set<Listener>`, immutable state replacement on every mutation; `updateSpec` maps across both lanes by `id`.
- **Promise-with-timeout request/response** — `on(type)` one-shot subscription + `setTimeout(5000)` fallback resolving to `[]`.
- **Duplicate change-request detection** — title normalization (`toLowerCase().trim().replace(/\s+/g," ")`) compared against active (non-`addressed`) requests.
- **Debounced autosave** — 600 ms `setTimeout` → `vscode.setState` + host `*/autosave` message, gated by a `lastPersistedRef` equality check.

### Dependencies
Internal (webview): `webview-shared` (`@/bridge/vscode`, `pill-button`, `textarea-panel`); `create-steering-view` reuses `create-spec-view`'s `StatusBanner` (intra-module). Crosses the bridge to the extension `spec` + `steering` modules. ⚠️ **Compile-time** import from `src/features/spec/review-flow/types`. External: `react`, `lucide-react` (`Send`/`X` icons in create-spec).

---

## Module: `webview-hooks-view`

**Path:** `ui/src/features/hooks-view/`, `ui/src/components/hooks/`, `ui/src/components/cli-options/`, `ui/src/lib/mcp-utils.ts` · **LOC:** ~8,680 (~42 source files incl. CSS) · **Complexity:** 🔴 high (largest webview module)

### Purpose
Webview for the **automation hooks** UI — the client of the extension-side `hooks` module. Lets the user create/edit/toggle/delete hooks that fire **before/after** agent operations and run one of six action types (`agent`, `git`, `github`, `custom`, `mcp`, `acp`). Hosts the hook list, the multi-step hook form with per-action-type sub-forms, MCP server/tool discovery and selection, GitHub Copilot CLI option panels, ACP local-agent configuration, and the execution-logs panel.

### Primary files
| File | Role |
|------|------|
| `features/hooks-view/types.ts` (503) | Full hook data model: `Hook`, 6 `*ActionParams`, `CopilotCliOptions`, MCP/ACP types, execution logs, and the dual-keyed `HooksExtension`/`HooksWebviewMessage` unions. |
| `features/hooks-view/index.tsx` (318) | `HooksView` orchestrator: hooks CRUD, dual-key message handling, form/logs panel state. |
| `features/hooks-view/components/trigger-action-selector.tsx` (754) | Trigger (event/timing) + action-type selection — largest single component. |
| `features/hooks-view/components/{hook-form,github-action-form,mcp-action-picker,mcp-tools-selector}.tsx` (346/465/357/312) | Hook form shell + action sub-forms + MCP tool picker/selector. |
| `features/hooks-view/components/argument-template-editor.tsx` (520) | `$variable` template editor for passing trigger context to actions. |
| `features/hooks-view/components/cli-options/*` (~1,888) | Six GitHub Copilot CLI option panels (permissions, MCP servers, model/execution, output/logging, session). |
| `features/hooks-view/hooks/{use-mcp-servers,use-available-models,use-acp-agents,use-known-acp-agents}.ts` (283/138/57/82) | Discovery hooks + `groupToolsByProvider`. |
| `lib/mcp-utils.ts` (229) | MCP tool-name parsing: `extractServerIdFromToolName`, `formatServerName`, `formatDisplayName`. |

### Key functions / components (🟢 confirmed)
| Function | Location | Role |
|----------|----------|------|
| `HooksView` / `sendMessage` | hooks-view/index.tsx:14 / 29 | orchestrator + dual-key sender (`command = type.replace(/\//g,".")`) |
| `extractServerIdFromToolName` | lib/mcp-utils.ts:40 | parse server id from `mcp_<server>_<tool>` (handles `.`/`/`) |
| `formatServerName` / `formatDisplayName` | lib/mcp-utils.ts:129 / 201 | known-server map + acronym title-casing |
| `groupToolsByProvider` | hooks-view/hooks/use-mcp-servers.ts:232 | group + dual-sort tools; orphan → "Other" |
| `useMCPServers` | hooks-view/hooks/use-mcp-servers.ts:110 | discovery hook (auto on mount, manual force-refresh) |
| `HookForm` | hooks-view/components/hook-form.tsx | action-type-routed parameter form |

### State machines
No formal FSM. `HookExecutionStatusState` (`executing → completed | failed`) is a status projection; the form is a create/edit toggle. See `flowcharts/webview-hooks-view.md` for the CRUD lifecycle, dual-keyed protocol, MCP discovery/grouping, the tool-name parser, and action-type form routing.

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| Dual-keyed protocol: send `command = type` with `/`→`.`; read `type ?? command` and `payload ?? data` | index.tsx:30,54 |
| Form is **not** reset on `hooks/sync` (avoids race); closes only on cancel / successful save / delete | index.tsx:68 |
| Create payload omits `id`/`createdAt`/`modifiedAt`/`executionCount` (host-assigned) | types.ts:467 |
| `TriggerCondition.waitForCompletion` only meaningful for `before` timing | types.ts:27 |
| ACP execution mode is `local` only (v1) | types.ts:202 |
| MCP server-id extraction: server ids never contain `_`; handle `.` (domain) and `/` (path) notation | mcp-utils.ts:40 |
| `groupToolsByProvider`: groups alpha by server name, tools alpha by displayName; selected tools from unknown servers → synthetic `Other` group | use-mcp-servers.ts:232 |
| `useMCPServers` auto-discovers on mount; `discover(true)` forces a cache refresh | use-mcp-servers.ts:204,119 |
| `hooks/execution-status` merges per `hookId` with a fresh `updatedAt` | index.tsx:103 |

### Algorithms (🟢 confirmed)
- **MCP tool-name parsing** — boundary detection across simple / path (`/`) / domain (`.`) server ids: locate the first `_` after the last `/` or `.`, else the first `_`.
- **Server/tool display formatting** — known-server lookup table + acronym normalization (`MCP`/`GitHub`/`GitLab`) + per-segment title-casing.
- **Tool grouping** — provider grouping with two-level alphabetical sort + orphaned-selection collection into an `Other` group.
- **Discovery hooks** — request/response over `postMessage` with `loading`/`error` state and dual-keyed type matching (`useMCPServers`, `useAvailableModels`, `useACPAgents`, `useKnownACPAgents`).

### Dependencies
Internal (webview): `webview-shared` (`@/bridge/vscode`); shares `components/hooks/` + `components/cli-options/` primitives. Crosses the bridge to the extension `hooks` module (+ MCP discovery, model cache, ACP agent catalog). External: `react`. 🟡 INFERRED: `components/hooks/trigger-action-selector.tsx` (313) and `features/hooks-view/components/trigger-action-selector.tsx` (754) are **two** trigger selectors, and `components/cli-options/*` duplicates `features/hooks-view/components/cli-options/*` — likely an in-progress consolidation (Rule-of-Three candidate). 🔴 GAP: which trigger-selector variant is wired in production needs confirmation against the host's `getWebviewContent`.

---

## Module: `webview-orchestration`

**Path:** `ui/src/features/{orchestration,workflow-composer}/`, `ui/src/components/{workflow,workflow-graph,kanban,devin,cloud-agents}/`, `ui/src/stores/{devin-store,cloud-agent-store}.ts` · **LOC:** ~3,200 (~30 source files) · **Complexity:** 🟡 medium

### Purpose
Agent-orchestration / monitoring webview surfaces. Two **mounted** pages: `orchestration` (the "Running Agents Prototype" — buckets active/recent local + cloud sessions into lanes) and `workflow-composer` (a React Flow visual editor that maps automation hooks into an event→condition→schedule→action graph). ⚠️ The module is also a **prototype graveyard**: the Kanban board and the legacy Devin/Cloud-Agent progress views are built but **not reachable** through the current `page-registry.tsx` (see Business rules).

### Primary files
| File | Role |
|------|------|
| `features/orchestration/index.tsx` (470) | `OrchestrationFeature` page: `orchestration/ready` handshake, `orchestration/snapshot` ingest, 4-bucket grouping, degraded-mode empty-state decision tree, `SessionCard` with open/external actions. |
| `features/workflow-composer/index.tsx` (154) | `WorkflowComposerFeature` page: loads hooks via the hooks bridge, renders React Flow graph, side-panel `HookForm` for create/edit. |
| `features/workflow-composer/utils/mapper.ts` (180) | `mapHooksToGraph`: deterministic node/edge layout (events→conditions→schedule→action chain). |
| `components/workflow-graph/{workflow-graph,nodes/base-nodes}.tsx` (58/84) | `@xyflow/react` `ReactFlow` wrapper + 4 custom node types (Source/Condition/Schedule/Action) with Handles. |
| `components/workflow/*` (336) | Prototype UI kit: `PanelSection`, `StatusBadge`, `MetricRow`, `ActionToolbar`, `EmptyState`. |
| `components/kanban/{kanban-board,kanban-column,kanban-card}.tsx` (269) | ⚠️ Unmounted board: groups `NormalizedTask[]` by `execution.state` into 6 columns. |
| `components/devin/*` (606) + `stores/devin-store.ts` (118) | ⚠️ Legacy Devin progress views (spec 001); singleton store + `useSyncExternalStore`. |
| `components/cloud-agents/*` (346) + `stores/cloud-agent-store.ts` (131) | ⚠️ Provider-agnostic progress views (spec 016, "replaces the Devin panel"); factory store + subscribe/notify. |

### Key functions / components (🟢 confirmed)
| Function | Location | Role |
|----------|----------|------|
| `OrchestrationFeature` | orchestration/index.tsx:79 | snapshot subscriber + bucket renderer |
| `WorkflowComposerFeature` | workflow-composer/index.tsx:22 | hooks-graph editor page |
| `mapHooksToGraph` | workflow-composer/utils/mapper.ts:168 | hook → React Flow nodes/edges |
| `WorkflowGraph` | workflow-graph/workflow-graph.tsx:25 | ReactFlow + Background + Controls |
| `KanbanBoard` | kanban/kanban-board.tsx:13 | task → column grouping (unmounted) |
| `CloudAgentProgressView` / `DevinProgressView` | cloud-agents/…:34 / devin/…:34 | session monitoring (unmounted) |
| `createCloudAgentStore` / `devinStore` | cloud-agent-store.ts:83 / devin-store.ts:108 | two distinct store patterns |

### State machines
No FSM in the live surfaces. The orchestration view is a snapshot→bucket projection; the composer is React Flow change-event driven. The legacy stores project session status enums. See `flowcharts/webview-orchestration.md` for the snapshot loop, empty-state decision tree, hook-to-graph mapping, the unmounted-prototype map, and Kanban grouping.

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| Orchestration buckets: `active` / `waiting` / `completed` / `failed`; sessions arrive pre-bucketed from the host snapshot | orchestration/index.tsx:60,106 |
| Empty-state copy is a first-match decision tree over `degradedReasons` + provider availability | orchestration/index.tsx:112 |
| Composer derives `command = type.replace(/\//g,".")` and reads `type ?? command`, `payload ?? data` (dual-key, same as `webview-hooks-view`) | workflow-composer/index.tsx:31,42 |
| `mapHooksToGraph` layout: hook lane `y = hookIndex*150*3`; columns step `x += 300`; schedule node skipped when `immediate` | mapper.ts:131,139,99 |
| Composer is **not** auto-closed on submit; `hooks/sync` refreshes the graph | workflow-composer/index.tsx:87 |
| Kanban columns fixed to 6 `ExecutionState`s; card "mocks timestamps and agent ownership if not present" | kanban-board.tsx:23; kanban-card.tsx:13 |
| 🔴 GAP: `KanbanBoard` has **no importer** in `ui/src`/`src` — built but unmounted | (grep: no `components/kanban` consumers) |
| 🔴 GAP: panels request pages `"devin-progress"` / `"cloud-agent-progress"` **absent from `page-registry.tsx`** → "Unknown page" | devin-progress-panel.ts:74; cloud-agent-progress-panel.ts:77; page-registry.tsx:52 |
| Lineage: Devin progress (spec 001) → Cloud-Agent progress (spec 016, "replaces the Devin panel") → `orchestration` page (spec 018-era) | cloud-agent-progress-panel.ts:5 |

### Algorithms (🟢 confirmed)
- **Bucket grouping** — `Object.fromEntries(BUCKETS.map(b => [b.key, sessions.filter(s => s.bucket === b.key)]))`.
- **Degraded-mode empty-state** — ordered predicate cascade over `degradedReasons` substrings + provider counts.
- **Hook → graph mapping** — per-hook lane offset; source/condition/schedule/action node emission with `connectEdges` fan-in from previous node ids.
- **Kanban grouping** — `tasks.filter(t => t.execution?.state === column.state)` per fixed column.

### Dependencies
Internal (webview): `webview-shared` (`@/bridge/vscode`, `components/ui/button`, `components/workflow`), `webview-hooks-view` (reuses `Hook` types + `HookForm` in the composer). Crosses the bridge to the extension `orchestration`, `tasks`, `cloud-agents`, `devin` modules. ⚠️ **Compile-time** import: `kanban-board.tsx` imports `NormalizedTask`/`ExecutionState` from `src/features/tasks/task-model`. External: `@xyflow/react` (React Flow), `react`.

---

## Module: `webview-preview`

**Path:** `ui/src/features/preview/`, `ui/src/components/{preview,refine,forms}/`, `ui/src/lib/markdown/`, `ui/src/lib/document-title-utils.ts` · **LOC:** ~3,150 (~22 source files) · **Complexity:** 🟢 medium

### Purpose
The **document-preview** surface (page `"document-preview"`). Renders SpecKit / generic markdown documents into sectioned HTML, mounts interactive Mermaid diagrams into the static markup, and hosts three host round-trips: manual **refinement** (issue reporting), dependency-triggered **document update**, and embedded **interactive forms** with client-side validation. Also supports a raw "code" render mode and a table-of-contents outline.

### Primary files
| File | Role |
|------|------|
| `features/preview/preview-app.tsx` (556) | `PreviewApp` page: store subscription, section rendering, Mermaid mount loop, refine/update/form orchestration, global click delegation (task-group buttons, internal `.md` links). |
| `features/preview/stores/form-store.ts` (501) | `FormStore` singleton: field init, dirty tracking, validation engine, `prepareSubmission` guards, submit/discard/reset lifecycle. |
| `features/preview/stores/preview-store.ts` (43) | `PreviewStore`: `setDocument` / `markStale` observable (`useSyncExternalStore`). |
| `features/preview/api/{refine-bridge,form-bridge}.ts` (103/103) | Request/response bridges with `requestId` correlation, lazy single listener, 10 s timeout. |
| `features/preview/types.ts` (110) | `DocumentArtifact`/`PreviewDocumentPayload`, `PreviewFormField`, refinement/form payloads, dual message unions. |
| `lib/markdown/preview-renderer.ts` (71) | Cached `markdown-it` (html/linkify/typographer + highlight.js) + 3 custom plugins. |
| `lib/markdown/plugins/{task-group,mermaid,checkbox}-plugin.ts` (93/36/…) | Custom markdown-it plugins (Execute-Group buttons, diagram fences, task-list checkboxes). |
| `components/preview/{mermaid-viewer,code-preview,document-outline}.tsx` (640) | Sanitized Mermaid render, code highlighter, TOC overlay. |
| `components/refine/{refine-dialog,update-document-button}.tsx` (358) | Issue-report modal (≥20-char validation) + dependency-update banner. |
| `components/forms/preview-form-*.tsx` (940) | Field/actions/container for interactive forms. |

### Key functions / components (🟢 confirmed)
| Function | Location | Role |
|----------|----------|------|
| `PreviewApp` | preview-app.tsx:91 | preview page orchestrator |
| `submitRefinement` | refine-bridge.ts:79 | refine/update round-trip (requestId + 10 s) |
| `submitForm` | form-bridge.ts:76 | form submit round-trip (rejects on 0 dirty) |
| `FormStore.validateField` / `prepareSubmission` / `validateAll` | form-store.ts:174 / 345 / 293 | validation engine + submit gate |
| `createPreviewRenderer` / `renderPreviewMarkdown` | preview-renderer.ts:39 / 58 | markdown pipeline |
| `taskGroupPlugin` | task-group-plugin.ts:81 | `Phase N:` h2 → Execute-Group button |
| `RefineDialog` | refine-dialog.tsx:32 | issue-report modal |
| `PreviewFormContainer` | preview-form-container.tsx:49 | form init + type-routed field render |

### State machines
Form lifecycle FSM in `form-store.ts`: `empty → initialized → dirty ⇄ submitting → submitted` (with `reset` back to `empty`); read-only mode blocks transitions. See `flowcharts/webview-preview.md`.

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| Mermaid mounts as React components into `.mermaid:not([data-processed])` after a 100 ms delay; id = `mermaid-<djb2hash>-<i>` | preview-app.tsx:162,178 |
| Refine + form bridges correlate by `requestId` (`crypto.randomUUID` fallback) with a 10 s timeout | refine-bridge.ts:84,87; form-bridge.ts:85,88 |
| `submitForm` rejects immediately when no fields changed | form-bridge.ts:79 |
| Field validation: required, dropdown/multiselect option membership, custom `minLength`/`maxLength`/`pattern` | form-store.ts:177,197,228 |
| `prepareSubmission` requires documentId+sessionId, non-read-only, `validateAll` pass, ≥1 dirty field | form-store.ts:355 |
| Read-only mode (`permissions.canEditForms === false`) blocks `updateField` + submission | form-store.ts:133; preview-app.tsx:519 |
| `RefineDialog`: issueType required + description ≥ 20 chars | refine-dialog.tsx:30,66 |
| Internal `.md` links intercepted → `preview/open-file`; `Phase N:` task-group buttons → `preview/execute-task-group` | preview-app.tsx:79,63 |
| Mermaid plugin emits **raw** (unescaped) fence content so `-->` arrows survive; sanitized later in `MermaidViewer` | mermaid-plugin.ts:23 |

### Algorithms (🟢 confirmed)
- **Mermaid diagram mount** — djb2-style hash (`(h<<5)-h+char`) for stable ids; per-diagram `createRoot` into emptied `.mermaid` nodes; cleanup unmounts roots.
- **Validation engine** — per-field rule cascade aggregated into `validationErrors`; `validateAll` recomputes all fields before submit.
- **Request/response correlation** — `pending: Map<requestId, {resolve,reject,timer}>`; single lazy `window` listener; timeout rejects + deletes.
- **Markdown rendering** — cached singleton `MarkdownIt`; core ruler scans tokens for `Phase N:` h2 headings to inject buttons; fence override for mermaid/plantuml.

### Dependencies
Internal (webview): `webview-shared` (`@/bridge/vscode`, `components/ui/button`, `lib/utils`, `lib/document-title-utils`). Crosses the bridge to the extension `documents`/preview module (`src/panels/document-preview-panel.ts`). External: `markdown-it`, `highlight.js`, `mermaid`, `lucide-react`, `react`. 🟡 INFERRED: `preview-form-container.tsx` self-documents as an "example / reference implementation" yet is the production form host used by `PreviewApp`.

---

## Module: `webview-welcome`

**Path:** `ui/src/features/welcome/` · **LOC:** ~3,616 (10 source files incl. CSS) · **Complexity:** 🟢 medium

### Purpose
The onboarding **Welcome Screen** (page `"welcome-screen"`). Five tabbed sections — Setup (dependency detection + install actions), Features (quick-action command cards), Configuration (editable settings), Status (versions / diagnostics), Learn (resource links + search). Detects the IDE host and computes a host-specific dependency requirement profile. The **only webview module that uses Zustand**.

### Primary files
| File | Role |
|------|------|
| `welcome-screen.tsx` (454) | `WelcomeScreen` page + exported `ErrorBoundary` class; `welcome/ready` handshake, message routing, section nav, loading-timeout UI. |
| `types.ts` (278) | Full state model: `IdeHost` (8), `DependencyStatus`, `ConfigurationState`, `SystemDiagnostic`, `LearningResource`, `FeatureAction`, message + props types. |
| `stores/welcome-store.ts` (174) | Zustand `create<WelcomeStore>`: default config, `updateConfig` (by key), diagnostics capped at 5, view/preference state. |
| `requirements.ts` (122) | `computeRequirementProfile`: host-aware required/optional/hidden deps + missing-list with install-order sort. |
| `components/{setup,features,config,status,learning}-section.tsx` | The five tab panels (props defined in `types.ts`). |

### Key functions / components (🟢 confirmed)
| Function | Location | Role |
|----------|----------|------|
| `WelcomeScreen` | welcome-screen.tsx:70 | page + message bridge |
| `ErrorBoundary` | welcome-screen.tsx:29 | class boundary (used by page-registry) |
| `useWelcomeStore` | stores/welcome-store.ts:75 | Zustand store hook |
| `computeRequirementProfile` | requirements.ts:89 | host-aware dependency profile |
| `isAcpHost` / `getRequired` / `getHidden` | requirements.ts:22 / 48 / 67 | host-class branching |

### State machines
Store lifecycle: `uninitialized → loading → ready | errored` (`initialize` → `setState`/`setError`); `reset` returns to `uninitialized`. See `flowcharts/webview-welcome.md`.

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| Single-init guarded by `initializedRef` (StrictMode-safe); `welcome/ready` sent once | welcome-screen.tsx:98,117 |
| Diagnostics list keeps newest 5 (`[new, ...old].slice(0,5)`) | welcome-store.ts:135; welcome-screen.tsx:153 |
| `dontShowOnStartup` is inverted for the UI ("show on startup") | welcome-screen.tsx:131,274 |
| Loading "taking longer" hint after 2 s | welcome-screen.tsx:88 |
| Host-specific required deps: windsurf→`devin-cli`, antigravity→`gemini-cli`, else→`copilot-chat`+`copilot-cli` (all + speckit/openspec/gatomia-cli) | requirements.ts:48 |
| ACP hosts (windsurf/antigravity) hide `copilot-chat`; copilot hosts hide `devin-cli`+`gemini-cli` | requirements.ts:67 |
| `specSystemReady = speckit.installed OR openspec.installed`; if not ready, `speckit` added to missing | requirements.ts:97,109 |
| `missing` sorted by `INSTALL_ORDER` weight (copilot-chat 0 → CLIs 1 → spec systems 2 → gatomia-cli 3) | requirements.ts:77,113 |

### Algorithms (🟢 confirmed)
- **Requirement profile** — host classification → required/optional/hidden lists → missing computation (excluding spec systems, then conditionally adding `speckit`) → install-order sort.
- **Config update** — linear scan of `ConfigurationState` items matching by `key`, immutable replace.
- **Message routing** — `switch(message.type)` over `welcome/*` events with store + local-state effects.

### Dependencies
Internal (webview): `webview-shared` (`@/bridge/vscode`, `utils/relative-time` in status-section). Crosses the bridge to the extension welcome/steering services. External: `zustand`, `react`, `@vscode/codicons`. ⚠️ **Mirror coupling**: `requirements.ts` is a hand-maintained duplicate of `src/services/welcome/requirements.ts` (Vite bundle can't import the esbuild bundle); a parity test guards drift. 🟡 INFERRED: hardcoded fallback versions (`0.25.6` / `1.84.0`) in `welcome-screen.tsx` are placeholders "set from extension".

---

## Module: `webview-shared`

**Path:** `ui/src/index.tsx`, `ui/src/page-registry.tsx`, `ui/src/bridge/vscode.ts`, `ui/src/components/ui/`, `ui/src/components/{icon-button,pill-button,textarea-panel}.tsx`, `ui/src/lib/utils.ts`, `ui/src/utils/relative-time.ts`, `ui/src/env.d.ts` · **LOC:** ~450 (12 source files) · **Complexity:** 🟢 low

### Purpose
Cross-cutting webview infrastructure consumed by every other webview module: the single-bundle entry point, the runtime `data-page` → component router, the VS Code `postMessage` bridge (with a dev fallback), VS Code-themed primitives (`Button`, `VSCodeSelect`, `VSCodeCheckbox`, icon/pill buttons, auto-grow textarea), and shared utilities (`cn` class merge, `formatRelativeTime`).

### Primary files
| File | Role |
|------|------|
| `page-registry.tsx` (113) | `SupportedPage` union (11 pages) + lazy/code-split renderers; `getPageRenderer` returns `undefined` for unknown pages. |
| `bridge/vscode.ts` (47) | `acquireVsCodeApi()` once, with a dev echo fallback (`openspec.chat/echoResult` after 50 ms). |
| `index.tsx` (18) | `createRoot`; reads `container.dataset.page` (default `simple`); renders renderer or "Unknown page". |
| `components/ui/{button,vscode-select,vscode-checkbox}.tsx` (58/137/136) | CVA button variants + themed select/checkbox (label/required/error/indeterminate). |
| `components/{icon-button,pill-button,textarea-panel}.tsx` (39/40/103) | Circular icon button, pill toolbar button, auto-resizing textarea panel. |
| `lib/utils.ts` (6) | `cn = twMerge(clsx(...))`. |
| `utils/relative-time.ts` (37) | `formatRelativeTime` (just now / Nm / Nh / Nd / N wk ago). |

### Key functions / components (🟢 confirmed)
| Function | Location | Role |
|----------|----------|------|
| `getPageRenderer` | page-registry.tsx:107 | runtime page → lazy component |
| `vscode` (resolved api) | bridge/vscode.ts:47 | shared host channel |
| `Button` (+ `buttonVariants`) | ui/button.tsx:37 | CVA-driven themed button |
| `VSCodeSelect` / `VSCodeCheckbox` | ui/vscode-select.tsx:35 / ui/vscode-checkbox.tsx:28 | themed form controls |
| `TextareaPanel` | textarea-panel.tsx:26 | auto-grow textarea (scrollHeight in `useLayoutEffect`) |
| `cn` / `formatRelativeTime` | lib/utils.ts:4 / utils/relative-time.ts:12 | shared utilities |

### State machines
None — stateless infrastructure and presentational primitives.

### Business rules (🟢 confirmed)
| Rule | Location |
|------|----------|
| Single Vite bundle; active page chosen at runtime from `#root[data-page]` (default `simple`) | index.tsx:10; vite.config.ts:6 |
| Unknown `data-page` renders a visible "Unknown page" message (no throw) | index.tsx:16; page-registry.tsx:108 |
| Bridge resolves once at import; outside VS Code it falls back to a dev echo (`getState→{}`, `setState→no-op`) | bridge/vscode.ts:18 |
| `cn` merges Tailwind classes via `twMerge(clsx())` | lib/utils.ts:4 |
| `formatRelativeTime` thresholds: <60 s `just now`; <60 m `Nm`; <24 h `Nh`; <7 d `Nd`; else `N wk` | relative-time.ts:16 |

### Algorithms (🟢 confirmed)
- **Runtime page routing** — `pageName in pageRenderers` guard → `withSuspense(lazy import)`; enables per-page code splitting.
- **Bridge resolution** — feature-detect `window.acquireVsCodeApi`; otherwise install a self-echoing dev stub.
- **Auto-grow textarea** — `useLayoutEffect` resets height to `auto` then to `scrollHeight` on each value change.
- **Relative-time bucketing** — cascade of unit thresholds returning compact labels.

### Dependencies
Internal: none (this is the leaf shared layer). Consumed by **all** other webview modules. External: `react` / `react-dom`, `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@vscode/codicons`. 🟡 INFERRED: `bridge/vscode.ts` is the *intended* shared channel, but `webview-spec-explorer` deliberately acquires its own `acquireVsCodeApi()` instance (`window.specExplorerVscode`) — a known inconsistency.
