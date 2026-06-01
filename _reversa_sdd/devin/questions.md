# devin — Open Questions (🔴 for human validation)


> ✅ **RESOLVED 2026-05-29 (Reviewer).** Every open question in this file was answered by the maintainer in chat. See top-level `_reversa_sdd/questions.md` and `confidence-report.md` for the decisions and reclassifications.

> Cross-reference: `cloud-agents/questions.md` Q1, `domain.md` §5.1, `traceability/spec-impact-matrix.md` §5.

## Q1 🔴 Devin ownership overlap (same gap as cloud-agents)

**Observation.** This standalone `devin` module (`devin-session-manager`, `devin-polling-service`, `devin-session-storage`) and `cloud-agents` (`agent-polling-service` + `devin-adapter`) **both** implement Devin session lifecycle + polling, and both are wired in `extension.ts` (standalone via `devin-commands`/`devin-progress-panel`; unified via `cloud-agents`). The `devin-adapter` header says it *"delegates to existing src/features/devin/* modules without breaking changes."*

**Question.** For a given Devin session: which path owns polling, status updates, and `tasks.md` writes? Can both run simultaneously? Are they mutually exclusive by entry point (which one)?

**Risk if unresolved.** Double polling → duplicated completion events, racing PR reconciliation, and double-toggled `tasks.md` checkboxes.

**Options to confirm.**
1. `cloud-agents` is the canonical path; `devin` standalone poller/commands are legacy and should be removed from wiring.
2. `devin` owns sessions created via `devin-commands`; `cloud-agents` owns sessions created via the unified dispatch. Each only polls its own.
3. The `devin-adapter` is the only live consumer of `devin`'s clients/credentials, and `devin`'s own poller/session-manager are dead code.

## Q2 🟡 PR review/merge actions

`pr-review-integration.ts` exposes review/approve/request-changes/merge, but all currently **open the browser** rather than calling the API. Is API-driven PR action intended, or is "open in browser" the final behavior?

## Q3 🟡 Grace-window reconciliation

`devin` uses `GRACE_CYCLES_AFTER_TERMINAL=6` (cycle-based); `cloud-agents` uses time-based grace (5 min / 1 h). If both poll Devin, which grace policy applies? Reconcile to a single policy.

---

> The polling, PR-sync, and create paths in this module's specs assume `devin` is the owner of a Devin session **only if** the maintainer confirms option 2/3 above. Otherwise treat `cloud-agents` as canonical.
