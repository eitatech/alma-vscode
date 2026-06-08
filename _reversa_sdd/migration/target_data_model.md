---
schemaVersion: 1
generatedAt: 2026-06-07T20:32:17Z
reversa:
  version: "1.2.34"
kind: target_data_model
producedBy: designer
hash: "sha256:dd34f1b038d8f7bd14b86c7a1a97d49fbf463a9f1772376dd150a67c42a58078"
---

# Target Data Model

> **There is no database** (mirrors the legacy ADR-0005; paradigm I5). State persists via IntelliJ `PersistentStateComponent` (XML), project-scoped JSON/JSONL files, `PasswordSafe` (secrets), and IDE-agnostic filesystem markdown (specs/agents/steering). This document is a **state-shape model**, not a relational schema.

## Visão geral
- **Primary store**: none (no OLTP/OLAP/event store).
- **Persistence backends** (by bounded context): IntelliJ `PersistentStateComponent` for structured plugin state; project files under a plugin-owned dir (e.g. `.idea/gatomia/` or a project-scoped path) for sessions/transcripts; `PasswordSafe` for credentials; the repo's existing SpecKit/OpenSpec dirs for spec/steering/agent files (read in place).
- **Role**: all state is **local, per-project**; no shared/remote datastore.

## Entidades de dados (state shapes)

| Entity (state) | Storage (IntelliJ) | Owning aggregate | Identity | Bounded context |
|---|---|---|---|---|
| `ChatSessionState` | project file (JSON) + JSONL transcript | AGG-ChatSession | sessionId (UUIDv4) | agents |
| `SessionManifest` | `PersistentStateComponent` (index) | AGG-ChatSession | manifest singleton | agents |
| `AgentDefinition` | filesystem markdown (`.agent.md` in repo) | AGG-AgentDefinition | kebab id | agents |
| `CloudSessionState` | `PersistentStateComponent` (+ 7-day TTL cleanup) | AGG-CloudSession | sessionId + providerId | cloud |
| `CloudCredentials` | **`PasswordSafe`** (separate slots) | AGG-CloudSession | provider key id | cloud |
| `HookState` | `PersistentStateComponent` | AGG-Hook | hookId (UUIDv4) | automation |
| `HookExecutionLog` | in-memory ring (cap 100, FIFO) | AGG-Hook | executionId | automation |
| `SpecState` (review-flow) | `PersistentStateComponent` (+ project files) | AGG-Spec | specId | spec |
| `UnifiedSpec` / `SteeringDocument` | filesystem markdown (SpecKit/OpenSpec dirs) | AGG-Spec / AGG-SteeringDocument | path | spec |
| `OrchestrationSnapshot` | in-memory only (projection) | AGG-OrchestrationSnapshot | rebuilt per read | orchestration |
| `MCPServerCatalog` | in-memory (TTL 5 min cache) | platform (own MCP client) | server id | platform |

## Schema (state-class sketches, not DDL)

```kotlin
// IntelliJ PersistentStateComponent example (XML-serialized), automation context
@Service(Service.Level.PROJECT)
@State(name = "GatomiaHooks", storages = [Storage("gatomia-hooks.xml")])
class HookStore : PersistentStateComponent<HookStore.State> {
    data class State(
        var hooks: MutableList<HookState> = mutableListOf()
    )
    data class HookState(
        val id: String,            // UUIDv4 (R-HK-8, immutable)
        val name: String,          // unique, <=100 chars
        val createdAt: Long,       // immutable
        val events: List<String>,  // normalized (legacy `trigger` -> events[])
        val timing: Timing,        // before | after  (default after on load)
        val action: ActionConfig,
        val executionCount: Int,   // immutable field
    )
    // ...
}

// ChatSession transcript: large/append-only -> JSONL project file, not XML state
//   .idea/gatomia/sessions/<sessionId>.jsonl   (archival offload at 10k msgs / 2MB, R-AC-4)

// Secrets via PasswordSafe (never in XML/JSON), cloud context
//   PasswordSafe.instance.set(CredentialAttributes("gatomia.devin.<keyId>"), Credentials(...))
```

## Relacionamentos (logical, in-memory references)

| From | To | Cardinality | Integrity | Notes |
|---|---|---|---|---|
| `CloudSessionState` | `ChatSessionState` | N:0..1 | soft ref by `chatPanelId` | optional back-link (erd §1) |
| `SpecState` | `NormalizedTask` | 1:N | composition | task ids `${specId}-${id}` |
| `SpecState` | `ChangeRequest` | 1:N | composition | archival blocker (R-SP-4) |
| `OrchestrationSnapshot` | sessions (agents+cloud) | projection | derived | rebuilt, never stored authoritatively |

## Restrições
- **Uniqueness**: `Hook.name` unique (<=100 chars); `AgentDefinition.id` kebab-case unique; session ids UUIDv4.
- **Referential integrity**: best-effort (no FK engine) — orphan worktrees migrate to an "orphaned" list (R-AC-5); dangling refs handled by graceful degradation (R-OR-2).
- **Retention caps**: 100 sessions (R-AC-5); transcript archival 10k/2MB (R-AC-4); cloud 7-day retention (R-CD-7); hook logs 100 FIFO + trigger history 50 (R-HK-4).
- **Indices**: n/a (no DB) — `SessionManifest` acts as the lookup index for offloaded transcripts.

## Considerações específicas do paradigma alvo
- **No event store / no event sourcing**: domain events (`target_domain_model.md`) are **in-process message-bus signals**, not a durable append-only log. There is no outbox.
- **Immutability where it matters**: `Hook` immutable fields (`id`/`createdAt`/`executionCount`, R-HK-8); transcript JSONL is append-only with archival offload.
- **IntelliJ idioms**: structured config -> `PersistentStateComponent` (XML); large/append data -> project JSONL files; secrets -> `PasswordSafe`; never store secrets in state XML.

## Origem no legado

| New state | Legacy origin | Transformation |
|---|---|---|
| `ChatSessionState` + JSONL | JSON manifest + JSONL in `.vscode/gatomia/` (erd legend) | path -> plugin-owned dir; shape preserved |
| `HookState` | `workspaceState` `gatomia.hooks.configurations` | -> `PersistentStateComponent` XML; `trigger`->`events[]` already-normalized (no legacy import in v1, AMB-006) |
| `CloudSessionState` | `workspaceState` (cloud) + JSON file (Devin, 7-day) | unified -> `PersistentStateComponent` + TTL cleanup |
| `CloudCredentials` | VS Code `SecretStorage` | -> `PasswordSafe` |
| `SpecState` | review-flow `workspaceState` JSON | -> `PersistentStateComponent` |
| `UnifiedSpec`/`SteeringDocument`/`AgentDefinition` | repo filesystem (SpecKit/OpenSpec/`.agent.md`) | **unchanged** — read in place by both IDEs |
| `OrchestrationSnapshot`/`MCPServerCatalog` | in-memory | in-memory (rebuilt) |

## Notas
- Because the legacy has no DB and v1 does **no config import** (AMB-006), there is **no data to migrate at runtime** — see `data_migration_plan.md`, which is intentionally a state-shape mapping rather than an ETL plan.
- The plugin-owned persistence directory path is a small implementation choice for the coding agent (`.idea/gatomia/` vs a project-config path); flagged as a minor decision, not a parity concern.
