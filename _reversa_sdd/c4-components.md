# C4 Model — Level 3: Components — gatomia

> Produced by the Reversa Architect (interpretation phase).
> Confidence: 🟢 CONFIRMED from code · 🟡 INFERRED · 🔴 GAP.
> The Extension Host and Webview SPA are decomposed below, grouped by **bounded context** (`domain.md` §2) to keep each diagram legible. File paths are relative to `src/` or `ui/src/`.

---

## A. Conversational Agents context (`agent-chat`, `agents`, `services/acp`) 🟢

```mermaid
C4Component
    title Components — Conversational Agents

    Person(dev, "Developer", "")

    Container_Boundary(ca, "Conversational Agents") {
        Component(provider, "AgentChatViewProvider", "providers", "Sidebar webview-view + message bridge; single source of truth for panel↔session binding")
        Component(panel, "AgentChatPanel", "panels", "Per-session editor panel; handles agent-chat/* protocol")
        Component(commands, "AgentChatCommands", "commands", "newSession, cancel, change mode/model/target, worktree cleanup")
        Component(runner, "AcpChatRunner", "agent-chat", "Core event loop: ACP events → transcript mutations; turn & follow-up queue")
        Component(registry, "AgentChatRegistry", "agent-chat", "In-memory index of live sessions/panels/runners; concurrency cap; shutdown stamp")
        Component(store, "AgentChatSessionStore", "agent-chat", "Manifest + transcript persistence; archival (>10k / >2MB); retention (100)")
        Component(caps, "AgentCapabilitiesService", "agent-chat", "Hybrid capability resolver (agent-reported wins over catalog)")
        Component(models, "ModelDiscoveryService", "agent-chat", "Model list w/ 5-min TTL & fallback chain")
        Component(worktree, "AgentWorktreeService", "agent-chat", "Worktree lifecycle; destructive cleanup confirmation")
        Component(pending, "PendingWritesStore", "agent-chat", "Buffers writeTextFile; accept/reject gate")
        Component(participants, "ChatParticipantRegistry", "agents", "Registers .agent.md as Copilot chat participants; routes tool calls")
        Component(loader, "AgentLoader", "agents", "Parses & validates .agent.md frontmatter; auto-injects /help")
        Component(acpclient, "AcpClient", "services/acp", "Spawns CLI subprocess; JSON-RPC; permission resolution")
        Component(acpmgr, "AcpSessionManager", "services/acp", "One client per (providerId, cwd); npx spawn consent gate")
    }

    System_Ext(acp_cli, "Local ACP CLI Agents", "subprocess")

    Rel(dev, provider, "Chats", "webview")
    Rel(provider, registry, "Binds session", "")
    Rel(panel, runner, "Attaches", "")
    Rel(commands, store, "CRUD", "")
    Rel(commands, worktree, "Create/clean", "")
    Rel(runner, acpmgr, "Drives session", "")
    Rel(runner, caps, "Resolves", "")
    Rel(runner, models, "Resolves", "")
    Rel(runner, pending, "Buffers writes", "")
    Rel(runner, store, "Appends transcript", "")
    Rel(participants, loader, "Loads defs", "")
    Rel(acpmgr, acpclient, "Owns", "")
    Rel(acpclient, acp_cli, "Spawns & drives", "JSON-RPC/stdio")
```

| Component | Responsibility |
|-----------|----------------|
| `AgentChatViewProvider` | Canonical sidebar provider + bidirectional bridge; one-panel-per-session authority (R-AC-11) |
| `AcpChatRunner` | Subscribes to ACP session events, maps to transcript, manages turn/follow-up queue & lifecycle (R-AC-2) |
| `AgentChatSessionStore` | Manifest + transcript CRUD; archival >10k msg / >2 MB (R-AC-4); retention 100 (R-AC-5) |
| `AgentChatRegistry` | Live session/panel/runner index; concurrency cap; `ended-by-shutdown` stamp (R-AC-6) |
| `AgentCapabilitiesService` | Negotiates modes/models — agent-reported wins (R-AC-7) |
| `AgentWorktreeService` | Worktree create/inspect/clean; two-step destructive confirm (R-AC-9) |
| `PendingWritesStore` | Buffers `writeTextFile` and blocks until accept/reject |
| `ChatParticipantRegistry` / `AgentLoader` | Register `.agent.md` as Copilot participants; validation (R-AC-10) |
| `AcpClient` / `AcpSessionManager` | ACP subprocess runtime; permission resolution; npx consent (R-X-5) |

