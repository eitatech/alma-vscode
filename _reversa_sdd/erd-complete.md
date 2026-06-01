# Entity-Relationship Model — gatomia

> Produced by the Reversa Architect (interpretation phase).
> Confidence: 🟢 CONFIRMED from code · 🟡 INFERRED · 🔴 GAP.
>
> **There is no database** (ADR-0005). This is a **logical data model** of the in-memory / persisted TypeScript domain types. "Entities" are interfaces & discriminated unions; "relationships" are composition and references. Persistence backends per entity are noted in the legend. Source: `data-dictionary.md`, `domain.md`.

---

## Legend — where each aggregate lives

| Persistence | Entities (roots) |
|-------------|------------------|
| **JSON manifest + JSONL** (`.vscode/gatomia/`) | `SessionManifest` / `AgentChatSession` transcripts |
| **workspaceState** | `Hook`, `AgentSession` (cloud), review-flow state |
| **JSON file** (7-day retention) | `DevinSession` |
| **SecretStorage** | `DevinCredentials` (key + metadata, separate slots) |
| **Filesystem (markdown)** | `AgentDefinition` (`.agent.md`), `UnifiedSpec`, `SteeringDocument` |
| **In-memory only** | `OrchestrationSnapshot`, `MCPServer`, `DevinProgressEvent` |

---

## 1. Cross-context overview

The five bounded contexts are loosely coupled. The only cross-context links are: a cloud `AgentSession` may point back to an `AgentChatSession` (`chatPanelId`); both spec tasks and orchestration consume the shared `NormalizedTask` shape; and the `OrchestrationSnapshot` aggregates sessions from two contexts.

```mermaid
erDiagram
    AgentChatSession      ||--o{ ChatMessage          : "owns transcript"
    AgentChatSession      ||--o| WorktreeHandle        : "isolated by"
    AgentSession          }o--o| AgentChatSession      : "chatPanelId (optional)"
    AgentSession          ||--o{ AgentTask             : "delegates"
    DevinSession          ||--o{ DevinTask             : "delegates"
    UnifiedSpec           ||--o{ NormalizedTask        : "contains"
    UnifiedSpec           ||--o{ ChangeRequest         : "reviewed via"
    ChangeRequest         ||--o{ NormalizedTask        : "attaches"
    Hook                  ||--|| ActionConfig          : "executes"
    OrchestrationSnapshot ||--o{ Bucket                : "groups"
    Bucket                ||--o{ SessionSummary        : "lists"
    SessionSummary        }o--o{ NormalizedTask        : "reflects"
```

---

## 2. Conversational Agents 🟢

```mermaid
erDiagram
    AgentChatSession ||--o{ ChatMessage        : "owns (1:N)"
    AgentChatSession ||--o| WorktreeHandle      : "may use (1:0..1)"
    AgentChatSession ||--|| ResolvedCapabilities : "negotiates (1:1)"
    AgentChatSession ||--|| ExecutionTarget      : "runs on (1:1)"
    AgentChatSession ||--o{ PendingWrite         : "buffers (1:N)"
    SessionManifest  ||--o{ SessionManifestEntry : "indexes (1:N)"
    SessionManifestEntry |o--|| AgentChatSession  : "persists (1:1)"
    AgentDefinition  ||--|{ AgentCommand          : "exposes (1:1..N)"
    AgentDefinition  ||--|| AgentResourceRefs     : "references (1:1)"

    AgentChatSession {
        string id PK "UUIDv4"
        string source "acp | cloud"
        string agentId
        string lifecycleState "FSM (7 states)"
        string selectedModelId
        date   createdAt
        date   endedAt
    }
    ChatMessage {
        string id PK
        string sessionId FK
        string role "user|agent|thought|plan|system|tool|error"
        int    sequence
    }
    WorktreeHandle {
        string id PK "UUIDv4"
        string branchName
        string status "created|in-use|abandoned|cleaned"
    }
    ExecutionTarget {
        string kind "local|worktree|cloud"
        string worktreeId FK
        string cloudSessionId FK
    }
    PendingWrite {
        string id PK
        string path
        int    linesAdded
        int    linesRemoved
    }
    AgentDefinition {
        string id PK "kebab-case"
        string name
        string filePath
    }
    AgentCommand {
        string name PK
        string tool "registry key"
    }
```

