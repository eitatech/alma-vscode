# Data Dictionary — gatomia

> Consolidated data dictionary produced by the Reversa Archaeologist (escavação phase).
> Confidence: 🟢 CONFIRMED unless noted. The system has **no relational database**; these are in-memory / `workspaceState` / JSON-persisted structures.

## Progress
Modules covered: **18 / 22** — `agent-chat`, `agents`, `cloud-agents`, `devin`, `hooks`, `orchestration`, `spec`, `steering`, `tasks`, `providers`, `services`, `webview-agent-chat`, `webview-spec-explorer`, `webview-hooks-view`, `webview-orchestration`, `webview-preview`, `webview-welcome`, `webview-shared`.
> Not listed (`panels`, `commands`, `utils`, `prompts`): extension modules with no distinct data entities of their own — their structures are documented inline in `code-analysis.md`.

---

## Module: `agent-chat`

### `AgentChatSession` 🟢 — `types.ts:380`
The root session aggregate (persisted in the manifest as a `SessionManifestEntry`; full object held in memory).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string (UUIDv4) | yes | Stable session identity |
| `source` | `'acp' \| 'cloud'` | yes | Local ACP agent vs cloud agent |
| `agentId` | string | yes | Provider/agent id |
| `agentDisplayName` | string | yes | Human-readable name |
| `capabilities` | `ResolvedCapabilities` | yes | Negotiated modes/models |
| `selectedModeId` / `selectedModelId` | string | no | Current selections |
| `currentModelId` | string | no | Effective model |
| `executionTarget` | `ExecutionTarget` | yes | local / worktree / cloud |
| `lifecycleState` | `SessionLifecycleState` | yes | FSM state |
| `trigger` | `SessionTrigger` | yes | How the session began |
| `worktree` | `WorktreeHandle \| null` | yes | Set when target = worktree |
| `cloud` | `CloudLinkage \| null` | yes | Set when source = cloud |
| `createdAt` / `updatedAt` | number (epoch ms) | yes | Timestamps |
| `endedAt` | number | no | Set on terminal state |
| `workspaceUri` | string | yes | Owning workspace |

### `SessionLifecycleState` (enum) 🟢 — `types.ts:18`
`'initializing' | 'running' | 'waiting-for-input' | 'completed' | 'failed' | 'cancelled' | 'ended-by-shutdown'`. `TERMINAL_STATES` (`types.ts:33`) = `{completed, failed, cancelled, ended-by-shutdown}` (absorbing).

### `ChatMessage` (discriminated union by `role`) 🟢 — `types.ts:367`
Variants: `UserChatMessage` (`user`), `AgentChatMessage` (`agent`), `ThoughtChatMessage` (`thought`), `PlanChatMessage` (`plan`), `SystemChatMessage` (`system`), `ToolCallChatMessage` (`tool`), `ErrorChatMessage` (`error`). Common fields: `id`, `sessionId`, `timestamp`, `sequence`.

#### `UserChatMessage` 🟢 — `types.ts:235`
| Field | Type | Required |
|-------|------|----------|
| `role` | `'user'` | yes |
| `content` | string | yes |
| `isInitialPrompt` | boolean | yes |
| `deliveryStatus` | `'pending' \| 'queued' \| 'delivered' \| 'rejected'` | yes |
| `rejectionReason` | string | no |

#### `AgentChatMessage` / `ThoughtChatMessage` 🟢 — `types.ts:245` / `:266`
| Field | Type | Required |
|-------|------|----------|
| `role` | `'agent'` / `'thought'` | yes |
| `content` | string | yes |
| `turnId` | string | yes |
| `isTurnComplete` | boolean | yes |
| `stopReason` | string | no (agent only) |

#### `ToolCallChatMessage` 🟢 — `types.ts:331`
| Field | Type | Required |
|-------|------|----------|
| `role` | `'tool'` | yes |
| `toolCallId` | string | yes |
| `title` | string | no |
| `status` | `'pending' \| 'running' \| 'succeeded' \| 'failed' \| 'cancelled'` | yes |
| `toolKind` | string | no |
| `affectedFiles` | `ToolCallAffectedFile[]` | no |

#### `ErrorChatMessage` 🟢 — `types.ts:360`
| Field | Type | Required |
|-------|------|----------|
| `role` | `'error'` | yes |
| `content` | string | yes |
| `category` | `ErrorChatMessageCategory` | yes |
| `retryable` | boolean | yes |

### `WorktreeHandle` 🟢 — `types.ts:151`
| Field | Type | Required |
|-------|------|----------|
| `id` | string (UUIDv4) | yes |
| `absolutePath` | string | yes |
| `branchName` | string | yes |
| `baseCommitSha` | string | yes |
| `status` | `'created' \| 'in-use' \| 'abandoned' \| 'cleaned'` | yes |
| `createdAt` | number | yes |
| `cleanedAt` | number | no |

### `ExecutionTarget` (discriminated union) 🟢 — `types.ts:140`
`{ kind: 'local' } | { kind: 'worktree'; worktreeId: string } | { kind: 'cloud'; providerId: string; cloudSessionId: string }`.

### `PendingWrite` 🟢 — `pending-writes-store.ts:57`
| Field | Type | Required |
|-------|------|----------|
| `id` | string | yes |
| `path` | string | yes |
| `proposedContent` | string | yes |
| `oldText` | `string \| null` | yes |
| `linesAdded` / `linesRemoved` | number | no |
| `languageId` | string | no |
| `createdAt` | number | yes |

### `SessionManifestEntry` / `SessionManifest` 🟢 — `types.ts:563` / `:581`
Manifest is the persisted index (`schemaVersion: 1`, `sessions: SessionManifestEntry[]`, `updatedAt`). Each entry carries `id`, `source`, `agentId`, `lifecycleState`, `executionTargetKind`, `createdAt/updatedAt/endedAt`, `transcriptArchived`, optional `worktreePath`, `cloudSessionLocalId`.

### `ResolvedCapabilities` 🟢 — `types.ts:117`
`{ source: 'agent' | 'catalog' | 'none'; modes: ModeDescriptor[]; models: ModelDescriptor[]; thinkingLevels?; agentRoles?; acceptsFollowUp: boolean }`.

---

## Module: `agents`

> All structures from `src/features/agents/`. Parsed from `.agent.md` files (YAML frontmatter + markdown body).

### `AgentDefinition` 🟢 — `types.ts:14`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string (kebab-case) | yes | `/^[a-z0-9-]+$/` |
| `name` | string | yes | Short name |
| `fullName` | string | yes | Display name |
| `description` | string | yes | |
| `icon` | string | no | Icon path |
| `commands` | `AgentCommand[]` | yes | ≥1; `/help` auto-injected |
| `resources` | `AgentResourceRefs` | yes | prompts/skills/instructions refs |
| `filePath` | string | yes | Source `.agent.md` path |
| `content` | string | yes | Markdown body |

### `AgentCommand` 🟢 — `types.ts:46`
| Field | Type | Required |
|-------|------|----------|
| `name` | string | yes |
| `description` | string | yes |
| `tool` | string | yes (tool registry key) |
| `parameters` | `string \| Record<string,unknown>[]` | no |

### `AgentResourceRefs` 🟢 — `types.ts:63`
`{ prompts?: string[]; skills?: string[]; instructions?: string[] }`.

### `AgentResources` 🟢 — `types.ts:135`
`{ prompts: Map<string,string>; skills: Map<string,string>; instructions: Map<string,string> }` (resolved content, from `ResourceCache`).

### `ToolExecutionContext` 🟢 — `types.ts:101`
| Field | Type | Required |
|-------|------|----------|
| `agent` | `AgentDefinition` | yes |
| `workspace` | `{ uri, name, folders }` | yes |
| `vscode` | `{ window, workspace, commands }` | yes |
| `chatContext` | `vscode.ChatContext` | yes |
| `outputChannel` | `vscode.OutputChannel` | yes |
| `telemetry` | `TelemetryReporter` | yes |

### `ToolResponse` 🟢 — `types.ts:149`
`{ content: string; files?: FileReference[]; metadata?: ResponseMetadata }`.

### `FormattedError` 🟢 — `error-formatter.ts:26`
`{ userMessage: string; technicalDetails: string; category: ErrorCategory; actionableGuidance?: string; code?: string }`.

### `ErrorCategory` (enum) 🟢 — `error-formatter.ts:12`
`VALIDATION | RESOURCE | EXECUTION | CANCELLATION | TIMEOUT | UNKNOWN`.

### Error classes 🟢 — `types.ts:255`
`AgentError { code? }`, `ToolExecutionError { tool, cause? }`, `ResourceError { resourceType: 'prompt'|'skill'|'instruction', resourceName }`.

### `ValidationResult` 🟢 — `types.ts:244`
`{ valid: boolean; errors: string[] }`.

---

## Module: `cloud-agents`

> Structures from `src/features/cloud-agents/`. Persisted in `workspaceState`; credentials in `SecretStorage`.

### `AgentSession` 🟢 — `types.ts:91`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `localId` | string (UUIDv4) | yes | Local identity |
| `providerId` | string | yes | e.g. `devin`, `github-copilot` |
| `providerSessionId` | string | no | Provider external id (Devin id / `owner/repo#number`) |
| `status` | `SessionStatus` | yes | FSM state |
| `branch` | string | yes | |
| `specPath` | string | yes | |
| `tasks` | `AgentTask[]` | yes | |
| `pullRequests` | `PullRequest[]` | yes | |
| `createdAt` / `updatedAt` | number (ms) | yes | |
| `completedAt` | number | no | Set on terminal |
| `isReadOnly` | boolean | yes | True when provider inactive |
| `externalUrl` / `errorMessage` | string | no | |
| `chatPanelId` | string | no | Spec 018 bridge to `agent-chat` |

### `AgentTask` 🟢 — `types.ts:138`
`{ id; specTaskId; title; description; priority: TaskPriority; status: TaskStatus; startedAt?; completedAt? }`.

### `PullRequest` 🟢 — `types.ts:166`
`{ url: string; state?: 'open'|'merged'|'closed'; branch: string; createdAt: number }`.

### `SessionStatus` (enum) 🟢 — `types.ts:19`
`PENDING | RUNNING | BLOCKED | COMPLETED | FAILED | CANCELLED` (last three terminal).

### `TaskStatus` (enum) 🟢 — `types.ts:37`
`PENDING | IN_PROGRESS | COMPLETED | FAILED | SKIPPED`.

### `SessionUpdate` 🟢 — `types.ts:232`
`{ localId: string; status?: SessionStatus; tasks?: AgentTask[]; pullRequests?: PullRequest[]; externalUrl?; errorMessage?; timestamp: number }`.

