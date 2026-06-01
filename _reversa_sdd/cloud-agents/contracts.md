# cloud-agents — External Contracts

> Optional artifact (`doc_level=completo`). The provider abstraction contract + the two concrete provider wire APIs this module consumes.
> Source: `cloud-agent-provider.ts`, `adapters/*`. Confidence: 🟢 unless noted.

## 1. `CloudAgentProvider` interface (internal contract)

> Every cloud provider adapter implements this. `cloud-agent-provider.ts`. 🟢

| Method | Signature | Purpose |
|--------|-----------|---------|
| `metadata` | `ProviderMetadata` (`id`, `displayName`, `description`, `icon`) | Registry display |
| `hasCredentials` | `() => Promise<boolean>` | Credential gate |
| `createSession` | `(task, context: SessionContext) => Promise<AgentSession>` | Start a remote run (`:85`) |
| `pollSessions` | `(sessions: AgentSession[]) => Promise<SessionUpdate[]>` | Batch status poll (`:103`) |
| `cancelSession` | `(session) => Promise<void>` | Cancel (semantics provider-specific) |
| `getExternalUrl` | `(session) => string \| undefined` | Link to the remote run |
| `handleBlockedSession` | `(session) => ProviderAction \| null` | Resolve a `BLOCKED` session (`:128`) |

`ProviderAction` = `{type:'openUrl',url} | {type:'notify',message} | {type:'none'}`. 🟢 `types.ts:258`

## 2. Devin provider (REST) — consumed

> `adapters/devin-adapter.ts`. The detailed Devin REST contract (versions v1/v2/v3, auth, rate limits) is owned by the `devin` module — see that module's `contracts.md`. 🔴 ownership overlap (see `questions.md`).

| Operation | Wire | Mapping |
|-----------|------|---------|
| createSession | `POST` create session with a **referential prompt** built from spec artifacts | response → `AgentSession`, `providerSessionId = devin session id` (`:280`) |
| pollSessions | `GET` session by id (per session) | `mapDevinToCloudStatus(devinStatus) → SessionStatus` (`:157`); PR extraction from response (`:354`) |

Status mapping (`mapDevinToCloudStatus`, `devin-adapter.ts:157`) translates Devin status strings → `SessionStatus` (`PENDING/RUNNING/BLOCKED/COMPLETED/FAILED/CANCELLED`). 🟢

## 3. GitHub Copilot coding agent (GraphQL + REST) — consumed

> `adapters/github-copilot-adapter.ts`. 🟢

| Operation | Wire | Mapping |
|-----------|------|---------|
| createSession | GraphQL: resolve repo id → create issue with `agentAssignment` | `providerSessionId = owner/repo#number` (`:161`) |
| pollSessions | GraphQL issue + PR timeline | `mapIssueToUpdate(...) → SessionUpdate` (`:372`) |

Status derives from issue state + PR-timeline events. 🟢

## 4. Normalized output (provider-agnostic)

Both adapters produce/consume the canonical model:

- `AgentSession` (`types.ts:91`) — `status`, `tasks: AgentTask[]`, `pullRequests: PullRequest[]`, `isReadOnly`, `chatPanelId?`.
- `SessionUpdate` (`types.ts:232`) — partial delta applied by the polling service.
- `PullRequest` (`types.ts:166`) — reconciled by URL, `state ∈ {open, merged, closed}` (undefined inferred on terminal).

## 5. Errors

`ErrorCode` (`types.ts:271`): `CREDENTIALS_MISSING | CREDENTIALS_INVALID | SESSION_NOT_FOUND | SESSION_CREATION_FAILED | SESSION_CANCEL_FAILED | API_UNAVAILABLE | API_RATE_LIMITED | API_ERROR | NETWORK_ERROR | TIMEOUT`. 🟢
