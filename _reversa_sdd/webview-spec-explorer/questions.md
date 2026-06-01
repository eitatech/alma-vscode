# webview-spec-explorer — Open Questions (🔴 / 🟡 for human validation)


> ✅ **RESOLVED 2026-05-29 (Reviewer).** Every open question in this file was answered by the maintainer in chat. See top-level `_reversa_sdd/questions.md` and `confidence-report.md` for the decisions and reclassifications.

> Cross-reference: `domain.md` §5.6 (R-X-6 violation), `traceability/spec-impact-matrix.md` §5, `architecture.md` §7.

## Q1 🔴 R-X-6 drift: `src/` type import + own `acquireVsCodeApi`

**Observation.** Unlike every other webview module (which keep a contract mirror and use the shared `@/bridge/vscode`), `webview-spec-explorer`:
1. imports spec types **directly from `src/features/spec/review-flow/types`** (compile-time coupling) — `spec-explorer-store.ts:2`, `change-request-form.tsx:11`, `ready-to-review-list.tsx:9`.
2. uses a **separate** `acquireVsCodeApi()` instance (`window.specExplorerVscode`) — `services/spec-explorer.ts:100`.

**Question.** Is this drift intentional (e.g. this surface predates the shared bridge), or should it be migrated to the shared bridge + a `types.ts` contract mirror like the other webview modules?

**Why it matters.**
- The `src/` import breaks the webview build's isolation; a change to the extension's spec types directly ripples into the webview.
- `acquireVsCodeApi()` may be called **only once** per webview context; a second call throws. If this surface and the shared bridge both run in the same page, this is a latent crash — confirm they never co-mount.

**Options.**
1. Migrate to the shared bridge + contract mirror (align with R-X-6).
2. Keep as-is and document the exception explicitly (and guarantee no co-mount with the shared bridge).

## Q2 🟡 Three coexisting messaging styles

The module uses three host-communication styles (own `acquireVsCodeApi` type-keyed for review; shared bridge for create-*; command-keyed for interactive). Should these be unified for consistency/maintainability?

---

> The behaviors are 🟢 and faithful. The drift (Q1) is an architectural debt to confirm with the maintainer before reimplementation — it is also tracked in `architecture.md` §7 (technical debt) and the change-risk register.