### `SessionContext` 🟢 — `types.ts:206`
`{ branch; specPath; workspaceUri; repoUrl?; featurePath?; isFullFeature?; taskIds? }` (input to `createSession`).

### `SpecTask` 🟢 — `types.ts:186`
`{ id; title; description; priority: TaskPriority }`.

### `ProviderMetadata` 🟢 — `types.ts:70`
`{ id: string (kebab-case); displayName: string; description: string; icon: string }`.

### `ErrorCode` (enum) 🟢 — `types.ts:271`
`CREDENTIALS_MISSING | CREDENTIALS_INVALID | SESSION_NOT_FOUND | SESSION_CREATION_FAILED | SESSION_CANCEL_FAILED | API_UNAVAILABLE | API_RATE_LIMITED | API_ERROR | NETWORK_ERROR | TIMEOUT`.

### `ProviderAction` (union) 🟢 — `types.ts:258`
`{ type: 'openUrl', url } | { type: 'notify', message } | { type: 'none' }`.

---

## Module: `devin`

> Structures from `src/features/devin/` (spec `001-devin-integration`). Sessions persisted in `workspaceState` (JSON under `gatomia.devin.sessions`); credentials in `SecretStorage`. All entity fields are `readonly`.

### `DevinSession` 🟢 — `entities.ts:31`
The root session aggregate (persisted as a JSON array; 7-day retention after completion).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `sessionId` | string | yes | Devin API session id |
| `localId` | string (UUIDv4) | yes | Local tracking id |
| `status` | `SessionStatus` | yes | Mapped local status |
| `branch` | string | yes | Git branch worked on |
| `specPath` | string | yes | Spec file path in workspace |
| `tasks` | `DevinTask[]` | yes | Tasks sent to Devin |
| `createdAt` / `updatedAt` | number (epoch ms) | yes | Timestamps |
| `completedAt` | number | no | Set on terminal |
| `devinUrl` | string | no | Devin web UI URL |
| `pullRequests` | `PullRequest[]` | yes | PRs created by Devin |
| `apiVersion` | `ApiVersion` | yes | Version used (`v1`/`v2`/`v3`) |
| `orgId` | string | no | v3 only |
| `errorMessage` | string | no | Set on failure |
| `retryCount` | number | yes | Default 0 |

### `DevinTask` 🟢 — `entities.ts:73`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `taskId` | string (UUIDv4) | yes | Local id |
| `specTaskId` | string | yes | Reference to spec task (e.g. `T001`) |
| `title` / `description` | string | yes | |
| `acceptanceCriteria` | string[] | no | |
| `priority` | `TaskPriority` (`P1`\|`P2`\|`P3`) | yes | |
| `status` | `TaskStatus` | yes | |
| `devinSessionId` | string | no | Set when started |
| `artifacts` | `TaskArtifact[]` | no | |
| `startedAt` / `completedAt` | number | no | |

### `DevinCredentials` 🟢 — `entities.ts:108`
`{ apiKey; apiVersion: ApiVersion; orgId?; createdAt; lastUsedAt?; isValid: boolean }`. The `apiKey` and the JSON metadata are stored under separate `SecretStorage` keys (`gatomia.devin.apiKey` / `gatomia.devin.credentials`); `CredentialsMetadata` (the JSON blob) never contains the key.

### `PullRequest` 🟢 — `entities.ts:158`
`{ prUrl: string; prState?: 'open'|'closed'|'merged'; branch: string; createdAt: number; mergedAt?: number }`.

### `DevinProgressEvent` 🟢 — `entities.ts:133`
`{ eventId; sessionId; timestamp; eventType: EventType; message; data?: Record<string,unknown> }` (in-memory only).

### `TaskArtifact` 🟢 — `entities.ts:181`
`{ artifactId; type: 'file'|'log'|'test_result'; name; path?; content?; createdAt }`.

### Enums / status types 🟢 — `types.ts`
| Type | Values |
|------|--------|
| `ApiVersion` (`:19`) | `v1` \| `v2` \| `v3` |
| `DevinApiStatus` (`:34`) | `new` \| `claimed` \| `running` \| `exit` \| `error` \| `suspended` \| `resuming` (raw API) |
| `DevinStatusDetail` (`:50`) | `working` \| `waiting_for_user` \| `finished` \| `blocked` \| (string) |
| `SessionStatus` (`:65`) | `queued` \| `initializing` \| `running` \| `blocked` \| `completed` \| `failed` \| `cancelled` (mapped; last 3 terminal) |
| `TaskStatus` (`:84`) | `pending` \| `queued` \| `in-progress` \| `completed` \| `failed` \| `cancelled` |
| `EventType` (`:102`) | `status_change` \| `log_output` \| `pr_created` \| `error` \| `milestone` \| `artifact` |

### API contract types 🟢 — `devin-api-client.ts`
`CreateSessionRequest` (`:30` — `prompt`, `title?`, `repos?: RepositoryLink[]`, `tags?`, `maxAcuLimit?`, `playbookId?`), `CreateSessionResponse` (`:90`), `GetSessionResponse` (`:104` — incl. `statusDetail?`, `acusConsumed`, `isArchived`), `ListSessionsRequest` (`:49`) / `ListSessionsResponse` (`:122`), `RepositoryLink` (`:21`), `PullRequestInfo` (`:72`), `PageInfo` (`:81`). Raw API shapes are snake_case and mapped to camelCase in each client.

### `DevinErrorCode` (enum) + error classes 🟢 — `errors.ts:17`
Codes: `DEVIN_API_ERROR`, `DEVIN_TIMEOUT`, `DEVIN_NETWORK_ERROR`, `DEVIN_AUTH_FAILED`, `DEVIN_CREDENTIALS_NOT_FOUND`, `DEVIN_INVALID_TOKEN_FORMAT`, `DEVIN_ORG_ID_REQUIRED`, `DEVIN_SESSION_NOT_FOUND`, `DEVIN_RATE_LIMITED`, `DEVIN_VALIDATION_ERROR`, `DEVIN_MAX_RETRIES_EXCEEDED`, `DEVIN_INVALID_SESSION_STATE`. Base `DevinError { code; context? }` (`:54`) with subclasses: `DevinApiError { statusCode; errorCode?; get isRetryable }`, `DevinTimeoutError`, `DevinNetworkError`, `DevinAuthenticationError`, `DevinCredentialsNotFoundError`, `DevinInvalidTokenError`, `DevinOrgIdRequiredError`, `DevinSessionNotFoundError`, `DevinInvalidSessionStateError`, `DevinRateLimitedError { retryAfterMs? }`, `DevinMaxRetriesExceededError { attempts; lastError? }`, `DevinValidationError { validationDetails? }`.

---

## Module: `hooks`

> Structures from `src/features/hooks/types.ts` (spec `011-custom-agent-hooks`). Hooks persisted in `workspaceState` under `gatomia.hooks.configurations`; execution logs under `gatomia.hooks.execution-logs`. No database.

### `Hook` 🟢 — `types.ts:16`
The root automation rule (a *trigger/events* + optional *conditions/schedule* + *action*).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string (UUID v4) | yes | Identity |
| `name` | string (≤100) | yes | Unique, user-friendly |
| `enabled` | boolean | yes | Default true |
| `trigger` | `TriggerCondition` | no | **Legacy** (kept for migration) |
| `events` | `EventSource[]` | no | Normalized trigger model |
| `conditions` | `Condition[]` | no | Prerequisites |
| `schedule` | `Schedule` | no | When the action runs |
| `action` | `ActionConfig` | yes | What to execute |
| `createdAt` / `modifiedAt` | number (ms) | yes | Timestamps |
| `lastExecutedAt` | number | no | |
| `executionCount` | number | yes | Default 0 |

### `TriggerCondition` (legacy) 🟢 — `types.ts:43`
`{ agent: AgentType; operation: OperationType; timing: TriggerTiming; waitForCompletion?: boolean }`.

### Normalized domain model 🟢 — `types.ts:54-86`
- `EventSource` `{ type: 'agent-operation'|'execution-flow'|'repository'|'file-change'|'manual'; agent?; operation?; timing?; waitForCompletion?; hookId?; flowEvent?: 'success'|'failure'|'timeout'; pattern? }`
- `Condition` `{ type: 'branch'|'file-exists'|'custom'; pattern?; filePath?; expression? }`
- `Schedule` `{ type: 'immediate'|'delayed'|'cron'; delayMs?; cronExpression? }`

### Enums 🟢 — `types.ts`
| Type | Values |
|------|--------|
| `AgentType` (`:91`) | `speckit` \| `openspec` \| `orchestration` |
| `OperationType` (`:96`) | 15 ops: research, datamodel, design, specify, clarify, plan, tasks, taskstoissues, analyze, checklist, constitution, implementation, unit-test, integration-test, task-completed, task-failed |
| `TriggerTiming` (`:134`) | `before` \| `after` |
| `ActionType` (`:147`) | `agent` \| `git` \| `github` \| `mcp` \| `custom` \| `acp` |
| `GitOperation` (`:193`) | commit, push, create-branch, checkout-branch, pull, merge, tag, stash |
| `GitHubOperation` (`:228`) | open-issue, close-issue, create-pr, add-comment, merge-pr, close-pr, add-label, remove-label, request-review, assign-issue, create-release |
| `ExecutionStatus` (`:497`) | `success` \| `failure` \| `skipped` \| `timeout` |
| `ACPExecutionState` (`:268`) | PENDING, SPAWNING, HANDSHAKE, SESSION_CREATED, PROMPTING, COLLECTING, DONE, TIMEOUT, ERROR |

### `ActionConfig` + action params 🟢 — `types.ts:139`
`ActionConfig { type: ActionType; parameters: ActionParameters }`. Param unions:
- `AgentActionParams` (`:173`) `{ command }`
- `GitActionParams` (`:180`) `{ operation; messageTemplate; pushToRemote?; branchName?; tagName?; tagMessage?; stashMessage? }`
- `GitHubActionParams` (`:206`) `{ operation; repository?; titleTemplate?; bodyTemplate?; issueNumber?; prNumber?; mergeMethod?; labels?; labelName?; reviewers?; assignees?; tagName?; releaseName?; releaseBody?; draft?; prerelease? }`
- `MCPActionParams` (`:384`) `{ modelId?; prompt; selectedTools: SelectedMCPTool[]; serverId?/toolName? (legacy); parameterMappings?; timeout? }`
- `CustomActionParams` (`:244`) `{ agentId?; agentType?: 'local'|'background'; agentName? (deprecated); prompt?; selectedTools?; arguments?; cliOptions?: CopilotCliOptions }`
- `ACPActionParams` (`:283`) `{ mode: 'local'; agentCommand; agentDisplayName?; taskInstruction; cwd? }`

