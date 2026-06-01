# hooks — Open Questions (🔴 / 🟡 for human validation)


> ✅ **RESOLVED 2026-05-29 (Reviewer).** Every open question in this file was answered by the maintainer in chat. See top-level `_reversa_sdd/questions.md` and `confidence-report.md` for the decisions and reclassifications.

> Cross-reference: `domain.md` §5.4, `code-analysis.md` (hooks module note).

## Q1 🔴 `validateVariables` is a stub

**Observation.** `TemplateVariableParser.validateVariables` always returns valid (TODO Phase 4, `template-variable-parser.ts:299-310`). The `availableFor` gating (which variables are valid for which trigger) is **defined** in `template-variable-constants.ts` but **not enforced** at parse/validation time.

**Question.** Is per-trigger variable gating intended to be enforced (reject a hook that uses `$agentOutput` for a trigger that does not provide it), or is the empty-string fallback (R-HK-5) the intended final behavior?

**Why it matters.** Reimplementing strict validation vs. lenient fallback are materially different contracts. The current behavior is lenient (missing → empty string) regardless of `availableFor`.

**Options.**
1. Implement `validateVariables` to reject out-of-scope variables at save time (warnings/errors in the editor).
2. Keep lenient runtime fallback; treat `availableFor` as editor hints only.

## Q2 🟡 "Parallel" non-blocking execution is sequential

**Observation.** In `executeHooksForTrigger` the non-blocking branch is commented "execute in parallel", but the loop `await`s each `executeHook` (`hook-executor.ts:884-895`), so all hooks run sequentially.

**Question.** Should non-blocking (`after`, no `waitForCompletion`) hooks run truly concurrently (`Promise.all` / fire-and-forget), or is sequential execution intended (e.g. to keep deterministic ordering and bounded resource use)?

## Q3 🟡 Migration write-back

Does `loadHooks`/`migrateHook` persist the migrated shape back to `workspaceState`, or only normalize in memory each load? (Affects whether legacy shapes accumulate.) Confirm in `hook-manager.ts:355`.

---

> The specs document the **observed** behavior: lenient template fallback, sequential execution, in-place migration. Confirm intent before changing any of these in a reimplementation.