---

## B. Cloud Delegation context (`cloud-agents`, `devin`) 🟢🔴

```mermaid
C4Component
    title Components — Cloud Delegation (two coexisting paths)

    Container_Boundary(cloud, "cloud-agents (provider-agnostic)") {
        Component(cloudcmd, "CloudAgentCommands", "commands", "selectProvider, dispatchTask/FullSpec, cancel, refresh")
        Component(cloudprov, "ProviderRegistry", "cloud-agents", "Register/activate/restore providers; one active at a time")
        Component(polling, "AgentPollingService", "cloud-agents", "Grace window, 3-failure backoff, terminal normalization, credential-expiry")
        Component(cloudstore, "AgentSessionStorage", "cloud-agents", "workspaceState CRUD + load-time normalization")
        Component(devinad, "DevinAdapter", "cloud-agents/adapters", "Devin REST impl: create/get session, status mapping, PR extraction")
        Component(ghad, "GitHubCopilotAdapter", "cloud-agents/adapters", "GitHub GraphQL: issue+agentAssignment, PR-timeline polling")
    }
    Container_Boundary(devin, "devin (legacy standalone)") {
        Component(devincmd, "DevinCommands", "commands", "startTask, configureCredentials, cancel, openProgress")
        Component(devinmgr, "DevinSessionManager", "devin", "startTask/startTaskGroup, prompt build, persistence")
        Component(devinpoll, "DevinPollingService", "devin", "Polls active+recent; PR-state change → tasks.md checkbox")
        Component(devincreds, "DevinCredentialsManager", "devin", "SecretStorage: key + metadata separate keys")
        Component(devinapi, "DevinApiClient v1/v3", "devin", "Version-specific REST clients (token-prefix selected)")
    }

    System_Ext(devin_cloud, "Devin Cloud API", "REST")
    System_Ext(copilot_agent, "Copilot Coding Agent", "GraphQL")

    Rel(cloudcmd, cloudprov, "Selects/dispatches", "")
    Rel(cloudprov, devinad, "Activates", "")
    Rel(cloudprov, ghad, "Activates", "")
    Rel(polling, cloudstore, "Updates", "")
    Rel(polling, devinad, "Polls via", "")
    Rel(polling, ghad, "Polls via", "")
    Rel(devinad, devin_cloud, "REST", "")
    Rel(ghad, copilot_agent, "GraphQL/REST", "")

    Rel(devincmd, devinmgr, "Starts", "")
    Rel(devinmgr, devincreds, "Reads key", "")
    Rel(devinmgr, devinapi, "Creates session", "")
    Rel(devinpoll, devinapi, "Polls", "")
    Rel(devinapi, devin_cloud, "REST v1/v3", "")
```

> **🔴 Ownership overlap:** both the `devin` standalone path and the `cloud-agents` → `DevinAdapter` path implement Devin session lifecycle + polling and are both wired in `extension.ts`. Which path owns polling for a given session is undetermined (ADR-0007, `domain.md` §5.1). Key Devin rules: API version by token prefix (R-CD-1), local-only cancel (R-CD-2), `statusDetail` overrides `status` (R-CD-3), rate-limit + backoff (R-CD-10), clean-repo pre-flight (R-CD-11).

---

## C. Spec Lifecycle context (`spec`, `steering`, `tasks`) 🟢