### MCP entities 🟢 — `types.ts`
- `SelectedMCPTool` (`:402`) `{ serverId; serverName; toolName; toolDisplayName }`
- `ParameterMapping` (`:412`) `{ toolParam; source: 'context'|'literal'|'template'; value }`
- `MCPServer` (`:426`) `{ id; name; description?; status: ServerStatus; tools: MCPTool[]; lastDiscovered }`
- `MCPTool` (`:438`) `{ name; displayName; description; inputSchema: JSONSchema; serverId }`
- `JSONSchema` (`:449`) / `JSONSchemaProperty` (`:458`)

### `HookExecutionLog` / `ExecutionContext` 🟢 — `types.ts:472` / `:515`
- `HookExecutionLog` `{ id; hookId; executionId; chainDepth; triggeredAt; completedAt?; duration?; status: ExecutionStatus; error?: ExecutionError; contextSnapshot: TemplateContext }`
- `ExecutionContext` `{ executionId; chainDepth; executedHooks: Set<string>; startedAt }` (cycle/depth guard)
- `ExecutionError` `{ code; message; stack? }`

### `TemplateContext` / `TriggerEvent` 🟢 — `types.ts:525` / `:540`
- `TemplateContext` `{ feature?; branch?; timestamp?; user?; agentOutput?; clipboardContent?; outputPath?; acpAgentOutput? }`
- `TriggerEvent` `{ agent; operation; timestamp; timing?; metadata?; outputPath?; outputContent? }`

### `TemplateVariable` catalog 🟢 — `template-variable-constants.ts:23`
`TemplateVariable { name; description; category: TemplateVariableCategory; valueType; availableFor: OperationType[]; ... }`. Seven category arrays: `STANDARD_VARIABLES`, `SPEC_VARIABLES`, `SPEC_ARTIFACT_VARIABLES`, `REPOSITORY_VARIABLES`, `AGENT_METADATA_VARIABLES`, `FILE_VARIABLES`, `OUTPUT_VARIABLES` (`$agentOutput`, `$clipboardContent`, `$outputPath`). `availableFor: []` means available for all triggers.

### Key constants 🟢 — `types.ts:556-583`
`MAX_HOOK_NAME_LENGTH=100`, `MAX_COMMAND_LENGTH=200`, `MAX_MESSAGE_TEMPLATE_LENGTH=500`, `MAX_BODY_TEMPLATE_LENGTH=5000`, `MAX_ARGUMENTS_LENGTH=1000`, `MAX_CHAIN_DEPTH=10`, `MAX_EXECUTION_LOGS=100`, `ACTION_TIMEOUT_MS=30000`, `MAX_TRIGGER_HISTORY=50`, `MCP_DISCOVERY_CACHE_TTL=300000`, `MCP_DEFAULT_TIMEOUT=30000`, `MCP_MIN_TIMEOUT=1000`, `MCP_MAX_TIMEOUT=300000`, `MCP_MAX_CONCURRENT_ACTIONS=5`.

---

## Module: `orchestration`

> Structures from `src/features/orchestration/`. Pure in-memory projections — no persistence of its own (reads from `agent-chat` and `cloud-agents` stores). The Kanban `NormalizedTask` model belongs to the `tasks` module.

### `OrchestrationSessionProjection` 🟢 — `orchestration-read-model.ts:23`
Unified, read-only view of one session (from either source) for the dashboard.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | `agent-chat:<id>` or `cloud-agent:<localId>` |
| `source` | `'agent-chat' \| 'cloud-agent'` | yes | |
| `sourceSessionId` | string | yes | Underlying session id |
| `title` | string | yes | Derived from first user message / task / spec path |
| `agentName` | string | yes | |
| `state` | string | yes | Raw lifecycle/status string |
| `bucket` | `OrchestrationSessionBucket` | yes | `active`/`waiting`/`completed`/`failed` |
| `createdAt` / `updatedAt` | number | yes | |
| `endedAt` | number | no | |
| `lastVisibleActivityAt` | number | yes | Max of updates + transcript timestamps |
| `isBlocked` | boolean | yes | `waiting-for-input` / `BLOCKED` |
| `worktreeStatus` | string | no | |
| `executionTargetLabel` | string | no | `Local`/`Worktree`/`Cloud` |
| `externalUrl` / `cloudProviderId` | string | no | |
| `openSessionCommand` | union | yes | `{kind:'agent-chat', sessionId}` \| `{kind:'cloud-agent', localId, externalUrl?}` |

### `OrchestrationSnapshot` 🟢 — `orchestration-read-model.ts:49`
`{ sessions: OrchestrationSessionProjection[]; cloudProviderRegistryAvailable: boolean; cloudProviderCount: number; activeProvider?: { id; displayName }; generatedAt: number; degradedReasons: string[] }`.

### Enums 🟢 — `orchestration-read-model.ts:15`
- `OrchestrationSessionSource` = `'agent-chat' | 'cloud-agent'`
- `OrchestrationSessionBucket` = `'active' | 'waiting' | 'completed' | 'failed'`

### Autonomous loop state 🟢 — `autonomous-agent-loop.ts`
In-memory only: `activeTasks: Map<taskId, NormalizedTask>` and `sessionToTaskMap: Map<sessionId, taskId>`. Task execution state lives in `NormalizedTask.execution` (`TaskExecutionMetadata`: `state: ExecutionState`, `suggestedRole?`, `parallelizable?`, `intent?`, `startedAt?`, `completedAt?`, `errorMessage?`) — owned by the `tasks` module.

---

## Module: `spec`

> Structures from `src/features/spec/`. Review-flow state persisted as JSON in `.vscode/gatomia/spec-review-state.json` (`{ specStates: { [specId]: PersistedSpecification } }`). No database.

### `Specification` 🟢 — `review-flow/types.ts:47`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | |
| `title` / `owner` | string | yes | |
| `status` | `SpecStatus` | yes | FSM state |
| `completedAt` | `Date \| null` | yes | Set on first review entry |
| `reviewEnteredAt` | `Date \| null` | no | |
| `archivedAt` | `Date \| null` | no | |
| `updatedAt` | Date | yes | |
| `links` | `SpecLinks` `{ specPath; docUrl? }` | yes | |
| `pendingTasks` / `pendingChecklistItems` | number | no | Review/archive gates |
| `changeRequests` | `ChangeRequest[]` | no | |
| `watchers` | string[] | no | Notification recipients |

### `ChangeRequest` 🟢 — `review-flow/types.ts:76`
`{ id; specId; title; description; severity: ChangeRequestSeverity; status: ChangeRequestStatus; tasks: TaskLink[]; submitter; createdAt; updatedAt; sentToTasksAt: Date|null; notes?; archivalBlocker? }`.

### `TaskLink` 🟢 — `review-flow/types.ts:66`
`{ taskId; source: 'tasksPrompt'; status: TaskLinkStatus; createdAt: Date }`.

### `ReviewTransitionEvent` 🟢 — `review-flow/types.ts:98`
`{ eventId; specId; triggerType: 'auto'|'manual'; initiatedBy?; occurredAt: Date; notificationRecipients: string[]; status: 'succeeded'|'failed'; failureReason?: string|null }`.

### Enums 🟢 — `review-flow/types.ts`
| Type | Values |
|------|--------|
| `SpecStatus` (`:10`) | `current` \| `readyToReview` (legacy) \| `review` \| `reopened` \| `archived` |
| `ChangeRequestStatus` (`:20`) | `open` \| `blocked` \| `inProgress` \| `addressed` |
| `TaskLinkStatus` (`:29`) | `open` \| `inProgress` \| `done` |
| `ChangeRequestSeverity` (`:34`) | `low` \| `medium` \| `high` \| `critical` |
| `ReviewTransitionTrigger` / `…Status` (`:95`) | `auto`\|`manual` / `succeeded`\|`failed` |

### Persisted shapes 🟢 — `review-flow/storage.ts`
`PersistedSpecification` / `PersistedChangeRequest` / `PersistedTaskLink` mirror the runtime entities with all `Date` fields as ISO strings.

### Create-spec webview protocol 🟢 — `types.ts`
Extension→webview: `CreateSpecExtensionMessage` (init, submit success/error, confirm-close, focus, import-markdown result, attach-images result). Webview→extension: `CreateSpecWebviewMessage` (submit `{description, imageUris}`, autosave, close-attempt, import-markdown request, attach-images request, cancel, ready). Draft: `CreateSpecDraftState { formData: { description }; lastUpdated }`.

### Dispatch payloads 🟢 — `review-flow/tasks-dispatch.ts`
`TasksPromptPayload { specId; specTitle; specPath; changeRequestId; changeRequestTitle; changeRequestDescription; severity; submitter; context: { specLink; changeRequestLink? }; notes? }` → `TasksPromptResponse { tasks: {taskId,title,description}[]; success; message? }` (**mock** producer).

---

## Module: `steering`

> Structures from `src/features/steering/`. No domain entities/DB — mostly file operations + VS Code settings. Documents written to the filesystem (`~/.github/copilot-instructions.md`, `<ws>/.github/instructions/*.instructions.md`, constitution / `openspec/AGENTS.md`).

### Create-steering webview protocol 🟢 — `types.ts`
- `CreateSteeringFormData` `{ summary; audience; keyPractices; antiPatterns }`
- `CreateSteeringDraftState` `{ formData: CreateSteeringFormData; lastUpdated: number }`
- Extension→webview `CreateSteeringExtensionMessage`: init, submit success/error, confirm-close, focus.
- Webview→extension `CreateSteeringWebviewMessage`: submit, autosave, close-attempt, cancel, ready.
- `CreateSteeringFieldErrors` `{ summary? }`.

### Consent access types 🟢 — `global-resource-access-consent.ts`
| Type | Values |
|------|--------|
| `GlobalAccessDefault` | `ask` \| `allow` \| `deny` (default `ask`) |
| `WorkspaceAccessOverride` | `inherit` \| `allow` \| `deny` |
| `EffectiveAccess` | `ask` \| `allow` \| `deny` |

### Settings / state keys 🟢 — `global-resource-access-consent.ts:12-16`
- Setting `steering.globalResourceAccessDefault` (global default)
- Setting `steering.workspaceGlobalResourceAccess` (workspace override)
- `workspaceState` fallback `gatomia.steering.workspaceGlobalResourceAccessFallback`
- `workspaceState` `gatomia.steering.globalResourceAccess.lastDecision`

