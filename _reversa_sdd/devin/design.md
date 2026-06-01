# devin (module), Design Técnico

> Module-level `design.md`. Source: `src/features/devin/`. Confidence: 🟢 unless noted.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `createDevinApiClient` | `(opts: CreateClientOptions)` | `DevinApiClientInterface` | factory — `devin-api-client-factory.ts:38` |
| `detectApiVersion` | `(token)` | `ApiVersion` | token prefix — `api-version-detector.ts:24` |
| `devinApiRequest` | `<T>(url, init, token, label)` | `Promise<T>` | shared fetch + HTTP error map — `devin-api-http.ts:31` |
| `resolveSessionStatus` | `(apiStatus, statusDetail?)` | `SessionStatus` | statusDetail wins — `status-mapper.ts:60` |
| `DevinSessionManager.startTask` / `startTaskGroup` | `(params)` | `Promise<DevinSession>` | `:159/220` |
| `DevinSessionManager.cancelSession` | `(localId)` | `Promise<DevinSession>` | local-only — `:283` |
| `DevinPollingService.pollOnce` / `pollSession` | poll loop | `Promise<void>` | `:234/305` |
| `withRetry` | `<T>(op, options?)` | `Promise<T>` | backoff — `retry-handler.ts:51` |
| `RateLimiter.acquire` | `()` | `void` (throws if exceeded) | `rate-limiter.ts:77` |
| `validateGitState` / `commitAndPush` | git pre-flight | void | `git-validator.ts:44` / `git-operations.ts:38` |
| `markTaskAsCompleted` | `(content, specTaskId)` | `string` | `spec-status-updater.ts:140` |

## Tipos de domínio (catálogo)

| Tipo | Local | Forma |
|------|-------|-------|
| `DevinSession` | `entities.ts:31` | `sessionId`, `localId`, `status`, `branch`, `specPath`, `tasks[]`, `pullRequests[]`, `apiVersion`, `orgId?`, `retryCount`, timestamps (all `readonly`) |
| `DevinTask` | `entities.ts:73` | `taskId`, `specTaskId`, `title`, `acceptanceCriteria?`, `priority` (P1/P2/P3), `status`, `artifacts?` |
| `DevinCredentials` | `entities.ts:108` | `apiKey`, `apiVersion`, `orgId?`, `isValid` (key + metadata stored separately) |
| `PullRequest` | `entities.ts:158` | `prUrl`, `prState?` (`open\|closed\|merged`), `branch`, `mergedAt?` |
| `ApiVersion` | `types.ts:19` | `v1\|v2\|v3` |
| `DevinApiStatus` | `types.ts:34` | raw API: `new\|claimed\|running\|exit\|error\|suspended\|resuming` |
| `DevinStatusDetail` | `types.ts:50` | `working\|waiting_for_user\|finished\|blocked\|(string)` |
| `SessionStatus` | `types.ts:65` | mapped: `queued\|initializing\|running\|blocked\|completed\|failed\|cancelled` (last 3 terminal) |
| `TaskStatus` | `types.ts:84` | `pending\|queued\|in-progress\|completed\|failed\|cancelled` |
| `DevinErrorCode` + classes | `errors.ts:17,54` | `DevinError` base + 11 subclasses |

## Fluxo Principal (visão de módulo)

1. Resolve credentials → detect version → build the right client (v3 requires orgId). 🟢
2. Pre-flight git, commit+push, build prompt, `createSession`, persist `INITIALIZING`, start polling. 🟢 (→ `initiate-task/`)
3. The poller resolves status (statusDetail wins), syncs task statuses, detects PR-state changes, emits events; grace window catches late PR merges. 🟢 (→ `polling-cycle/`)
4. A PR merge marks the corresponding `tasks.md` checkbox. 🟢 (→ `pr-state-task-sync/`)
5. Every API call is wrapped by `withRetry` + `RateLimiter.acquire`. 🟢 (→ `contracts.md`)

## State machines (2 + PR)

See `flowcharts/devin.md` §3–§4:
- **Session status** — `queued/initializing → running ⇄ blocked → completed/failed/cancelled` (terminal at `status-mapper.ts:77`).
- **Task status** — `pending/queued → in-progress → completed/failed/cancelled` (synced from session; terminal tasks frozen).
- **PR state** — `open → merged/closed` (detected during polling).

## Infraestrutura compartilhada (shared concerns)

| Concern | Detail | Source |
|---------|--------|--------|
| Versioning | token prefix → `v1`/`v3` client; v3 org-scoped | `api-version-detector.ts`; `devin-api-client-v3.ts` |
| HTTP | shared `devinApiRequest`; status→error mapping | `devin-api-http.ts:54-81` |
| Retry | 3 attempts, exp backoff + jitter, `Retry-After` | `retry-handler.ts:133-148` |
| Rate limit | ≥500 ms, ≤60/min sliding window | `rate-limiter.ts:15,20,44` |
| Credentials | key + metadata in separate `SecretStorage` keys | `devin-credentials-manager.ts:66` |
| Git | clean-repo pre-flight; commit+push | `git-validator.ts`; `git-operations.ts` |
| Persistence | `workspaceState` JSON + in-memory cache + 7-day retention | `devin-session-storage.ts:151` |
| Network recovery | 5-failure threshold | `network-recovery.ts:23` |
| Session timeout | idle >4 h warning | `session-timeout-handler.ts:18` |

## Dependências

- Consumed by `cloud-agents` (`devin-adapter`), `commands` (`devin-commands`, `cloud-agent-commands`), `panels` (`devin-progress-panel`), `providers` (`devin-progress-provider`); wired in `extension.ts`. 🟢
- External: `vscode` (`SecretStorage`, `Memento`, `workspace.fs`, `env`), `node:child_process` (git), `node:crypto`, `fetch`, Devin REST `https://api.devin.ai`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Token-prefix versioning (no separate config flag) | `api-version-detector.ts:31` | 🟢 (ADR-0008) |
| Two-layer status resolution (statusDetail over status) | `status-mapper.ts:48` | 🟢 |
| Local-only cancel (API has no cancel endpoint) | `devin-session-manager.ts:276` | 🟢 |
| Grace cycles after terminal to catch late PR merges | `devin-polling-service.ts:70` | 🟢 |

## Estado Interno

`workspaceState` session list (`gatomia.devin.sessions`) + in-memory cache; `SecretStorage` credentials; poller tracks `graceCyclesRemaining`, interval handle, consecutive failures. 🟢

## Observabilidade

`DevinProgressEvent` stream (in-memory); status/blocked/PR-state/cycle event emitters; telemetry prefix in `config.ts`. 🟢

## Riscos e Lacunas

- 🔴 Ownership overlap with `cloud-agents` for the same Devin sessions (see `questions.md`).
- 🟡 PR review actions all "open the browser" today (`pr-review-integration.ts:35,106`) — approve/merge are not wired to the API.