```mermaid
C4Component
    title Components — Spec Lifecycle

    Container_Boundary(sl, "Spec Lifecycle") {
        Component(specprov, "SpecExplorerProvider", "providers", "TreeDataProvider: Current / Review / Archived / Changes")
        Component(actprov, "ActionsExplorerProvider", "providers", "SpecKit/OpenSpec resource catalogs")
        Component(specmgr, "SpecManager", "spec", "Active-system detection; document CRUD; unified listing")
        Component(reviewstate, "ReviewFlowState", "spec/review-flow", "FSM: spec/CR/task states; gating; auto-review; JSON persistence")
        Component(crsvc, "ChangeRequestsService", "spec/review-flow", "Create CR w/ duplicate prevention + reopen transition")
        Component(dispatch, "dispatchToTasksPrompt", "spec/review-flow", "CR → tasks generator")
        Component(taskservice, "TaskService", "tasks", "Registers providers; resolves tasks.md via adapter")
        Component(speckitp, "SpecKitTaskProvider", "tasks", "canHandle .specify/specs/; parse+normalize")
        Component(openspecp, "OpenSpecTaskProvider", "tasks", "canHandle openspec/; parse+normalize")
        Component(steeringmgr, "SteeringManager", "steering", "Constitution / AGENTS.md / instruction rules")
        Component(consent, "GlobalResourceAccessConsent", "steering", "ask/allow/deny gate for ~/.github reads")
        Component(adapter, "SpecKitAdapter", "utils", "Unified SpecKit/OpenSpec facade")
    }

    System_Ext(sdd_fs, "SpecKit / OpenSpec", "Filesystem")
    System_Ext(copilot_chat, "Copilot Chat", "vscode.lm")

    Rel(specprov, reviewstate, "Reads status", "")
    Rel(specprov, specmgr, "Lists specs", "")
    Rel(specmgr, adapter, "Detects system", "")
    Rel(crsvc, reviewstate, "Transitions", "")
    Rel(crsvc, dispatch, "Generates tasks", "")
    Rel(taskservice, speckitp, "Delegates", "")
    Rel(taskservice, openspecp, "Delegates", "")
    Rel(taskservice, adapter, "Resolves path", "")
    Rel(steeringmgr, consent, "Gates reads", "")
    Rel(steeringmgr, copilot_chat, "Creates constitution", "")
    Rel(adapter, sdd_fs, "Reads/writes", "")
```

> Spec status FSM is strictly validated (R-SP-1); send-to-review (R-SP-2) and archive (R-SP-5) gates; auto-return (R-SP-7). **🔴 `dispatchToTasksPrompt` is a mock** (random 10% failure, hard-coded tasks). **🔴 `validateConstitution` is a stub** (always true). **🟡 Task providers are near-duplicates** (Rule of Three).

---

## D. Automation context (`hooks`) 🟢

```mermaid
C4Component
    title Components — Automation (Hooks)

    Container_Boundary(hk, "Hooks engine") {
        Component(hookprov, "HookViewProvider", "providers", "Hooks webview panel: CRUD/toggle/logs; MCP & agent discovery")
        Component(hookmgr, "HookManager", "hooks", "CRUD + workspaceState persistence; sync/async validation; migration")
        Component(executor, "HookExecutor", "hooks", "Trigger match → availability → conditions → schedule → action dispatch; chain/cycle guards")
        Component(triggers, "TriggerRegistry", "hooks", "EventEmitter for triggers; FIFO history (max 50)")
        Component(tmpl, "TemplateVariableParser", "hooks", "$variable extraction/substitution/validation")
        Component(mcp, "MCPClient", "hooks/services", "MCP discovery + tool execution; concurrency cap 5")
        Component(detector, "CommandCompletionDetector", "hooks", "FS-watcher completion detection + 2s debounce")
    }

    System_Ext(mcp_srv, "MCP Servers", "vscode.lm.tools")

    Rel(hookprov, hookmgr, "CRUD", "")
    Rel(triggers, executor, "Fires", "")
    Rel(executor, hookmgr, "Matches hooks", "")
    Rel(executor, tmpl, "Substitutes vars", "")
    Rel(executor, mcp, "Invokes (mcp action)", "")
    Rel(detector, triggers, "Emits completion", "")
    Rel(mcp, mcp_srv, "Invokes tools", "vscode.lm.invokeTool")
```

> Hooks match on agent+operation+same timing (R-HK-1); blocking only `before`+`waitForCompletion` (R-HK-2); chain-depth ≤10 + cycle set (R-HK-3); action timeout 30s (R-HK-4). Actions: `agent/git/github/mcp/custom/acp`. **🟡 parallel branch still `await`s sequentially**; **🔴 `validateVariables` is a stub**.

---

## E. Orchestration context (MAESTRO — `orchestration`, `tasks`) 🟡🔴

```mermaid
C4Component
    title Components — Orchestration (MAESTRO, prototype)

    Container_Boundary(orch, "Orchestration") {
        Component(orchprov, "OrchestrationViewProvider", "providers", "Workflow composer / Kanban surface")
        Component(runningprov, "RunningAgentsTreeProvider", "providers", "agent-chat sessions grouped active/recent/orphans")
        Component(readmodel, "OrchestrationReadModel", "orchestration", "Merges agent-chat + cloud sessions into bucketed snapshot")
        Component(loop, "AutonomousAgentLoopService", "orchestration", "claimTask → startTask (spawns agent-chat) → completion sync")
    }

    Component_Ext(registry, "AgentChatRegistry", "agent-chat", "")
    Component_Ext(cloudstore, "AgentSessionStorage", "cloud-agents", "")
    Component_Ext(triggers, "TriggerRegistry", "hooks", "")

    Rel(orchprov, readmodel, "Reads snapshot", "")
    Rel(readmodel, registry, "Aggregates", "")
    Rel(readmodel, cloudstore, "Aggregates", "")
    Rel(loop, registry, "Spawns sessions", "")
    Rel(loop, triggers, "Fires task-completed/failed", "")
```