### Instruction-rule file format 🟢 — `instruction-rules.ts:70-76`
File `<kebab-name>.instructions.md` with frontmatter `--- description: ...; applyTo: '**' ---`. Project dir `<ws>/.github/instructions/`; user dir `~/.github/instructions/`.

### `NormalizeInstructionRuleNameResult` 🟢 — `instruction-rules.ts:19`
`{ ok: true; normalizedName: string } | { ok: false; error: InstructionRuleError }`.

---

## Module: `tasks`

> Structures from `src/features/tasks/task-model.ts`. In-memory normalized representation of tasks parsed from `tasks.md` (no persistence here). The underlying parse produces `TaskGroup[]` (in `utils/task-parser`).

### `NormalizedTask` 🟢 — `task-model.ts:40`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | `${specId}-${task.id}` (spec-scoped) |
| `title` | string | yes | |
| `status` | `NormalizedTaskStatus` | yes | |
| `source` | `{ system; filePath; line?; isUnsupported? }` | yes | provenance for navigation |
| `metadata` | `{ phase?; priority?; complexity? }` | yes | |
| `execution` | `TaskExecutionMetadata` | no | autonomous-loop state |

### `TaskExecutionMetadata` 🟢 — `task-model.ts:14`
`{ state: ExecutionState; intent?; suggestedRole?; parallelizable?; dependsOn?: string[]; errorMessage?; startedAt?; completedAt? }`.

### Enums 🟢 — `task-model.ts`
| Type | Values |
|------|--------|
| `ExecutionState` (`:5`) | `queued` \| `ready` \| `running` \| `blocked` \| `completed` \| `failed` \| `skipped` |
| `NormalizedTaskStatus` (`:28`) | `completed` \| `in-progress` \| `not-started` \| `failed` \| `blocked` \| `skipped` |

### `TaskProvider` (interface) 🟢 — `task-model.ts:58`
`{ readonly name: string; canHandle(filePath): boolean; getTasks(specId, filePath): Promise<NormalizedTask[]> }`. Implemented by `SpecKitTaskProvider` and `OpenSpecTaskProvider`.

---

## Module: `providers`

> The provider layer holds no persisted entities of its own. Its "data" is (a) `TreeItem` view models built on demand from feature-layer state and (b) the webview `postMessage` payload contracts. Persisted state lives in the feature modules (`agent-chat`, `hooks`, `spec`, etc.).

### Agent-chat webview message protocol 🟢 — `agent-chat-view-provider.ts`
**Extension → webview** (`type` discriminator): `agent-chat/catalog/loaded` (`{ catalog, modelsLoading }`), `agent-chat/sessions/list-changed` (`{ sessions: SidebarSessionListItem[] }`), `agent-chat/permission-default/changed` (`{ mode: 'ask'|'allow'|'deny' }`), `agent-chat/session/loaded`, `agent-chat/session/cleared` (`{ reason }`), `agent-chat/session/lifecycle-changed` (`{ from, to, at }`), `agent-chat/session/models-changed`, `agent-chat/messages/appended`, `agent-chat/messages/updated` (`{ updates: {id, patch}[] }`), `agent-chat/pending-writes/changed`.
**Webview → extension**: `agent-chat/ready`, `agent-chat/control/switch-session`, `.../new-session`, `.../request-new-chat`, `.../change-permission-default`, `.../probe-models`, `agent-chat/input/submit` (`{ sessionId, content, clientMessageId? }`), `agent-chat/control/cancel|retry`, `agent-chat/pending-writes/accept-all|reject-all|accept-one|reject-one`.

### `SidebarSessionListItem` 🟢 — `agent-chat-view-provider.ts:1329`
| Field | Type | Notes |
|-------|------|-------|
| `id` | string | session id |
| `agentDisplayName` | string | |
| `lifecycleState` | `SessionLifecycleState` | |
| `updatedAt` | number | sort key (desc) |
| `selectedModeId` / `selectedModelId` | string? | |
| `isTerminal` | boolean | `TERMINAL_STATES.has(state)` |
| `title` | string? | first user msg, ≤60 chars (`SESSION_TITLE_MAX_LENGTH`) |

### `NewSessionRequestPayload` 🟢 — `agent-chat-view-provider.ts:1318`
`{ providerId?; modelId?; agentFileId?; thinkingLevelId?; agentRoleId?; taskInstruction? }` — all optional; composer dispatches `gatomia.agentChat.startNew`.

### Hooks-panel message protocol 🟢 — `hook-view-provider.ts`
Webview → extension commands (normalized, `/`→`.`): `hooks.create`, `hooks.update` (`{id, updates}`), `hooks.delete` (`{id}`), `hooks.toggle` (`{id, enabled}`), `hooks.list`, `hooks.logs` (`{hookId?}`), `hooks.ready`, `hooks.mcp-discover` (`{forceRefresh?}`), `hooks.agents-list` (`{forceRefresh?}`). Extension → webview: `hooks.sync`/`hooks/sync` (`{hooks}`), plus `HookExecutionStatusPayload` (`{hookId, status: 'executing'|'completed'|'failed', errorMessage?}`).

### Orchestration message protocol 🟢 — `orchestration-view-provider.ts`
`orchestration/ready`, `orchestration/refresh`, `orchestration/open-session`, `orchestration/open-existing-surface`, `orchestration/open-external`.

### Welcome-screen config & dependency model 🟢 — `welcome-screen-provider.ts`
`EDITABLE_CONFIG_KEYS` (`:71`) = `gatomia.specSystem`, `gatomia.speckit.specsPath`, `gatomia.speckit.memoryPath`, `gatomia.speckit.templatesPath`, `gatomia.openspec.path`, `gatomia.prompts.path`. `InstallableDependency` = `copilot-chat | speckit | openspec | copilot-cli | gatomia-cli | devin-cli | gemini-cli`. Feature-action handler kinds: `vscode-command | open-url | terminal`. System diagnostics: 24-hour rolling window, 5-entry limit (per file header).

### `CopilotAvailabilityResult` 🟢 — `copilot-provider.ts:16`
`{ isAvailable; isInstalled; version: string|null; isCompatible; errorMessage: string|null; setupGuidance: string|null }`.

### Tree-item view models 🟡 (UI projections, not persisted)
`SpecItem` (label, collapsibleState, `contextValue`, specName?, system?, changeRequest?, specTitle?), `ActionItem`, `RunningAgentsTreeItem`, `CloudAgentTreeItem`/`SessionTreeItem`/`TaskTreeItem`/`InfoTreeItem` (Devin), `SteeringItem`, `WikiItem`, `HookTreeItem`, `QuickAccessTreeItem`, `OverviewItem` — all extend `vscode.TreeItem` with a `contextValue` that drives `when`-clause menu contributions.

---

## Module: `services`

> ACP contracts live in `acp/types.ts`; chat/document/config contracts are inline. No relational persistence — registry cache and config live in VS Code `Memento`/settings.

### `AcpProviderDescriptor` 🟢 — `acp/types.ts:82`
The runnable definition of an ACP provider (built-in or bridged from catalog/remote).
| Field | Type | Notes |
|-------|------|-------|
| `id` | string | provider id (e.g. `devin`, `gemini`) |
| `displayName` | string | |
| `spawnCommand` | string | CLI binary or `npx` |
| `spawnArgs` | string[] | |
| `preferredHosts` | `IdeHost[]` | host→provider routing |
| `probe` | `() => Promise<AcpProviderProbe>` | install/auth/ACP-support check |
| `source` | catalog/remote/built-in | drives picker "installed/install-required" |

### `AcpProviderProbe` 🟢 — `acp/types.ts:57`
`{ installed: boolean; acpSupported: boolean; authenticated: boolean; version?: string }` — consumed by `ChatRouter.resolveFor`.

### `AcpSessionModelState` / `AcpModelInfo` 🟢 — `acp/types.ts:25` / `:12`
`AcpSessionModelState = { availableModels: AcpModelInfo[]; currentModelId: string }`; `AcpModelInfo = { id; displayName; ... }`. `ACP_NOT_SUPPORTED` sentinel marks providers lacking experimental model APIs.

### `AcpSessionEvent` (union) 🟢 — `acp-client.ts`
Kinds fanned out by `subscribeSession`: message/thought/user chunk, `plan`, `available-commands`, `mode`/`session-info`/`usage`, `tool-call`/`tool-call-update` (with `AcpAffectedFile[] {path, linesAdded, linesRemoved, languageId?}`), `session-models-changed`.

### `SessionMode` / `PermissionMode` 🟢 — `acp/types.ts`, `acp-client.ts:46`
`SessionMode = 'workspace' | 'per-spec' | 'per-prompt'`; `PermissionMode = 'ask' | 'allow' | 'deny'`. Session-key map: `workspace→_ws_`, `per-spec→spec:<id>`, `per-prompt→once:<uuid>`.

### `ChatTarget` / `ChatRouterDecision` 🟢 — `chat-router.ts:9`
`ChatTarget = {kind:'acp'; providerId} | {kind:'copilot-chat'}`; `ChatRouterDecision = { target; reason; providerId? }`.

### `RemoteRegistryEntry` 🟢 — `acp-provider-registry.ts:45`
`{ id; displayName; installUrl?; description?; version?; repository?; icon?; distribution?: { binary?: Record<platform, {archive,cmd,args?}>; npx?: {package,args?,env?} } }`. Platform keys: `darwin|linux|windows`-`aarch64|x86_64`.

### `PendingWrite` (re-used from agent-chat) 🟢
Buffered `writeTextFile` request `{ id; path; content; oldText|null; linesAdded; linesRemoved; languageId? }`; settled via `FlushAction` (`accept-all|reject-all|accept-one|reject-one`).

### `AgentConfiguration` 🟢 — `configuration-service.ts:8`
`{ resourcesPath: string (default 'resources'); enableHotReload: boolean (default true); logLevel: 'debug'|'info'|'warn'|'error' (default 'info') }` — frozen, from `gatomia.agents.*`.

### `PromptTemplate` / `PromptFrontmatter` 🟢 — `types/prompt.types`, `prompt-loader.ts`
`PromptTemplate = { frontmatter: { id; name; description; version; variables: Record<string, {required?; ...}> }; content }`. Compiled to a `HandlebarsTemplateDelegate`; `renderPrompt` validates required variables first.

