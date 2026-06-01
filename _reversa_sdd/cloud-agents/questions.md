# cloud-agents — Open Questions (🔴 for human validation)


> ✅ **RESOLVED 2026-05-29 (Reviewer).** Every open question in this file was answered by the maintainer in chat. See top-level `_reversa_sdd/questions.md` and `confidence-report.md` for the decisions and reclassifications.

> These cannot be resolved from code alone. They block confident reimplementation of Devin handling.
> Cross-reference: `domain.md` §5.1, `traceability/spec-impact-matrix.md` §5.

## Q1 🔴 Devin ownership overlap (polling)

**Observation.** Both the standalone `devin` module and this `cloud-agents` module implement Devin session lifecycle + polling, and **both are wired in `extension.ts`**.
- `cloud-agents/adapters/devin-adapter.ts` → `DevinAdapter.pollSessions` (`:354`)
- `devin/` → its own polling cycle (`flowcharts/devin.md` §2)

**Question.** For a given Devin session, which path *owns* polling? Can both run simultaneously for the same session? If so, do their writes to storage / `tasks.md` race?

**Why it matters.** Two pollers updating the same remote session can double-fire completion events, double-write PR→checkbox sync, or clobber each other's status. The grace constants also differ (this module: 5 min / 1 h; `devin`: `GRACE_CYCLES_AFTER_TERMINAL=6`).

**Options to confirm with maintainer.**
1. `cloud-agents` is canonical; `devin` is legacy/dead and should be removed from wiring.
2. `devin` owns standalone Devin; `cloud-agents` only owns Devin-as-a-provider when explicitly selected.
3. They are meant to be mutually exclusive by config (which flag?).

## Q2 🟡 Grace-window constants

Are the `cloud-agents` grace constants (5 min known PR / 1 h unknown) and the `devin` module's `GRACE_CYCLES_AFTER_TERMINAL=6` intended to describe the same behavior, or two independent policies? Reconcile before reimplementation.

## Q3 🟡 Cleanup expiry field

Does `SessionCleanupService.cleanup` key the 7-day window off `completedAt` or `updatedAt`? (Affects which sessions survive.) Confirm in `session-cleanup-service.ts:40`.

---

> Until Q1 is answered, treat `cloud-agents/create-session` and `polling-and-normalization` as the **provider-agnostic** path and `devin` as a separate (possibly redundant) integration. Do not wire both pollers for the same session without an ownership rule.