---

## 3. Cloud Delegation 🟢🔴

```mermaid
erDiagram
    AgentSession   ||--o{ AgentTask     : "has (1:N)"
    AgentSession   ||--o{ PullRequest    : "produces (1:N)"
    AgentTask      |o--o| SpecTask        : "derived from"
    DevinSession   ||--o{ DevinTask      : "has (1:N)"
    DevinSession   ||--o{ PullRequest    : "produces (1:N)"
    DevinSession   }o--|| DevinCredentials : "authenticated by"
    DevinTask      ||--o{ TaskArtifact   : "produces (1:N)"
    DevinSession   ||--o{ DevinProgressEvent : "emits (1:N, in-mem)"

    AgentSession {
        string localId PK "UUIDv4"
        string providerId "devin | github-copilot"
        string providerSessionId
        string status "PENDING..CANCELLED"
        bool   isReadOnly
        string chatPanelId FK "link to AgentChatSession"
    }
    AgentTask {
        string id PK
        string specTaskId FK
        string status "PENDING..SKIPPED"
        string priority "P1|P2|P3"
    }
    PullRequest {
        string url PK
        string state "open|merged|closed"
        string branch
    }
    DevinSession {
        string localId PK "UUIDv4"
        string sessionId "remote id"
        string apiVersion "v1|v2|v3"
        string orgId "required for cog_ keys"
        int    retryCount
    }
    DevinTask {
        string taskId PK "UUIDv4"
        string status
        string acceptanceCriteria
    }
    DevinCredentials {
        string apiKey "SecretStorage"
        string apiVersion
        bool   isValid
    }
```

> **🔴** `AgentSession` (cloud-agents) and `DevinSession` (legacy) are **parallel aggregates for the same remote concept**; the ownership boundary is undetermined (`domain.md` §5.1).

---

## 4. Spec Lifecycle 🟢

```mermaid
erDiagram
    UnifiedSpec    ||--o{ NormalizedTask : "contains (1:N)"
    UnifiedSpec    ||--o{ ChangeRequest  : "reviewed via (1:N)"
    UnifiedSpec    ||--o{ ChecklistItem  : "tracks (1:N)"
    ChangeRequest  ||--o{ NormalizedTask : "attaches (1:N)"
    Constitution   ||--o{ Rule           : "defines (1:N)"
    SteeringDocument |o--o| Constitution  : "specializes"
    SteeringDocument |o--o| InstructionRule : "specializes"

    UnifiedSpec {
        string id PK "NNN-slug or openspec id"
        string status "draft|current|reopened|review|archived"
        date   completedAt
        date   reviewEnteredAt
        date   archivedAt
    }
    NormalizedTask {
        string id PK
        string specId FK
        string status
        string priority
    }
    ChangeRequest {
        string id PK
        string severity
        string status "open|inProgress|blocked|addressed"
        bool   archivalBlocker
    }
    ChecklistItem {
        string id PK
        bool   completed
    }
    Constitution {
        string content
        date   updatedAt
    }
    InstructionRule {
        string id PK "kebab-case"
        string filePath
    }
```

> Status FSM strictly validated (R-SP-1); `readyToReview` normalized to `review`. A `ChangeRequest` with `archivalBlocker=true` blocks archival until `addressed` (R-SP-4/5).

---

## 5. Automation (Hooks) 🟢