### `DocumentArtifact` 🟢 — `types/preview`, built by `document-preview-service.ts:111`
`{ documentId; documentType: PreviewDocumentType; title; filePath; renderStandard: 'code'|'markdown'; sessionId (uuid); updatedAt (ISO); sections: PreviewSection[] }`. `PreviewDocumentType` includes `spec|plan|task|research|dataModel|api|quickstart|checklist`.

### `OutdatedDocumentInfo` / `DocumentVersion` / `DocumentDependency` 🟢 — `document-dependency-tracker.ts:7-21`
Version + dependency graph used to flag downstream docs as outdated when an upstream doc changes.

---

## Module: `panels`

> The panel layer owns no persisted entities. Its "data" is (a) per-panel **construction options / DI dependency bags** and (b) the **webview `postMessage` protocol** for each surface. Session/transcript state lives in the feature modules (`agent-chat`, `cloud-agents`, `devin`).

### Host abstraction (agent-chat) 🟢 — `agent-chat-panel.ts:60-150`
- `AgentChatPanelHost` `{ createPanel({session}): HostedPanel }` — injected factory (prod = real `createWebviewPanel`, tests = fake).
- `HostedWebview` `{ postMessage(msg): Thenable<boolean>; onDidReceiveMessage(listener): {dispose} }`.
- `HostedPanel extends AgentChatPanelLike` `{ webview: HostedWebview }` (structural, avoids importing `vscode.WebviewPanel`).
- `AgentChatPanelOptions` `{ session: AgentChatSession; store: AgentChatSessionStore; registry: AgentChatRegistry; host: AgentChatPanelHost }`.

### Agent Chat panel protocol 🟢 — `agent-chat-panel.ts`
**Webview → extension**: `agent-chat/ready`, `agent-chat/input/submit` (`{sessionId, content, clientMessageId?}`), `agent-chat/control/cancel`, `agent-chat/control/retry`.
**Extension → webview**: `agent-chat/session/loaded` (`{session:{id,source,agentDisplayName,selectedModeId?,selectedModelId?,executionTarget:{kind,label},lifecycleState,acceptsFollowUp,isReadOnly,worktree?,cloud?}, messages, availableModes, availableModels, availableTargets:[{kind,label,enabled}], hasArchivedTranscript}`), `agent-chat/messages/appended` (`{sessionId, messages}`), `agent-chat/messages/updated` (`{sessionId, updates:{id,patch}[]}`), `agent-chat/session/lifecycle-changed` (`{sessionId, from, to, at}`).

### `NewSessionPanelStartPayload` / `NewSessionPanelDeps` 🟢 — `new-session-panel.ts:42-70`
- `NewSessionPanelStartPayload` `{ agentId: string; agentDisplayName: string; taskInstruction: string }` (validated by `isStartPayload`).
- `NewSessionPanelDeps` `{ listProviders(): readonly NewSessionProviderItem[]; onStart(payload): Promise|void; registryUpdateEvent: Event<void>; extensionUri: Uri; window; env }`.
- Protocol — webview→ext: `new-session/start`, `new-session/open-install-url` (`{url}`), `new-session/close`; ext→webview: `new-session/providers` (`{providers}`).

### `WelcomeScreenPanelCallbacks` 🟢 — `welcome-screen-panel.ts:23`
Optional hooks: `onReady`, `onExecuteCommand(commandId,args?)`, `onUpdateConfig(key,value)`, `onInstallDependency(dep)`, `onInstallMissingDependencies(deps)`, `onInstallPrerequisite(key)`, `onRefreshDependencies`, `onUpdatePreference('dontShowOnStartup',value)`, `onOpenExternal(url)`, `onNavigateSection(section)`, `onSearchResources(query)`, `setPanel(panel)`. Inbound `WebviewToExtensionMessage` mirrors these (`welcome/ready|execute-command|update-config|install-dependency|install-missing-dependencies|install-prerequisite|refresh-dependencies|update-preference|open-external|navigate-section|search-resources`).

### `DocumentPreviewPanelOptions` 🟢 — `document-preview-panel.ts:17`
Optional callbacks: `onReloadRequested`, `onEditAttempt(reason?)`, `onOpenInEditor`, `onFormSubmit(payload): {status?,message?}|void`, `onRefineSubmit(payload): {status?,message?}|void`, `onExecuteTaskGroup(groupName)`, `onOpenFile(filePath)`. Protocol — webview→ext: `preview/ready|request-reload|edit-attempt|open-in-editor|forms/submit|refine/submit|execute-task-group|open-file`; ext→webview: `preview/load-document` (`DocumentArtifact`), `preview/show-placeholder` (`{reason?}`), `preview/forms/result` & `preview/refine/result` (`{requestId,status,message?}`). (`DocumentArtifact`, `FormSubmissionPayload`, `RefinementRequestPayload` defined under `services` / `types/preview`.)

### Cloud Agent progress view DTO 🟢 — `cloud-agent-progress-panel.ts:115`
Projection of `AgentSession` posted as `session-update` (`{sessions, activeProvider:{id,displayName}|null}`); each session `{localId, providerId, status, displayStatus, branch, specPath, externalUrl, createdAt, updatedAt, isReadOnly, tasks:[{taskId, specTaskId, title, priority, status}], pullRequests:[{url, state='open', branch}]}`. Inbound (`cloud-agent-message-handler.ts`): `refresh-status`, `open-external` (`{url}`), `open-pr` (`{url}`).

### `DevinWebviewMessage` 🟢 — `devin-message-handler.ts:22`
`{ readonly type: string; readonly payload?: Record<string, unknown> }`. Handled types: `cancel-session` (`{localId}`), `refresh-status`, `open-pr` (`{prUrl}`), `open-devin` (`{url}`). Ext→webview: `session-update` (`{sessions}`).

---

## Module: `commands`

> No persisted entities. The "data" here is **command-id constant maps**, **DI dependency bags**, and **payload/arg shapes** for command invocation (including the tree-item shapes VS Code passes to `view/item/context` actions).

### Command-id maps 🟢
- `AGENT_CHAT_COMMANDS` — `agent-chat-commands.ts:42` — `{START_NEW, OPEN_FOR_SESSION, CANCEL, CLEANUP_WORKTREE, CHANGE_MODE, CHANGE_MODEL, CHANGE_EXECUTION_TARGET, CLEANUP_ORPHANED_WORKTREE}` (`gatomia.agentChat.*`).
- `CLOUD_AGENT_COMMANDS` — `cloud-agent-commands.ts:54` — `{SELECT_PROVIDER, CHANGE_PROVIDER, CONFIGURE_PROVIDER, DISPATCH_TASK, DISPATCH_FULL_SPEC, CANCEL_SESSION, REMOVE_SESSION, REFRESH}`.
- `DEVIN_COMMANDS` — re-exported from `features/devin/config` — `{START_TASK, CONFIGURE_CREDENTIALS, CANCEL_SESSION, OPEN_PROGRESS, START_ALL_TASKS}`.

### `StartNewAcpSessionParams` 🟢 — `agent-chat-commands.ts:68`
`{ readonly agentId; agentDisplayName; agentCommand: string; mode?; taskInstruction?; cwd?: string }`.

### `AgentChatCommandsDeps` 🟢 — `agent-chat-commands.ts:105`
DI bag. `registry: Pick<AgentChatRegistry, getSession|getRunner|getPanel|focusPanel|registerSession|attachRunner|attachPanel> & Partial<checkCapacity>`; `store: Pick<AgentChatSessionStore, listNonTerminal|getSession|updateSession> & Partial<listOrphanedWorktrees|removeOrphanedWorktree>`; `createPanel: ChatPanelFactory`; `startAcpSession: StartAcpSessionFn`; optional `worktreeService`, `concurrentCap?: number`, `promptForCap?`, `emitTelemetry?`, `acpSessionManager?.setSessionModel(providerId, cwd, sessionId, modelId)`.

### T066 payloads + result unions 🟢 — `agent-chat-commands.ts:178-201,335-345`
- `CleanupWorktreePayload` `{ sessionId; confirmedDestructive: boolean }`; `CleanupWorktreeResult = {kind:'ok'} | {kind:'warning'; inspection: WorktreeInspection} | {kind:'error'; message}`.
- `CleanupOrphanedWorktreePayload` `{ sessionId; absolutePath; branchName; confirmedDestructive }`; same 3-arm result union.
- `ChangeModePayload` `{ sessionId; modeId }`, `ChangeModelPayload` `{ sessionId; modelId }`, `ChangeExecutionTargetPayload` `{ sessionId; target: ExecutionTarget }`.
- `SessionTreeItemLike` `{ sessionId? }`, `OrphanTreeItemLike` `{ orphanId?; orphanAbsolutePath?; orphanBranchName? }` (tree-context arg shapes).

### New-session types 🟢 — `agent-chat-new-session.ts`
- `NewSessionAvailability` = `'installed' | 'available-via-npx' | 'install-required'`.
- `NewSessionProviderItem` `{ id; displayName; description?; source: 'built-in'|'local'|'remote'; availability: NewSessionAvailability; npxPackage?; installUrl? }` (also consumed by `panels`/`providers`).
- `NewSessionStartPayload` `{ agentId; agentDisplayName; agentCommand?; taskInstruction }`.
- `NewSessionDeps` `{ listProviders(); startNew(payload); window; env; parseUri? }`.

### Cloud-agent command types 🟢 — `cloud-agent-commands.ts`
- `DispatchTreeItem` `{ contextValue?; task?:{id,title,priority?}; specName?; filePath?; parentName? }` (Spec Explorer "Run on Cloud" arg).
- `CloudAgentCommandOptions` `{ registry: ProviderRegistry; sessionStorage?; pollingService?; onSessionCreated?; onRefresh? }` (registration accepts this **or** a bare `ProviderRegistry`).
- `ExtractedTask` `{ taskId; taskTitle; taskDescription; path; isTaskGroup }`. Constants `MAX_DISPATCH_RETRIES=2`, `RETRY_DELAY_MS=1000`.

### Devin command types 🟢 — `devin-commands.ts`
- `DevinTaskContext` `{ specPath; taskId; title; description; priority: 'P1'|'P2'|'P3'; acceptanceCriteria?: string[] }`.
- `RunWithDevinTreeItem` `{ contextValue?; task?:{id,title,priority?}; specName?; filePath?; parentName? }`.
- `DevinCommandCallbacks` `{ onCredentialsConfigured?; onSessionCreated?; onSessionCancelled? }`.

---

## Module: `utils`

> Mostly **pure helpers + types** plus three module-private singletons. The "data" here is config shapes, parsed-markdown structures, and detection result types. No relational persistence; spec/migration helpers operate on the workspace filesystem.

