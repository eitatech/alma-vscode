# steering — Open Questions (🔴 / 🟡 for human validation)


> ✅ **RESOLVED 2026-05-29 (Reviewer).** Every open question in this file was answered by the maintainer in chat. See top-level `_reversa_sdd/questions.md` and `confidence-report.md` for the decisions and reclassifications.

> Cross-reference: `domain.md` §5.4, `permissions.md`, `adrs/0013-global-resource-access-consent.md`.

## Q1 🔴 `validateConstitution` is a stub

**Observation.** `ConstitutionManager.validateConstitution` (`constitution-manager.ts:74-77`) is a placeholder that **always returns `true`** ("Placeholder for validation logic"). No structural/semantic validation of the constitution is performed.

**Question.** Is constitution validation intended (e.g. require certain sections, non-empty principles), or is "always valid" the accepted behavior? If intended, what are the validation rules?

**Why it matters.** Callers that gate on `validateConstitution` get a false sense of validation. A reimplementation should either implement real checks or remove the call.

## Q2 🟡 `ensureGlobalResourceAccessConsent` output collector

The gate takes an optional `out?` parameter (an output collector). Confirm what it collects (e.g. the decision, diagnostics) so a reimplementation preserves the contract.

---

> The consent gate (privacy control, ADR-0013) and instruction-rule creation are 🟢 and faithful. Only `validateConstitution` (Q1) is a no-op stub.