```mermaid
erDiagram
    Hook            ||--|| ActionConfig       : "executes (1:1)"
    Hook            ||--o{ EventSource         : "triggered by (1:N)"
    Hook            ||--o{ Condition           : "gated by (1:N)"
    Hook            ||--o| Schedule            : "timed by (1:0..1)"
    Hook            ||--o{ HookExecutionLog    : "logs (1:N, cap 100)"
    ActionConfig    ||--|| ActionParams        : "discriminated by type (1:1)"
    MCPActionParams ||--o{ SelectedMCPTool     : "selects (1:N)"
    MCPActionParams ||--o{ ParameterMapping    : "maps (1:N)"
    MCPServer       ||--o{ MCPTool             : "exposes (1:N)"
    HookExecutionLog |o--|| TemplateContext    : "snapshots (1:1)"

    Hook {
        string id PK "UUIDv4"
        string name "unique, <=100"
        bool   enabled
        int    executionCount "immutable"
    }
    EventSource {
        string type "agent-operation|execution-flow|repository|file-change|manual"
        string agent "speckit|openspec|orchestration"
        string operation "one of ~15 ops"
        string timing "before|after"
    }
    ActionConfig {
        string type "agent|git|github|mcp|custom|acp"
    }
    HookExecutionLog {
        string id PK
        string executionId
        int    chainDepth "<=10"
        string status "success|failure|skipped|timeout"
    }
    MCPServer {
        string id PK
        string status
    }
    MCPTool {
        string name PK
        string serverId FK
    }
```

---

## 6. Orchestration (MAESTRO) 🟡🔴

```mermaid
erDiagram
    OrchestrationSnapshot ||--o{ Bucket         : "groups (1:N)"
    Bucket                ||--o{ SessionSummary : "lists (1:N)"
    SessionSummary        ||--o{ NormalizedTask : "reflects (1:N)"

    OrchestrationSnapshot {
        date   timestamp
        string degradedReasons "graceful degradation"
    }
    Bucket {
        string state "active|waiting|completed|failed"
        int    rank "0..3"
    }
    SessionSummary {
        string id PK
        string type "agent-chat|cloud"
        string status
        date   lastVisibleActivityAt
    }
```

> `SessionSummary` is a **read-model projection** merging agent-chat and cloud sessions — not a stored entity. Sort = bucket rank then `lastVisibleActivityAt` desc (R-OR-1).

---

## 7. Cardinality summary (most important relationships)

| Parent | → | Child | Card. | Notes |
|--------|---|-------|-------|-------|
| `AgentChatSession` | → | `ChatMessage` | 1:N | core transcript; archived past 10k/2 MB |
| `AgentChatSession` | → | `WorktreeHandle` | 1:0..1 | only when target = worktree |
| `AgentChatSession` | → | `ExecutionTarget` | 1:1 | immutable after first turn |
| `AgentDefinition` | → | `AgentCommand` | 1:1..N | ≥1 required |
| `AgentSession` (cloud) | → | `AgentTask` | 1:N | delegated work |
| `AgentSession` (cloud) | → | `AgentChatSession` | 0..1:1 | `chatPanelId` back-link |
| `DevinSession` | → | `DevinTask` | 1:N | legacy path |
| `DevinTask` | → | `TaskArtifact` | 1:N | files/logs/test results |
| `UnifiedSpec` | → | `NormalizedTask` | 1:N | spec tasks |
| `UnifiedSpec` | → | `ChangeRequest` | 1:N | review flow |
| `ChangeRequest` | → | `NormalizedTask` | 1:N | remediation tasks |
| `Constitution` | → | `Rule` | 1:N | governance |
| `Hook` | → | `ActionConfig` | 1:1 | discriminated union |
| `Hook` | → | `EventSource` | 1:N | normalized triggers |
| `Hook` | → | `HookExecutionLog` | 1:N | FIFO cap 100 |
| `MCPServer` | → | `MCPTool` | 1:N | discovered tools |
| `OrchestrationSnapshot` | → | `Bucket` → `SessionSummary` | 1:N:N | dashboard |

> ~94 distinct types/enums were catalogued (`data-dictionary.md`); this model surfaces the ~35 aggregate roots and their relationships. Enums backing FSM `status`/`state` fields are documented in `state-machines.md`.
