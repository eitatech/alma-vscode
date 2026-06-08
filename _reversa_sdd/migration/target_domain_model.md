---
schemaVersion: 1
generatedAt: 2026-06-07T20:32:17Z
reversa:
  version: "1.2.34"
kind: target_domain_model
producedBy: designer
hash: "sha256:66677d54bcfe6862d6f86134ac02c4ec12006f1a08e4cc1dd40a3ec1ebd1b70e"
---

# Target Domain Model

> Domain model of the new system, with explicit traceability to the legacy (`_reversa_sdd/domain.md`, `erd-complete.md`). FSMs are expressed as Kotlin sealed classes (AD-03). The model is **internally event-driven** (the hooks/orchestration triggers), so domain events are first-class even though the host paradigm is OO-with-DI.

## Aggregates

### AGG-ChatSession (context: agents)
- **Aggregate root**: `ChatSession`
- **Invariants**:
  - Terminal states (`completed`/`failed`/`cancelled`/`ended-by-shutdown`) are absorbing; a new run = a new session (R-AC-1).
  - At most one queued follow-up while a turn is in flight (R-AC-2).
  - Cloud sessions are read-only (R-AC-3).
  - Transcript archived at 10k msgs / 2 MB, oldest 25% offloaded (R-AC-4).
  - Agent-reported capabilities win over the static catalog (R-AC-7).
  - Mode/model/target changes apply next turn; `ExecutionTarget` immutable after first turn (R-AC-8).
  - Dirty/unpushed worktree cleanup requires `confirmedDestructive` (R-AC-9).
- **Commands**: `start`, `submitTurn`, `queueFollowUp`, `changeMode/Model/Target`, `approve/rejectPendingWrite`, `cancel`, `cleanWorktree`.
- **Domain events published**: `ChatSessionStateChanged`.
- **Legacy origin**: `domain.md` §3 (Session) / §4.1; `erd-complete.md` §2 (AgentChatSession). Type: merged.

### AGG-AgentDefinition (context: agents)
- **Aggregate root**: `AgentDefinition` (`.agent.md`)
- **Invariants**: kebab-case `id` `^[a-z0-9-]+$`; >=1 command; `/help` auto-injected; unique tool names (R-AC-10).
- **Commands**: `load`, `validate`, `registerWithHost` (JetBrains AI Assistant, AD-06).
- **Legacy origin**: `domain.md` §3 (Agent definition). Type: 1:1 (registration target changed).

### AGG-CloudSession (context: cloud)
- **Aggregate root**: `CloudSession`
- **Invariants**:
  - Devin API version by token prefix (R-CD-1); local-only cancel (R-CD-2); `statusDetail` overrides base status (R-CD-3).
  - Polling stops after 3 failures + credential-expiry callback (R-CD-4); grace window for late PR merges (R-CD-5).
  - Terminal normalization (R-CD-6); 7-day retention (R-CD-7); inactive provider -> read-only, excluded from polling (R-CD-8).
  - Task-group -> one PR / no per-task branches (R-CD-9); client rate-limit + backoff (R-CD-10); clean-git pre-flight (R-CD-11).
  - PR state change marks `tasks.md` checkbox idempotently (R-CD-12); duplicate dispatch blocked, bounded retries (R-CD-13).
- **Commands**: `dispatch`, `poll`, `cancel`, `reconcilePr`.
- **Domain events published**: `CloudSessionStateChanged`, `PrStateChanged`.
- **Legacy origin**: `domain.md` §4.2; `erd-complete.md` (AgentSession/DevinSession). Type: merged + pruned (standalone `devin` discarded).

### AGG-Spec (context: spec)
- **Aggregate root**: `Spec` (unified over SpecKit/OpenSpec)
- **Invariants**:
  - Status FSM strictly validated; `readyToReview` -> `review` alias (R-SP-1).
  - Send-to-review gate: `current`/`reopened` + zero pending tasks + zero pending checklist (R-SP-2).
  - Timestamp stamping on review/archive (R-SP-3); archive gate + unarchive->reopened (R-SP-5); forced out of review on pending items (R-SP-6); auto-return to review (R-SP-7).
  - Spec-system selection precedence (R-SP-9); SpecKit dir pattern + next-number (R-SP-10); path-based provider + spec-scoped task ids (R-SP-13).
