# hooks — Contracts (trigger taxonomy, actions, variables, MCP)

> Optional artifact (`doc_level=completo`). The configuration contracts a Hook is built from.
> Source: `types.ts`, `template-variable-constants.ts`. Confidence: 🟢.

## 1. Trigger taxonomy

| Dimension | Values |
|-----------|--------|
| `AgentType` (`types.ts:91`) | `speckit` \| `openspec` \| `orchestration` |
| `OperationType` (`:96`, 15) | research, datamodel, design, specify, clarify, plan, tasks, taskstoissues, analyze, checklist, constitution, implementation, unit-test, integration-test, **task-completed**, **task-failed** |
| `TriggerTiming` (`:134`) | `before` \| `after` |

`EventSource` (`:54`) types: `agent-operation`, `execution-flow` (`flowEvent: success/failure/timeout`), `repository`, `file-change` (`pattern`), `manual`. 🟢

> `orchestration` + `task-completed`/`task-failed` are fired by the autonomous loop (see `orchestration/`). 🟢

## 2. Action types + parameters

`ActionConfig { type: ActionType; parameters }`, `ActionType ∈ {agent, git, github, mcp, custom, acp}`. 🟢

| Action | Params (`types.ts`) | Key fields |
|--------|---------------------|-----------|
| `agent` | `AgentActionParams` (:173) | `command` |
| `git` | `GitActionParams` (:180) | `operation` (commit/push/create-branch/checkout-branch/pull/merge/tag/stash), `messageTemplate`, `pushToRemote?`, `branchName?`, `tagName?` |
| `github` | `GitHubActionParams` (:206) | `operation` (open/close-issue, create/merge/close-pr, add/remove-label, request-review, assign-issue, create-release), `repository?`, `titleTemplate?`, `bodyTemplate?`, `mergeMethod?` |
| `mcp` | `MCPActionParams` (:384) | `modelId?`, `prompt`, `selectedTools: SelectedMCPTool[]`, `parameterMappings?`, `timeout?` (legacy `serverId`/`toolName`) |
| `custom` | `CustomActionParams` (:244) | `agentId?`, `agentType?` (local/background), `prompt?`, `selectedTools?`, `arguments?`, `cliOptions?` (legacy `agentName`) |
| `acp` | `ACPActionParams` (:283) | `mode:'local'`, `agentCommand`, `taskInstruction`, `cwd?` |

## 3. Length / safety constants (`types.ts:556-583`)

`MAX_HOOK_NAME_LENGTH=100`, `MAX_COMMAND_LENGTH=200`, `MAX_MESSAGE_TEMPLATE_LENGTH=500`, `MAX_BODY_TEMPLATE_LENGTH=5000`, `MAX_ARGUMENTS_LENGTH=1000`, `MAX_CHAIN_DEPTH=10`, `MAX_EXECUTION_LOGS=100`, `ACTION_TIMEOUT_MS=30000`, `MAX_TRIGGER_HISTORY=50`, `MCP_DISCOVERY_CACHE_TTL=300000`, `MCP_DEFAULT_TIMEOUT=30000`, `MCP_MIN_TIMEOUT=1000`, `MCP_MAX_TIMEOUT=300000`, `MCP_MAX_CONCURRENT_ACTIONS=5`. 🟢

## 4. Template variables (`template-variable-constants.ts`)

`TemplateVariable { name; description; category; valueType; availableFor: OperationType[] }`. Substitution regex `/\$([a-zA-Z_][a-zA-Z0-9_]*)\b/g`; missing → empty string; `availableFor: []` = all triggers. 🟢

Seven category arrays: `STANDARD_VARIABLES` (`$timestamp`, `$branch`, `$user`, `$feature`), `SPEC_VARIABLES`, `SPEC_ARTIFACT_VARIABLES`, `REPOSITORY_VARIABLES`, `AGENT_METADATA_VARIABLES`, `FILE_VARIABLES`, `OUTPUT_VARIABLES` (`$agentOutput`, `$clipboardContent`, `$outputPath`). 🟢

> ⚠️ `availableFor` gating is **not enforced** at parse time today — `validateVariables` is a stub (see `questions.md`). 🔴

## 5. MCP entities (`types.ts`)

- `SelectedMCPTool` (:402) `{ serverId, serverName, toolName, toolDisplayName }`
- `ParameterMapping` (:412) `{ toolParam, source: context|literal|template, value }`
- `MCPServer` (:426) `{ id, name, status: ServerStatus, tools: MCPTool[], lastDiscovered }`
- `MCPTool` (:438) `{ name, displayName, description, inputSchema: JSONSchema, serverId }`

MCP discovery via `vscode.lm.tools`; execution via `vscode.lm.invokeTool`; bounded concurrency 5; TTL 5 min. 🟢

## 6. Execution result contract

`HookExecutionLog` (`types.ts:472`) `{ id, hookId, executionId, chainDepth, triggeredAt, completedAt?, duration?, status: ExecutionStatus(success/failure/skipped/timeout), error?: ExecutionError, contextSnapshot: TemplateContext }`. 🟢
