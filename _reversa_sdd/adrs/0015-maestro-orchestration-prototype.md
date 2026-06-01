# ADR-0015: MAESTRO orchestration — pluggable task source + autonomous agent loop

- **Status:** Proposed / Prototype (not production-wired)
- **Confidence:** 🟡

## Context
The product's direction is moving from "run one agent in a chat" toward **orchestrating many agents** against a board of tasks. A series of commits prefixed `MAESTRO:` (2026-04-30 → 05-04) built this exploratory layer.

## Decision
Build an orchestration layer:
- A **pluggable task-source** model (`NormalizedTask` + `TaskProvider`) reading `tasks.md` from either SDD system.
- An **orchestration read-model** aggregating all sessions into a bucketed `OrchestrationSnapshot` (active/waiting/completed/failed) with graceful degradation.
- An **autonomous agent loop** that claims a task, spawns an agent-chat session, and fires `task-completed`/`task-failed` hook triggers.
- A **React Flow workflow composer** (hooks → event/condition/schedule/action graph) and a **Kanban board** (tasks grouped by `ExecutionState`).

## Evidence
- `orchestration/{orchestration-read-model,autonomous-agent-loop}.ts`; `tasks/*`; `ui/.../workflow-composer`, `components/{workflow-graph,kanban}`.
- 40 `MAESTRO:` commits; rules R-OR-1…R-OR-4.

## Consequences
- Establishes the contracts for multi-agent orchestration.
- 🔴 **Prototype-grade and partly unmounted**: the Kanban board has no importer; `devin-progress`/`cloud-agent-progress` pages are absent from `page-registry.tsx`; the autonomous loop builds a non-canonical `AgentChatSession` and detects completion via a non-existent `"error"` lifecycle state (`domain.md` §5.2, §5.5).
- Needs reconciliation with canonical `agent-chat` types before it can be relied upon.