- **Commands**: `create`, `sendToReview`, `archive`, `unarchive`, `selectSystem`, `normalizeTasks`.
- **Domain events published**: `SpecOperationCompleted`, `SpecArchived`.
- **Legacy origin**: `domain.md` §4.3; `erd-complete.md` (UnifiedSpec). Type: merged (spec+tasks).

### AGG-ChangeRequest (context: spec)
- **Aggregate root**: `ChangeRequest`
- **Invariants**: new CR is `open` with `archivalBlocker=true`; filing in review -> spec `reopened`; attach tasks -> `inProgress`; all done -> `addressed`, blocker clears (R-SP-4); duplicate rejection by normalized title (R-SP-8).
- **Commands**: `file`, `attachTasks`, `markAddressed`. **CR->tasks uses the real `/speckit.tasks` generator** (D-4), not a mock.
- **Legacy origin**: `domain.md` §4.3 (Change Request). Type: 1:1.

### AGG-SteeringDocument (context: spec)
- **Aggregate root**: `SteeringDocument` (constitution / AGENTS.md / instruction rules)
- **Invariants**: instruction-rule names lowercase kebab-case, no overwrite (R-SP-11); OpenSpec submission gate with STOP-for-approval (R-SP-12); `validateConstitution` **wired-but-permissive** in v1 (AMB-003), rules deferred.
- **Commands**: `edit`, `validateConstitution`.
- **Legacy origin**: `domain.md` §3 (Steering). Type: 1:1.

### AGG-Hook (context: automation)
- **Aggregate root**: `Hook`
- **Invariants**:
  - Fire on agent+operation+timing match in `createdAt` order (R-HK-1); blocking only when before+waitForCompletion (R-HK-2).
  - Chain safety: executionId + executedHooks set (circular block) + chainDepth cap 10 (R-HK-3); action timeout 30s + log/history caps (R-HK-4).
  - `$variable` substitution missing->empty + strict per-trigger `availableFor` gating, **enforced** (R-HK-5 + D-5).
  - MCP discovery cache TTL 5min + concurrency 5 + timeout clamp via the **own MCP client** (R-HK-6 + AMB-004).
  - Completion via `BulkFileListener` parse-validate + 2s debounce (R-HK-7); UUIDv4 id + immutable fields (R-HK-8).
- **Commands**: `create`, `update`, `fireTrigger`, `executeAction`.
- **Domain events**: consumes `SpecOperationCompleted` + `orchestration.task-completed/failed`; publishes execution logs.
- **Legacy origin**: `domain.md` §4.4. Type: 1:1 (renamed).

### AGG-OrchestrationSnapshot (context: orchestration) — projection/read-model
- **Aggregate root**: `OrchestrationSnapshot` (projection, not a source-of-truth aggregate)
- **Invariants**: bucket-rank sort active/waiting/completed/failed (R-OR-1); missing wiring -> `degradedReasons` not throw (R-OR-2); `claimTask`/`startTask` concurrency + `parallelizable` gate (R-OR-3); terminal task fires `orchestration.task-completed/failed` (R-OR-4).
- **Commands**: `claimTask`, `startTask`. Autonomous loop builds sessions via the canonical store + terminal-state set (D-2/D-3).
- **Domain events published**: `orchestration.task-completed/failed`.
- **Legacy origin**: `domain.md` §4.5; `erd-complete.md` (OrchestrationSnapshot/Bucket/SessionSummary). Type: 1:1 (projection over agents+cloud).

## Entities

| Entity | Owning aggregate | Key attributes | Legacy origin |
|---|---|---|---|
| `ChatMessage` | AGG-ChatSession | role, content, ts | erd §2 |
| `WorktreeHandle` | AGG-ChatSession | branch, state (created/in-use/cleaned/abandoned) | domain §3 Worktree |
| `Turn` | AGG-ChatSession | request, response, queued follow-up | domain §3 Turn |
| `PendingWrite` | AGG-ChatSession | path, content, settled | domain §3 Pending Write |
| `NormalizedTask` | shared (spec+orchestration) | id `${specId}-${task.id}`, state | domain §3 Task |
| `ActionConfig` | AGG-Hook | kind (agent/git/github/mcp/custom/acp), params | domain §4.4 Action |
| `CloudTask` | AGG-CloudSession | provider id, status | erd (AgentTask/DevinTask) |

