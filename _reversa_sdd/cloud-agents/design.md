# cloud-agents (module), Design Técnico

> Module-level `design.md`. Source: `src/features/cloud-agents/`. Confidence: 🟢 unless noted.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `CloudAgentProvider.createSession` | `(task, context: SessionContext)` | `Promise<AgentSession>` | `cloud-agent-provider.ts:85` |
| `CloudAgentProvider.pollSessions` | `(sessions)` | `Promise<SessionUpdate[]>` | `:103` |
| `CloudAgentProvider.cancelSession` | `(session)` | `Promise<void>` | interface |
| `CloudAgentProvider.getExternalUrl` | `(session)` | `string \| undefined` | interface |
| `CloudAgentProvider.handleBlockedSession` | `(session)` | `ProviderAction \| null` | `:128` |
| `AgentPollingService.pollOnce` | `(force?: boolean)` | `Promise<void>` | `:154` |
| `AgentSessionStorage.getActive` / `normalizeSession` | persistence + repair | sessions | `:88/248` |
| `ProviderRegistry.setActive` / `restoreActive` | registry | provider | `:83/107` |
| `MigrationService.migrateIfNeeded` | `()` | `Promise<void>` | `:65` |
| `SessionCleanupService.cleanup` | `()` | `Promise<number>` | `:40` |

## Tipos de domínio (catálogo)

| Tipo | Local | Forma |
|------|-------|-------|
| `AgentSession` | `types.ts:91` | `localId`, `providerId`, `providerSessionId?`, `status`, `branch`, `specPath`, `tasks[]`, `pullRequests[]`, `isReadOnly`, `chatPanelId?`, timestamps |
| `AgentTask` | `types.ts:138` | `id`, `specTaskId`, `title`, `priority`, `status`, `startedAt?`, `completedAt?` |
| `PullRequest` | `types.ts:166` | `url`, `state?` (`open\|merged\|closed`), `branch`, `createdAt` |
| `SessionStatus` | `types.ts:19` | `PENDING\|RUNNING\|BLOCKED\|COMPLETED\|FAILED\|CANCELLED` (last 3 terminal) |
| `TaskStatus` | `types.ts:37` | `PENDING\|IN_PROGRESS\|COMPLETED\|FAILED\|SKIPPED` |
| `SessionUpdate` | `types.ts:232` | `localId`, `status?`, `tasks?`, `pullRequests?`, `externalUrl?`, `errorMessage?`, `timestamp` |
| `SessionContext` | `types.ts:206` | `branch`, `specPath`, `workspaceUri`, `repoUrl?`, `featurePath?`, `isFullFeature?`, `taskIds?` |
| `ProviderMetadata` | `types.ts:70` | `id` (kebab), `displayName`, `description`, `icon` |
| `ErrorCode` | `types.ts:271` | 10 codes (credentials/session/api/network/timeout) |
| `ProviderAction` | `types.ts:258` | `{openUrl,url} \| {notify,message} \| {none}` |

## Fluxo Principal (visão de módulo)

1. A dispatch resolves the active provider from the registry; if none → error. 🟢
2. Credentials are checked; missing → prompt; unsaved → error. 🟢
3. `provider.createSession` builds the provider-specific request (Devin referential prompt / GitHub issue) and maps the response to an `AgentSession{status:PENDING}`, persisted via storage. 🟢
4. The polling service periodically polls active + grace sessions, applies `SessionUpdate`s, normalizes terminal state, and fires `onSessionUpdated`/`onSessionCompleted`. 🟢
5. Cleanup deletes sessions past the 7-day window. 🟢

> Detailed flows in `create-session/`, `polling-and-normalization/`, `session-retention-cleanup/`. Provider wire contracts in `contracts.md`.

## State machines (3)

See `flowcharts/cloud-agents.md` §4:
- **Cloud session** — `PENDING → RUNNING ⇄ BLOCKED → COMPLETED/FAILED/CANCELLED`.
- **Cloud task** — `PENDING → IN_PROGRESS → COMPLETED/FAILED/SKIPPED`.
- **PR state** — `unknown → open → merged/closed`.

## Dependências

- `devin` — credentials manager, API client/factory, status-mapper (reused by `DevinAdapter`). 🟢 ⚠️ ownership overlap (see `questions.md`).
- `agent-chat` — consumes `onSessionUpdated` (spec 018 bridge). 🟢
- `providers`, `services`. 🟢
- External: `vscode` (`SecretStorage`, `Memento`, `EventEmitter`), Devin REST, GitHub GraphQL, `fetch`, `node:crypto`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Single `CloudAgentProvider` interface with per-provider adapters | `cloud-agent-provider.ts`; `adapters/*` | 🟢 (ADR-0007) |
| Normalized session/task/PR model independent of provider wire shapes | `types.ts`; `normalizeSession` | 🟢 |
| Persisted in `workspaceState` with load-time validation/normalization | `agent-session-storage.ts:248` | 🟢 |
| Grace-window polling to catch late PR merges after terminal | `agent-polling-service.ts:51` | 🟢 |

## Estado Interno

`workspaceState` holds the session list; `SecretStorage` holds credentials; the registry holds the active provider id. Polling tracks `consecutiveFailures` and the interval handle. 🟢

## Observabilidade

`logging.ts` provides module logging; poll errors fire `onError`; credential expiry fires `onCredentialExpiry`. 🟢

## Riscos e Lacunas

- 🔴 **Devin ownership overlap** — both `DevinAdapter` here and the standalone `devin` module implement Devin session lifecycle + polling and are both wired in `extension.ts`. See `questions.md`.
- 🟡 Exact grace-window constants vs the `devin` module's `GRACE_CYCLES_AFTER_TERMINAL=6` are tracked separately.
