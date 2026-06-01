# webview-hooks-view — Open Questions (🔴 / 🟡 for human validation)


> ✅ **RESOLVED 2026-05-29 (Reviewer).** Every open question in this file was answered by the maintainer in chat. See top-level `_reversa_sdd/questions.md` and `confidence-report.md` for the decisions and reclassifications.

> Cross-reference: `code-analysis.md` (webview-hooks-view note).

## Q1 🔴 Duplicate components (which is wired?)

**Observation.** Two trigger selectors exist:
- `components/hooks/trigger-action-selector.tsx` (313 LOC)
- `features/hooks-view/components/trigger-action-selector.tsx` (754 LOC)

And `components/cli-options/*` appears to duplicate `features/hooks-view/components/cli-options/*`.

**Question.** Which variant is wired in production (via the host's `getWebviewContent`)? Is this an in-progress consolidation (Rule-of-Three) where one set is dead code?

**Why it matters.** A reimplementation must keep the live one and drop the dead one; shipping both bloats the bundle and risks divergent behavior.

## Q2 🟡 Dual-keyed protocol longevity

The module sends/receives both `type` ("hooks/x") and `command` ("hooks.x") for backward compatibility. Is the legacy `command` spelling still required (older host versions), or can the protocol be simplified to `type` only?

---

> Behaviors are 🟢 and faithful. Q1 (which duplicate is canonical) should be confirmed against `getWebviewContent` / the build before reimplementation.