## Value objects

| Value object | Attributes | Validations | Origin |
|---|---|---|---|
| `ExecutionTarget` | local \| worktree \| cloud | immutable after first turn (R-AC-8) | domain §3 |
| `ResolvedCapabilities` | modes/models/thinking/roles | agent-reported wins (R-AC-7) | domain §3 |
| `SpecStatus` | sealed: draft/current/review/reopened/archived | strict FSM (R-SP-1) | state-machines.md |
| `DevinCredentials` | key + metadata | stored in `PasswordSafe`, separate slots | erd legend |
| `Timing` | before \| after | gates blocking (R-HK-2) | domain §4.4 |

## Eventos de domínio (internal event-driven)

| Event | Published by | Consumed by | Schema (summary) |
|---|---|---|---|
| `SpecOperationCompleted` | AGG-Spec | AGG-Hook (R-HK-1) | specId, operation, timing |
| `ChangeRequestFiled` / `Addressed` | AGG-ChangeRequest | AGG-Spec | specId, crId, severity |
| `SpecArchived` | AGG-Spec | AGG-Hook | specId, archivedAt |
| `ChatSessionStateChanged` | AGG-ChatSession | AGG-OrchestrationSnapshot | sessionId, newState |
| `CloudSessionStateChanged` | AGG-CloudSession | AGG-OrchestrationSnapshot | sessionId, status |
| `PrStateChanged` | AGG-CloudSession | AGG-Spec (marks `tasks.md`, R-CD-12) | prId, open->merged |
| `orchestration.task-completed` / `task-failed` | AGG-OrchestrationSnapshot | AGG-Hook (R-OR-4 / R-HK-1) | task JSON |

## Regras de domínio (MIGRATE rules -> location)

| Rule (ID) | Location in the new domain | Origin (target_business_rules.md) |
|---|---|---|
| R-AC-1..9 | AGG-ChatSession invariants | BR-MIGRAR-001 |
| R-AC-10..11 | AGG-AgentDefinition + agents context (tool-window binding) | BR-MIGRAR-002 |
| R-CD-1..13 | AGG-CloudSession invariants + cloud polling | BR-MIGRAR-003 |
| R-SP-1..13 | AGG-Spec + AGG-ChangeRequest + AGG-SteeringDocument | BR-MIGRAR-004 |
| R-HK-1..8 | AGG-Hook invariants + automation event bus | BR-MIGRAR-005 |
| R-OR-1..4 | AGG-OrchestrationSnapshot projection + autonomous loop | BR-MIGRAR-006 |
| R-X-2..5 | platform (Copilot capability check, prompt decoration, ACP rewrite + isolation) | BR-MIGRAR-007 |

## Rastreabilidade para o legado

| New element | Legacy origin | Mapping type |
|---|---|---|
| AGG-ChatSession | `domain.md` §4.1 + `services/acp` + `agent-chat` | merged |
| AGG-AgentDefinition | `domain.md` §3 (`agents`) | 1:1 |
| AGG-CloudSession | `cloud-agents` (+ `devin` dropped) | merged + pruned |
| AGG-Spec | `spec` + `tasks` | merged |
| AGG-ChangeRequest | `spec/review-flow` | 1:1 |
| AGG-SteeringDocument | `steering` | 1:1 |
| AGG-Hook | `hooks` | 1:1 (renamed) |
| AGG-OrchestrationSnapshot | `orchestration` | 1:1 (projection) |
| platform services | `services/` + `utils/` + `prompts/` | merged |
| (removed) bridge/type-mirror/page-registry | `ui/` two-bundle | removed -> `discard_log.md` |

## Notas
- No new aggregate reuses a legacy file name as its context name (per Designer rules).
- The model is event-driven **internally** (hooks/orchestration), but persistence is **not** event-sourced (see `target_data_model.md`) — events are in-process signals, not a durable log.