### `UnifiedSpec` / `SpecAdapterConfig` 🟢 — `spec-kit-adapter.ts:44-62`
- `SpecAdapterConfig` `{ system: SpecSystemMode; workspacePath; specsPath; promptsPath }`.
- `UnifiedSpec` `{ id; name; path; system: SpecSystemMode; files: Record<string,string>; isNumbered?; number? }`. `files` keys: `spec|plan|research|contracts|data-model|quickstart|checklists|tasks` (SpecKit) or `spec|requirements|design|tasks` (OpenSpec), plus `extra:<file>` / `extra-folder:<dir>` for extension docs. Sets `KNOWN_SPEC_FILES`, `KNOWN_SPEC_FOLDERS`.

### `SpecKitFeature` + validation 🟢 — `spec-kit-utilities.ts:25,231`
- `SpecKitFeature` `{ number: number; name: string; slug: string; path: string }`.
- `SpecKitValidationResult` `{ isValid; missingDirectories: string[]; missingFiles: string[]; warnings: string[] }`.
- Regexes: dir `^(\d{3,})-(.+)$`, validation `^\d{3,}-[a-z0-9][-a-z0-9]*$/i`.

### Task model 🟢 — `task-parser.ts`
- `TaskStatus` = `'completed' | 'in-progress' | 'not-started'`.
- `ParsedTask` `{ id; title; status: TaskStatus; phase?; priority?; complexity?; line: number }`.
- `TaskGroup` `{ name: string; tasks: ParsedTask[] }`. (Distinct from `features/tasks` `NormalizedTask`; this is the raw markdown parse.)

### Checklist + frontmatter 🟢
- `ChecklistItem` `{ text; checked; line }`, `ChecklistStatus` `{ status: TaskStatus; total; completed }` — `checklist-parser.ts:7-20`.
- `FrontmatterResult` `{ title?; metadata?: Record<string,string> }` — `yaml-frontmatter-parser.ts:13`.

### `OpenSpecSettings` 🟢 — `config-manager.ts:10`
`{ paths:{specs,prompts}; speckit:{paths:{specs,memory,templates,scripts,agents,skills}}; views:{specs,steering,prompts,quickAccess:{visible}}; chatLanguage; customInstructions:{global,createSpec,startAllTask,runPrompt}; specSystem }`. Built from `gatomia.*` config (`VSC_CONFIG_NAMESPACE`) merged over `DEFAULT_PATHS`/`SPECKIT_CONFIG`.

### MCP correlation types (re-used) 🟢 — `copilot-mcp-utils.ts`
Consumes `MCPServer`/`MCPTool` from `features/hooks/types`. Internal `MCPConfig` `{ mcpServers: Record<string, { command; args?; env? }> }` (parsed from `mcp.json`). `MCPTool.inputSchema` normalized to `{ type:'object'; properties; required }`. Returned `MCPServer` `{ id; name; description; status:'available'; tools; lastDiscovered }`.

### `CLICheckResult` 🟢 — `cli-detector.ts:58`
`{ installed: boolean; version: string | null; output?; error? }`. Version patterns: `v?(\d+\.\d+\.\d+)`, `version\s+…`, bare semver.

### `IdeHost` 🟢 — `ide-host-detector.ts:10`
`'windsurf' | 'antigravity' | 'cursor' | 'vscode' | 'vscode-insiders' | 'vscodium' | 'positron' | 'unknown'` (ordered appName regex rules).

### `ChatContext` 🟢 — `chat-prompt-runner.ts:5`
`{ instructionType?: 'createSpec'|'startAllTask'|'runPrompt'; specId? }`. `MINIMUM_FILES_SUPPORT_VERSION = "1.95.0"`.

### `WebviewDataAttributes` 🟢 — `get-webview-content.ts:10`
`Record<string, string|undefined>` → escaped `data-<kebab>` attrs on `#root`; `data-page` carries the page id; 32-char nonce + strict CSP.

### Welcome state keys 🟢 — `workspace-state.ts:12`
`WelcomeStateKeys = { HAS_SHOWN: 'gatomia.welcomeScreen.hasShown', DONT_SHOW: 'gatomia.welcomeScreen.dontShow' }` (workspaceState booleans).

### `MigrationResult` 🟢 — `spec-kit-migration.ts:21`
`{ success; migratedSpecs: number; backupPath: string|null; errors: string[] }`. Backup dir: `.openspec-backup-<iso-timestamp>`.

### Preview telemetry metrics 🟢 — `telemetry.ts:23-91`
`PreviewLoadMetrics`, `DiagramRenderMetrics` (`language: 'mermaid'|'c4'|'plantuml'|'other'`), `FormInteractionMetrics` (`fieldType`, `interactionType`), `RefinementRequestMetrics` (`issueType`), and `PerformanceSummary` (avg/median/p95, under-3s %, diagram success rate, `byDocumentType` map). `TelemetryStore` cap = 1000/type.

---

## Module: `prompts`

> Prompt templates as data: a YAML-frontmatter authoring format compiled to TypeScript data modules. No runtime entities — the shapes below are the prompt module contract consumed by `PromptLoader`.

### Compiled prompt module 🟢 — `target/<name>.ts`
Each generated file exports:
- `frontmatter` — `{ id?: string; name: string; description: string; version: string; variables: Record<string, { type?: string; required?: boolean; description?: string }> }`.
- `content` — `string` (the Handlebars template body, JSON-escaped in the generated file).
- `default` — `{ frontmatter, content }`.

`target/index.ts` re-exports: `example`, `specKitPlan`, `specKitSpecify`, `specKitTasks`.

### Built-in prompt frontmatter 🟢
| Prompt | name | version | variables |
|--------|------|---------|-----------|
| `example` | "Example Prompt" | 1.0.0 | `name` (string, required) |
| `spec-kit-specify` | "SpecKit Specify" | 1.0.0 | `context` (required) |
| `spec-kit-plan` | "SpecKit Plan" | 1.0.0 | `spec` (required) |
| `spec-kit-tasks` | "SpecKit Tasks" | 1.0.0 | `plan` (required) |

(Matches `PromptTemplate` / `PromptFrontmatter` documented under `services` → `prompt-loader.ts`.)

---

# Webview data structures (`ui/src/`)

> In-memory React state and `postMessage` payload shapes. The chat-message and session types are hand-maintained **mirrors** of the extension contract (see the extension `agent-chat` section above); only webview-only projections and store shapes are detailed here.

## Module: `webview-agent-chat`

### `AgentChatBridgeState` 🟢 — `hooks/use-session-bridge.ts:42`
The single `useReducer` store backing the whole feature (all fields `readonly`).
| Field | Type | Notes |
|-------|------|-------|
| `ready` | `boolean` | Flips true on first `session/loaded` or `session/cleared`. |
| `session` | `AgentChatSessionView \| undefined` | Active session projection; `undefined` ⇒ empty composer (sidebar). |
| `messages` | `readonly ChatMessage[]` | Transcript; appends are `Set`-deduped by `id`. |
| `availableModes` / `availableModels` / `availableTargets` | descriptor arrays | Selector catalogues for the active session. |
| `hasArchivedTranscript` | `boolean` | Older turns offloaded to JSONL on the host. |
| `catalog` | `AgentChatCatalog` | Sidebar-only provider/agent-file catalogue. |
| `sessions` | `readonly SidebarSessionListItem[]` | Sidebar recent-session list. |
| `clearedReason` | `ClearReason \| undefined` | `new-session-requested` \| `ready-no-binding` \| `session-not-found`. |
| `pendingWrites` | `readonly PendingFileWriteSummary[]` | Awaiting Accept/Reject. |
| `permissionDefault` | `PermissionDefaultMode \| undefined` | `ask`\|`allow`\|`deny`; `undefined` ⇒ implicit `ask`. |
| `modelsLoading` | `Record<string, boolean>` | Per-provider in-flight model-probe markers. |

### `AgentChatBridge` 🟢 — `hooks/use-session-bridge.ts:73`
Imperative API returned by the hook: `state` + 18 dispatchers — `submit`, `cancel`, `retry`, `changeMode/Model/ThinkingLevel/AgentRole/Target`, `switchSession`, `startNewSession`, `requestNewChat`, `accept/rejectPendingWrite(All)`, `changePermissionDefault`, `probeModels`.

### `BridgeAction` (reducer union) 🟢 — `hooks/use-session-bridge.ts:137`
11 variants: `session/loaded`, `messages/appended`, `messages/updated`, `session/lifecycle-changed`, `session/cleared`, `catalog/loaded`, `session/models-changed`, `sessions/list-changed`, `pending-writes/changed`, `permission-default/changed` (translated 1:1 from the `agent-chat/*` incoming messages).

### `AgentChatSessionView` (projection) 🟢 — `types.ts:281`
Host→webview session projection. Key fields: `id`, `source` (`acp`\|`cloud`), `agentId`, `agentDisplayName`, `selectedModeId?`, `selectedModelId?`, `availableModels?`, `currentModelId?`, `selectedThinkingLevelId?`, `selectedAgentRoleId?`, `availableThinkingLevels?`, `availableAgentRoles?`, `executionTarget: ExecutionTargetView`, `lifecycleState`, `acceptsFollowUp`, `isReadOnly` (true for cloud), `worktree?{path,branch,status}`, `cloud?{providerId,providerDisplayName,externalUrl?}`.

### `AgentChatCatalog` + options 🟢 — `types.ts:377`
- `AgentChatCatalog` = `{ providers: AgentChatProviderOption[]; agentFiles: AgentChatAgentFileOption[] }`.
- `AgentChatProviderOption` (`:349`): `id`, `displayName`, `description?`, `availability` (`installed`\|`available-via-npx`\|`install-required`), `enabled`, `source` (`built-in`\|`local`\|`remote`), `npxPackage?`, `installUrl?`, `models: ModelDescriptor[]`, `thinkingLevels: ThinkingLevelDescriptor[]`, `agentRoles: AgentRoleDescriptor[]`.
- `AgentChatAgentFileOption` (`:369`): `id`, `displayName`, `description?`, `source` (`file`\|`extension`), `absolutePath?`.

### `SidebarSessionListItem` 🟢 — `types.ts:382`
`id`, `agentDisplayName`, `lifecycleState`, `updatedAt`, `selectedModeId?`, `selectedModelId?`, `isTerminal`, `title?` (derived from first user prompt; falls back to `agentDisplayName`).

### `NewSessionRequest` 🟢 — `types.ts:409`
Empty-composer submit payload: `providerId`, `modelId?`, `agentFileId?`, `thinkingLevelId?`, `agentRoleId?`, `taskInstruction`. Host translates to `gatomia.agentChat.startNew`.