> Read-model buckets active/waiting/completed/failed with graceful `degradedReasons` (R-OR-1, R-OR-2). **🔴 The autonomous loop is the least mature component:** it constructs a non-canonical `AgentChatSession` and detects completion by checking a non-existent `"error"` lifecycle state (`domain.md` §5.2). **🔴 Kanban board & progress pages are unmounted.**

---

## F. Webview SPA (`ui/src`) 🟢

```mermaid
C4Component
    title Components — Webview SPA

    Container_Boundary(web, "Webview SPA (React/Vite)") {
        Component(pagereg, "PageRegistry", "ui/src", "Runtime data-page → lazy component router (11 pages)")
        Component(bridge, "VsCodeBridge", "ui/src/bridge", "Shared acquireVsCodeApi() + dev echo fallback")
        Component(chatfeat, "AgentChat feature", "features/agent-chat", "useSessionBridge reducer store; InputBar; NewSessionComposer")
        Component(hooksfeat, "HooksView feature", "features/hooks-view", "Hook CRUD; TriggerActionSelector; ArgumentTemplateEditor; useMCPServers")
        Component(specfeat, "SpecExplorer feature", "features/spec-explorer", "CreateSpecView; ChangeRequestForm; own bridge instance")
        Component(orchfeat, "Orchestration feature", "features/orchestration", "Snapshot buckets; WorkflowComposer (React Flow)")
        Component(prevfeat, "Preview feature", "features/preview", "PreviewApp; FormStore; markdown-it + mermaid renderer")
        Component(welcfeat, "Welcome feature", "features/welcome", "WelcomeScreen; welcome-store (Zustand); requirement profile")
        Component(shared, "Shared UI + stores", "components/ui, stores", "Zustand stores, design-system primitives")
    }

    System_Boundary(ext, "Extension Host") {
        Component_Ext(hostbridge, "Providers & Panels", "src", "postMessage counterparties")
    }

    Rel(pagereg, chatfeat, "Mounts", "")
    Rel(pagereg, hooksfeat, "Mounts", "")
    Rel(pagereg, specfeat, "Mounts", "")
    Rel(pagereg, orchfeat, "Mounts", "")
    Rel(pagereg, prevfeat, "Mounts", "")
    Rel(pagereg, welcfeat, "Mounts", "")
    Rel(chatfeat, bridge, "send/receive", "")
    Rel(hooksfeat, bridge, "send/receive", "")
    Rel(orchfeat, bridge, "send/receive", "")
    Rel(prevfeat, bridge, "send/receive", "")
    Rel(welcfeat, bridge, "send/receive", "")
    Rel(specfeat, hostbridge, "own bridge (drift)", "window.specExplorerVscode")
    Rel(bridge, hostbridge, "postMessage", "JSON")
```

> **🟡 `SpecExplorer` uses a separate bridge** and imports `src/` types — the lone violation of the shared-bridge / no-`src/` rule (R-X-6). Other features all route through the shared `bridge/vscode.ts`.

---

## G. Shared services & ACP runtime (`src/services`) 🟢

| Component | Responsibility |
|-----------|----------------|
| `ChatRouter` | Declarative ACP-vs-Copilot routing with 60 s cache; probes host/auth (R-HK-9, R-X-4) |
| `ChatDispatcher` | Routes prompts to ACP or Copilot Chat; rewrites `/command` → natural language for ACP |
| `PromptLoader` | Loads compiled + directory prompts; Handlebars with variable validation |
| `AcpProviderRegistry` | ACP descriptor registry (built-ins + CDN); 24 h cache, 3 s timeout |
| `DependencyChecker` | Detects Copilot/CLI/SpecKit/OpenSpec/Devin/Gemini install status with TTL |
| `DocumentPreviewService` | Parses markdown/code into sectioned `DocumentArtifact` |
| `MCPClient` | MCP discovery + bounded-concurrency tool execution (R-HK-6) |

> See `traceability/spec-impact-matrix.md` for the full directed dependency map and the SDD feature lineage.
