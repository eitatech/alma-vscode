# spec — Open Questions (🔴 / 🟡 for human validation)


> ✅ **RESOLVED 2026-05-29 (Reviewer).** Every open question in this file was answered by the maintainer in chat. See top-level `_reversa_sdd/questions.md` and `confidence-report.md` for the decisions and reclassifications.

> Cross-reference: `domain.md` §5.3, `traceability/spec-impact-matrix.md` §5.

## Q1 🔴 `dispatchToTasksPrompt` is a mock

**Observation.** `review-flow/tasks-dispatch.ts:76-134` is a **mock**: it simulates 500–1500 ms latency, fails 10% of the time at random, and returns two hard-coded tasks (`Fix: …`, `Verify changes`). The comment says *"In production, this would be a real API call."* So the change-request → tasks pipeline is **not wired** to a real generator.

**Question.** What is the intended real producer for `TasksPromptResponse`? Options:
1. A Copilot Chat prompt that generates `tasks.md` entries from the CR.
2. An MCP tool / external API.
3. The SDD `tasks` command (`/speckit.tasks`) scoped to the CR.

**Why it matters.** Everything downstream (`attachTasksToChangeRequest` → CR `inProgress` → `addressed` → archival unblock → auto-return to review) currently runs on fabricated tasks. The CR lifecycle "works" mechanically but the task content is fake.

## Q2 🟡 Review-flow state is a module-level singleton

**Observation.** Review-flow state is a module-scoped `Map` + `EventEmitter` (not a class instance), coupling persistence and the in-memory cache globally per extension host (`review-flow/state.ts`).

**Question.** Is the global singleton intended, or should state be an injectable service (for testability / multi-workspace)? This affects reimplementation structure but not observable behavior.

## Q3 🟡 Pending-count source

`pendingTasks` / `pendingChecklistItems` drive the review/forced-exit gates, but the writer of those counts is upstream of this module. Confirm who updates them (the `tasks` provider? a checklist scanner?).

---

> The FSM, gating, CR lifecycle, and create-spec flows are 🟢 and mechanically faithful. Only the **tasks producer** (Q1) is a mock — treat task *content* as placeholder until a real generator is wired.
