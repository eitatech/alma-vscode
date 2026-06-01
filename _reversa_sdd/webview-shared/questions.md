# webview-shared — Open Questions (🔴 / 🟡 for human validation)


> ✅ **RESOLVED 2026-05-29 (Reviewer).** Every open question in this file was answered by the maintainer in chat. See top-level `_reversa_sdd/questions.md` and `confidence-report.md` for the decisions and reclassifications.

> Cross-reference: `webview-orchestration/questions.md` Q1, `panels/questions.md` Q2, `domain.md` §5.5.

## Q1 🔴 Missing page-registry entries (`devin-progress`, `cloud-agent-progress`)

**Observation.** `page-registry.tsx` registers 11 pages, but `src/panels/devin-progress-panel.ts` and `cloud-agent-progress-panel.ts` set `data-page` to `devin-progress` / `cloud-agent-progress` — values **not** in the registry. Bootstrapping those panels renders **"Unknown page"**.

**Question.** Add the two pages to `page-registry.tsx` (wiring the unmounted progress views from `webview-orchestration`), or remove the panels that request them?

**Why it matters.** This is the registry's view of the same gap documented in `webview-orchestration/questions.md` Q1 and `panels/questions.md` Q2 — the panels are effectively broken until resolved.

## Q2 🟡 Dev-echo residual identifier

The dev fallback echoes to `openspec.chat/echoResult` — a residual from the `kiro-for-codex-ide` fork lineage (`domain.md` §1). Harmless (dev-only), but a candidate for cleanup/renaming to the `gatomia.*` namespace.

## Q3 🟡 Single `acquireVsCodeApi()` invariant

`acquireVsCodeApi()` may be called only once per webview context. `webview-spec-explorer` calls it separately (`window.specExplorerVscode`). Confirm that surface never co-mounts with a shared-bridge page (else the second call throws). Tracked in `webview-spec-explorer/questions.md` Q1.

---

> The shared infrastructure is 🟢 and faithful. The page-registry gap (Q1) is the canonical place to fix the broken progress panels — coordinate with `webview-orchestration` + `panels`.