### `ComposerSelection` 🟢 — `new-session-composer.tsx:70`
Local composer state: `providerId?`, `modelId?`, `agentFileId?`, `thinkingLevelId?`, `agentRoleId?` (sentinel `__none__` ⇒ no agent file).

### Mirror types (detailed under extension `agent-chat`) 🟢 — `types.ts`
`ChatMessage` discriminated union (`user`/`agent`/`thought`/`plan`/`system`/`tool`/`error`), `SessionLifecycleState`, `UserMessageDeliveryStatus`, `ToolCallStatus`, `SystemChatMessageKind`, `ErrorChatMessageCategory`, `ResolvedCapabilities`, `ExecutionTarget`/`View`/`Option`, `Mode`/`Model`/`ThinkingLevel`/`AgentRoleDescriptor`, `PendingFileWriteSummary`, `PermissionDefaultMode`, `ProviderAvailability`. These are kept byte-compatible with the extension declarations (`types.ts:8`).

## Module: `webview-spec-explorer`

### `SpecExplorerState` 🟢 — `stores/spec-explorer-store.ts:4`
`{ reviewSpecs: Specification[]; archivedSpecs: Specification[] }` — the observable store split into two review lanes.

### `Specification` (service local copy) 🟢 — `services/spec-explorer.ts:15`
| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | |
| `title` | `string` | |
| `owner` | `string` | |
| `status` | `SpecStatus` | `current` \| `readyToReview` \| `reopened` |
| `completedAt` | `Date \| null` | |
| `updatedAt` | `Date` | |
| `links` | `{ specPath: string; docUrl?: string }` | |
| `changeRequests` | `ChangeRequest[]` | optional |

> ⚠️ The store (`spec-explorer-store.ts:2`) and review components (`change-request-form.tsx:11`, `ready-to-review-list.tsx:9`) import `Specification`/`ChangeRequest*` directly from `src/features/spec/review-flow/types`; the **service** keeps a parallel local copy. Two definitions of the same shape coexist.

### `ChangeRequest` (service local copy) 🟢 — `services/spec-explorer.ts:26`
`id`, `specId`, `title`, `description`, `severity: ChangeRequestSeverity`, `status: ChangeRequestStatus`, `tasks: any[]`, `submitter`, `createdAt: Date`, `updatedAt: Date`, `sentToTasksAt: Date | null`, `notes?`.

### Enums 🟢 — `services/spec-explorer.ts:7-13`
- `SpecStatus` = `current` \| `readyToReview` \| `reopened`.
- `ChangeRequestStatus` = `open` \| `blocked` \| `inProgress` \| `addressed`.
- `ChangeRequestSeverity` = `low` \| `medium` \| `high` \| `critical`.

### `SpecExplorerMessage` (union) 🟢 — `services/spec-explorer.ts:44`
8 variants: `ready-to-review:fetch`, `ready-to-review:specs-updated`, `changes:fetch`, `changes:updated`, `change-request:file`, `change-request:submit`, `change-request:submitted`, `spec:navigate`.

### `ChangeRequestFormValues` / `ExistingChangeRequest` 🟢 — `change-request-form.tsx:13` / `:20`
- `ChangeRequestFormValues`: `title`, `description`, `severity: ChangeRequestSeverity`, `submitter?`.
- `ExistingChangeRequest`: `id`, `title`, `severity`, `status` (used for duplicate detection).

### Create-spec types 🟢 — `features/create-spec-view/types.ts`
- `CreateSpecFormData` = `{ description: string }`.
- `ImageAttachmentMeta` = `{ id; uri; name; dataUrl }`.
- `CreateSpecDraftState` = `{ formData: CreateSpecFormData; lastUpdated: number }` (persisted via `vscode.setState`).
- `CreateSpecInitPayload` = `{ shouldFocusPrimaryField: boolean; draft?: CreateSpecDraftState }`.
- `CreateSpecExtensionMessage` (host→webview, 7 variants): `init`, `submit:success`, `submit:error`, `confirm-close`, `focus`, `import-markdown:result`, `attach-images:result`.

### Create-steering types 🟢 — `features/create-steering-view/types.ts`
- `CreateSteeringFormData` = `{ summary; audience; keyPractices; antiPatterns }` (all `string`; only `summary` required).
- `CreateSteeringDraftState`, `CreateSteeringInitPayload` (mirror the create-spec shapes).
- `CreateSteeringFieldErrors` = `{ summary? }`.
- `CreateSteeringExtensionMessage` (host→webview, 5 variants) + `CreateSteeringWebviewMessage` (webview→host: `submit`, `autosave`, `close-attempt`, `cancel`, `ready`).

## Module: `webview-hooks-view`

> Mirrors the extension `hooks` data model (`features/hooks-view/types.ts:1`). The system has no DB; hooks persist in `workspaceState` on the host.

### `Hook` 🟢 — `features/hooks-view/types.ts:302`
| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | host-assigned |
| `name` | `string` | |
| `enabled` | `boolean` | |
| `trigger` | `TriggerCondition` | legacy single-trigger |
| `events` | `EventSource[]` | newer multi-event model |
| `conditions` | `Condition[]` | branch / file-exists / custom guards |
| `schedule` | `Schedule` | immediate / delayed / cron |
| `action` | `ActionConfig` | the action to run |
| `createdAt` / `modifiedAt` | `number` | epoch ms |
| `lastExecutedAt` | `number?` | |
| `executionCount` | `number` | |

### `ActionConfig` + `ActionParameters` (union) 🟢 — `types.ts:263` / `:255`
`ActionConfig = { type: ActionType; parameters: ActionParameters }`. `ActionType` = `agent` \| `git` \| `github` \| `custom` \| `mcp` \| `acp`. Params:
- `AgentActionParams`: `command`.
- `GitActionParams`: `operation` (commit/push/create-branch/checkout-branch/pull/merge/tag/stash), `messageTemplate`, `pushToRemote?`, `branchName?`, `tagName?`, `tagMessage?`, `stashMessage?`.
- `GitHubActionParams`: `operation` (11: open/close-issue, create/merge/close-pr, add-comment, add/remove-label, request-review, assign-issue, create-release), `repository?`, `titleTemplate?`, `bodyTemplate?`, `issueNumber?`, `prNumber?`, `mergeMethod?`, `labels?`, `reviewers?`, `assignees?`, release fields.
- `CustomActionParams`: `agentId?`, `agentName?` (deprecated), `agentType?` (local/background), `prompt?`, `selectedTools?`, `arguments?` (`$var` template), `cliOptions?: CopilotCliOptions`.
- `MCPActionParams`: `modelId?`, `prompt`, `selectedTools: SelectedMCPTool[]`, legacy `serverId/serverName/toolName/...`, `parameterMappings?`, `timeout?`.
- `ACPActionParams`: `mode: "local"`, `agentCommand`, `agentDisplayName?`, `taskInstruction` (`$var`), `cwd?`.

### `CopilotCliOptions` 🟢 — `types.ts:97`
Large flat config of GitHub Copilot CLI flags grouped into: directory/path, tool permissions (`allowAllTools`, `allowTool[]`, `denyTool[]`, …), URL permissions, GitHub MCP server toggles, MCP server config, execution (`agent`, `modelId`, `noAskUser`, …), output/logging (`silent`, `logLevel: CopilotLogLevel`, …), session (`resume`, `continue`, `share`, …), config, and `allowAll`.

### `TriggerCondition` / `EventSource` / `Condition` / `Schedule` 🟢 — `types.ts:23/275/289/296`
- `TriggerCondition`: `agent: AgentType`, `operation: OperationType`, `timing: "before"|"after"`, `waitForCompletion?` (before-only).
- `EventSource`: `type: EventSourceType` (agent-operation/execution-flow/repository/file-change/manual) + variant fields (`flowEvent`, `hookId`, `pattern`, …).
- `Condition`: `type: branch|file-exists|custom` + `pattern?`/`filePath?`/`expression?`.
- `Schedule`: `type: immediate|delayed|cron` + `delayMs?`/`cronExpression?`.

### MCP + ACP types 🟢 — `types.ts` / `hooks/use-mcp-servers.ts`
- `SelectedMCPTool`: `serverId`, `serverName`, `toolName`, `toolDisplayName`.
- `MCPServer` (`use-mcp-servers.ts:12`): `id`, `name`, `description`, `status` (available/unavailable/unknown), `tools: MCPTool[]`, `lastDiscovered`.
- `MCPTool`: `name`, `displayName`, `description`, `inputSchema: JSONSchema`, `serverId`.
- `MCPToolOption` / `MCPProviderGroup` (UI-only): selection-enriched tool + provider group (`isOther?` for orphans).
- `ACPAgentDescriptor`: `agentCommand`, `agentDisplayName`, `source` (workspace/known/custom), `knownAgentId?`.
- `KnownAgentStatus`: `id`, `displayName`, `agentCommand`, `enabled`, `isDetected`, `descriptor: ACPAgentDescriptor | null`.

### Execution logs 🟢 — `types.ts:317-345`
- `HookExecutionStatusState` = `executing` \| `completed` \| `failed`; `HookExecutionStatusPayload` (+ `Entry` adds `updatedAt`).
- `ExecutionStatus` = `success` \| `failure` \| `skipped` \| `timeout`.
- `HookExecutionLog`: `id`, `hookId`, `executionId`, `chainDepth`, `triggeredAt`, `completedAt?`, `duration?`, `status`, `error?{code?,message}`, `contextSnapshot: Record<string,unknown>`.

### Message unions 🟢 — `types.ts:389/461`
- `HooksExtensionMessage` (host→webview, 14 variants): `sync`, `created`, `updated`, `deleted`, `error`, `execution-status`, `logs`, `show-form`, `show-logs`, `models-available`, `models-error`, `acp-agents-available`, `acp-known-agents-status`.
- `HooksWebviewMessage` (webview→host, 10 variants): `ready`, `list`, `create`, `update`, `delete`, `toggle`, `logs`, `models-request`, `acp-agents-request`, `acp-known-agents-request`/`-toggle`.
- Every variant carries both a `type` (`hooks/x`) and optional `command` (`hooks.x`) key.

### Enums 🟢 — `types.ts`
`AgentType` (speckit/openspec), `OperationType` (14 ops), `TriggerTiming`, `ActionType` (6), `EventSourceType` (5), `CopilotLogLevel` (7), `ACPExecutionMode` (`local`).

## Module: `webview-orchestration`

