# webview-orchestration — Open Questions (🔴 / 🟡 for human validation)


> ✅ **RESOLVED 2026-05-29 (Reviewer).** Every open question in this file was answered by the maintainer in chat. See top-level `_reversa_sdd/questions.md` and `confidence-report.md` for the decisions and reclassifications.

> Cross-reference: `domain.md` §5.5, `traceability/spec-impact-matrix.md` §5, `orchestration/questions.md`.

## Q1 🔴 Unmounted prototypes (Kanban + progress pages)

**Observation.** Three built UI surfaces are unreachable:
- `KanbanBoard` (`components/kanban/*`) has **no importer** in `ui/src` or `src`.
- `devin-progress` and `cloud-agent-progress` pages are **absent from `page-registry.tsx`** (`:52`), yet `src/panels/devin-progress-panel.ts` and `cloud-agent-progress-panel.ts` request them → the SPA renders **"Unknown page"**.

**Question.** Are these intended to ship (then: register the pages + add the Kanban importer), or are they a prototype graveyard to remove?

**Why it matters.** The extension-side panels (`panels/questions.md` Q2) point at pages that don't exist — those panels are effectively broken today. This is the webview half of the same gap.

**Options.**
1. Wire: register `devin-progress`/`cloud-agent-progress` in `page-registry.tsx`, add a Kanban importer, and replace the `src/` import in `kanban-board.tsx` with a contract mirror (R-X-6).
2. Remove: delete Kanban + legacy progress views/stores and update the panels to not request missing pages.

## Q2 🔴 `kanban-board.tsx` imports from `src/` (R-X-6)

`kanban-board.tsx` imports `NormalizedTask`/`ExecutionState` from `src/features/tasks/task-model` (compile-time coupling), like the `webview-spec-explorer` drift. If the board is kept, mirror the types instead.

## Q3 🟡 Two store patterns

`devinStore` (singleton) vs `createCloudAgentStore` (factory) are two different store patterns for the same job. If either survives, consolidate.

---

> The live surfaces (`orchestration`, `workflow-composer`) are 🟢. The unmounted set (Q1/Q2) is dead code / broken-panel debt to resolve with the maintainer — tracked in `architecture.md` §7.
