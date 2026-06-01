# ADR-0010: Spec review-flow FSM with change-request archival blockers

- **Status:** Accepted (retroactive)
- **Confidence:** 🟢

## Context
Specs need a controlled lifecycle so that work isn't archived while review feedback is outstanding, and so review can resume automatically when feedback is resolved (specs `007-spec-review-flow`, `008-auto-review-transition`).

## Decision
Model specs as an explicit **finite state machine** (`current → review → {reopened, archived, current}`, `reopened → review`, `archived → reopened`) with **validated transitions** and gates:
- Send-to-review requires zero pending tasks + checklist items.
- Change requests are `archivalBlocker=true` until addressed and force the spec to `reopened`.
- Archive requires review status + no blockers.
- **Auto-return to review** when all CRs are addressed, all tasks done, zero pending.
- `readyToReview` is a legacy alias normalized to `review`.

## Evidence
- `spec/review-flow/state.ts` (948 LOC, FSM + gating + persistence + telemetry), `change-requests-service.ts`, `duplicate-guard.ts`.
- Rules R-SP-1…R-SP-8; `state-machines.md` §12–§14.

## Consequences
- Predictable, auditable spec lifecycle with ~15 telemetry loggers.
- 🔴 The change-request → tasks dispatch (`dispatchToTasksPrompt`) is currently a **mock** (random latency, 10% failure, hard-coded tasks) — the pipeline is not wired to a real generator (`domain.md` §5.3).
- Review-flow state is a **module-level singleton**, globally coupling cache + persistence per host.