> View-model structures for the orchestration / monitoring surfaces. The composer reuses `webview-hooks-view`'s `Hook` types; the Kanban board reuses the extension `tasks` `NormalizedTask`.

### `OrchestrationSession` / `Snapshot` 🟢 — `features/orchestration/index.tsx:14/33`
- `OrchestrationSession`: `id`, `source` (`agent-chat`\|`cloud-agent`), `sourceSessionId`, `title`, `agentName`, `state`, `bucket` (`active`\|`waiting`\|`completed`\|`failed`), `createdAt`, `updatedAt`, `endedAt?`, `lastVisibleActivityAt`, `isBlocked`, `worktreeStatus?`, `executionTargetLabel?`, `externalUrl?`, `cloudProviderId?`.
- `Snapshot`: `sessions: OrchestrationSession[]`, `cloudProviderRegistryAvailable`, `cloudProviderCount`, `activeProvider?{id,displayName}`, `generatedAt`, `degradedReasons: string[]`.

### React Flow graph model 🟢 — `workflow-composer/utils/mapper.ts`
- `Node` (`@xyflow/react`): `id` (`hook-<id>-event-<i>` / `-condition-<i>` / `-schedule` / `-action`), `type` (`source`\|`condition`\|`schedule`\|`action`), `position{x,y}`, `data{label,description,hookId,nodeType,status?,raw}`.
- `Edge`: `id` (`edge-<src>-<tgt>`), `source`, `target`.
- Layout constants: `X_SPACING=300`, `Y_SPACING=150`; hook lane offset `hookIndex*Y_SPACING*3`.

### `AgentSessionView` (cloud-agent-store) 🟢 — `stores/cloud-agent-store.ts:18`
| Field | Type | Notes |
|-------|------|-------|
| `localId` / `providerId` | `string` | |
| `status` / `displayStatus` | `string` | raw + provider-formatted |
| `branch` / `specPath` | `string` | |
| `externalUrl` | `string?` | |
| `createdAt` / `updatedAt` | `number` | epoch ms |
| `isReadOnly` | `boolean` | |
| `tasks` | `AgentTaskView[]` | `{taskId,specTaskId,title,priority,status,progress?}` |
| `pullRequests` | `PullRequestView[]` | `{url,state,number?,title?}` |

- `CloudAgentState`: `sessions`, `activeProvider: {id,displayName}\|null`, `isLoading`, `error`.

### `DevinSessionView` (devin-store) 🟢 — `stores/devin-store.ts:16`
All-`readonly` view model: `localId`, `sessionId`, `status`, `branch`, `specPath`, `devinUrl?`, `errorMessage?`, `retryCount`, `createdAt`, `updatedAt`, `completedAt?`, `tasks: DevinTaskView[]`, `pullRequests: DevinPrView[]`.
- `DevinTaskView`: `taskId`, `specTaskId`, `title`, `description`, `priority`, `status`, `startedAt?`, `completedAt?`.
- `DevinPrView`: `prUrl`, `prState?`, `branch`, `createdAt`.
- `DevinStoreState`: `sessions: DevinSessionView[]`, `isLoading`.

## Module: `webview-preview`

> Document-preview view models + interactive-form state. Persisted nowhere client-side; the host owns the source documents.

### `DocumentArtifact` / `PreviewDocumentPayload` 🟢 — `features/preview/types.ts:31/56`
| Field | Type | Notes |
|-------|------|-------|
| `documentId` / `documentType` / `title` | `string` | |
| `filePath` / `version` / `owner` / `updatedAt` | `string?` | footer metadata |
| `renderStandard` | `string?` | `code` → raw `CodePreview` |
| `rawContent` | `string?` | for code mode |
| `sessionId` | `string?` | form submission scope |
| `isOutdated` | `boolean?` | shows update banner |
| `outdatedInfo` | `{outdatedSince:number, changedDependencies:{documentId,documentType}[]}?` | |
| `sections` | `PreviewSectionPayload[]?` | `{id,title,body?}` |
| `forms` | `PreviewFormField[]?` | interactive fields |
| `permissions` | `{canEditForms:boolean, reason?}?` | read-only gate |
| `metadata` | `Record<string,unknown>?` | e.g. `language` |

### `FormField` / `FormFieldState` 🟢 — `features/preview/stores/form-store.ts:25/36`
- `FormField`: `fieldId`, `label`, `type: checkbox\|dropdown\|text\|textarea\|multiselect`, `options?`, `required?`, `value?: string\|string[]`, `validationRules?: Record<string,unknown>` (`minLength`/`maxLength`/`pattern`/`patternMessage`), `readOnly?`.
- `FormFieldState` extends `FormField` + `dirty: boolean`, `errors: string[]`.
- `FormStoreSnapshot`: `documentId?`, `sessionId?`, `fields: Map<string,FormFieldState>`, `isSubmitting`, `lastSubmittedAt?`, `validationErrors: {fieldId,message}[]`, `readOnlyMode`, `readOnlyReason?`.

### Refinement + form payloads 🟢 — `types.ts:58/74`
- `PreviewRefinementPayload`: `requestId`, `documentId`, `documentType`, `documentVersion?`, `sectionRef?`, `issueType` (`missingDetail`\|`incorrectInfo`\|`missingAsset`\|`other`), `description`, `submittedAt`, `actionType?` (`refine`\|`update`), `changedDependencies?`.
- `PreviewFormSubmissionPayload`: `requestId`, `documentId`, `sessionId`, `fields: {fieldId,value,dirty}[]`, `submittedAt`.
- `SubmitRefinementResult` / `FormSubmissionResult`: `requestId`, `status` (`success`\|`error`), `message?`.

### Message unions 🟢 — `types.ts:82/102`
- `PreviewExtensionMessage` (host→webview): `load-document`, `show-placeholder`, `forms/result`, `refine/result`.
- `PreviewWebviewMessage` (webview→host): `ready`, `request-reload`, `open-in-editor`, `edit-attempt`, `forms/submit`, `refine/submit`, `execute-task-group`, `open-file`.

## Module: `webview-welcome`

> Onboarding state model (mirrors `specs/006-welcome-screen` data-model). Held in a Zustand store; the host owns the source of truth.

### `WelcomeScreenState` 🟢 — `types.ts:166`
| Field | Type | Notes |
|-------|------|-------|
| `hasShownBefore` / `dontShowOnStartup` | `boolean` | |
| `currentView` | `ViewSection` (`setup`\|`features`\|`configuration`\|`status`\|`learning`) | active tab |
| `ideHost` | `IdeHost` | 8: windsurf/antigravity/cursor/vscode/vscode-insiders/vscodium/positron/unknown |
| `dependencies` | `DependencyStatus` | tool detection |
| `configuration` | `ConfigurationState` | editable settings |
| `diagnostics` | `SystemDiagnostic[]` | capped at 5 |
| `learningResources` | `LearningResource[]` | |
| `featureActions` | `FeatureAction[]` | |
| `extensionVersion` / `vscodeVersion` | `string?` | |

### `DependencyStatus` 🟢 — `types.ts:41`
Per-tool `{installed, version, active?}`: `copilotChat`, `speckit`, `openspec`, `copilotCli`, `gatomiaCli`; optional ACP CLIs `devinCli?`/`geminiCli?` (`AcpCliStatus` adds `authenticated?`/`acpSupported?`); optional `prerequisites?: Record<'node'|'python'|'uv', {installed,version}>`; `lastChecked: number`.

### `ConfigurationState` / `ConfigurationItem` 🟢 — `types.ts:90/99`
`ConfigurationItem`: `key`, `label`, `currentValue: string\|boolean`, `editable`, `options?`, `description?`. State groups: `specSystem` (`auto`\|`speckit`\|`openspec`), `speckitSpecsPath`, `speckitMemoryPath`, `speckitTemplatesPath`, `openspecPath`, `promptsPath`, `otherSettings[]`.

### `SystemDiagnostic` / `LearningResource` / `FeatureAction` 🟢 — `types.ts:112/126/156`
- `SystemDiagnostic`: `id`, `timestamp`, `severity` (`error`\|`warning`), `message`, `source`, `suggestedAction: string\|null`.
- `LearningResource`: `id`, `title`, `description`, `url`, `category` (`Getting Started`\|`Advanced Features`\|`Troubleshooting`), `keywords[]`, `estimatedMinutes: number\|null`.
- `FeatureAction`: `id`, `featureArea: FeatureArea` (9: Specs/SpecKit Workflow/Actions/Hooks/Steering/Cloud Agents/Chat Provider/Documentation/Configuration), `label`, `description`, `commandId`, `enabled`, `icon?`.

### `RequirementProfile` 🟢 — `requirements.ts:14`
`{required: DepKey[], optional: DepKey[], hidden: DepKey[], specSystemReady: boolean, missing: DepKey[]}` where `DepKey = InstallableDependency` (`copilot-chat`\|`speckit`\|`openspec`\|`copilot-cli`\|`gatomia-cli`\|`devin-cli`\|`gemini-cli`). ⚠️ Mirror of `src/services/welcome/requirements.ts`.

### Enums + install order 🟢 — `types.ts` / `requirements.ts:77`
`InstallStatus` (`started`\|`running`\|`finished`\|`error`), `ResourceCategory` (3), `SystemPrerequisiteKey` (`node`\|`python`\|`uv`). `INSTALL_ORDER`: copilot-chat 0 → CLIs (copilot/devin/gemini) 1 → speckit/openspec 2 → gatomia-cli 3.

## Module: `webview-shared`

> Cross-cutting infra contracts — minimal data, mostly types.

### `VsCodeApi` 🟢 — `bridge/vscode.ts:3`
`{ postMessage(message:any):void; getState():any; setState(state:any):void }`. Resolved from `window.acquireVsCodeApi()` or a dev echo stub.

### `SupportedPage` 🟢 — `page-registry.tsx:52`
String union of 11 routable pages: `simple`, `interactive`, `create-spec`, `create-steering`, `hooks`, `document-preview`, `welcome-screen`, `agent-chat`, `orchestration`, `workflow-composer`. (🔴 `devin-progress`/`cloud-agent-progress`, requested by their panels, are **not** members.)

### Primitive prop contracts 🟢
- `buttonVariants` (CVA): `variant` (default/destructive/outline/secondary/ghost/link) × `size` (default/sm/lg/icon).
- `VSCodeSelectProps` / `VSCodeCheckboxProps`: `label?`, `required?`, `description?`, `error?`, `size` (sm/md/lg); checkbox adds `indeterminate?`.
- `TextareaPanelProps`: `value`, `onChange`, `onKeyDown?`, `rows?`, refs + class overrides, `children` (footer slot).
