# Screens — `providers/spec-explorer-tree` (Specs tree, detailed)

> Produced by the Reversa Visor on 2026-05-29.
> Confidence: 🟢 CONFIRMED (visible) · 🟡 INFERRED · 🔴 GAP.
> Source images: `providers/spec-explorer-tree/screenshots/specs-tree-detail-1.png`, `…-2.png` (left pane of the Document Preview captures).
> Companion: the composite `providers/screenshots/gatomia-sidebar.png` shows this view collapsed; this file documents it **fully expanded**.

---

## Screen: Specs tree (expanded) 🟢

- **View:** `gatomia.views.specExplorer` ("Specs"), header actions `+` (new spec) and `…` (overflow).
- **State:** fully populated and expanded — active spec, archived specs, and per-task nodes visible.

### Hierarchy 🟢
- **Current Specs**
  - **Agent Chat Panel** (active spec)
    - `Spec` → `specs/018-agent-chat-panel/spec.md`
    - `Plan` → `specs/018-agent-chat-panel/plan.md`
    - `Research` → `specs/018-agent-chat-panel/research.md`
    - **Contracts** (group)
      - `Agent capabilities contract`
      - `Agent chat panel protocol`
      - `Agent chat session storage`
      - `Worktree lifecycle`
    - `Data Model` → `specs/018-agent-chat-panel/data-model.md`
    - `Quickstart` → `specs/018-agent-chat-panel/quickstart.md`
    - **Checklists** (group, collapsed)
    - **Tasks** (group, expanded — see below)
  - **Review**
    - `Jetbrains Extension` — *Ready for reviewers* 🟢
  - **Archived** (expanded)
  - **Changes** (group)

### Tasks node — per-task status + actions 🟢
The **Tasks** group renders phase/user-story nodes, each with a **status icon**, and drills into individual task items:
- `Setup (Shared Infrastructure)` ✅
- `Foundational (Blocking Prerequisites)` ✅
- `User Story 1 — Watch and Interact with a Running…` ✅
- `User Story 2 — Reopen an Agent's Execution…` ✅
- `User Story 3 — Configure Mode, Model, and E…` ✅
- `User Story 4 — Monitor Multiple Concurrent A…` ✅
- `Polish & Cross-Cutting Concerns` (expanded)
  - `T077: Integration test tests/integration/agen…` ✅
  - `T078: Unit test 'tests/unit/features/agent-ch…` ✅
  - `T079: Updated 'quickstart.md' §8 Troublesh…` ✅
  - `T080: Ran 'npm test' (2577 pass / 0 fail / 87…` ✅
  - **`T081: Manually walk through all six se…`** — **IN PROGRESS** 🟢

#### In-progress task affordance (the "click a task in progress" case) 🟢
> Detail crop: `providers/spec-explorer-tree/screenshots/task-t081-run-cloud-actions.png`. Icon semantics **confirmed by the maintainer**.
- `T081` is **not** a green check — it shows an **in-progress / pending** status icon (a hollow target/circle) and reveals two inline hover-actions on the right:
  - **▶ (run)** — 🟢 **execute the task locally** (run the task on this machine; ties to `orchestration/autonomous-task-loop` + `tasks/resolve-and-dispatch`).
  - **☁ (cloud)** — 🟢 **execute the task in the cloud** using **whichever cloud service is configured** (e.g. **Devin** or **GitHub Copilot** coding agent); ties to `commands/cloud-dispatch` + `cloud-agents` provider registry.
- **Behavior (maintainer-confirmed):** the Specs tree is not read-only — individual `tasks.md` items are **actionable** nodes that can be **run locally (▶)** or **dispatched to the configured cloud provider (☁)**, with the task's status icon reflecting completion. This is the UI surface of the task → agent dispatch pipeline. 🟢
- **Provider selection:** the cloud target is the currently-configured provider (Devin / GitHub Copilot), resolved via `tasks/provider-selection` + `cloud-agents/provider-registry`. 🟡 (exact resolution rule inferred)

### Archived specs (with archival dates) 🟢
`Devin Integration` (3/30/2026), `Hooks Module` (1/26/2026), `Document Preview` (1/9/2026), `Fix Delete Spec` (1/9/2026), `Mcp Hooks Integration` (1/26/2026), `Welcome Screen` (1/9/2026), `Spec Review Flow` (1/26/2026), `Auto Review Transition` (1/26/2026), `Copilot Agents` (3/30/2026), `Custom Agent Hooks` (3/30/2026), `Steering Instructions Rules` (3/30/2026), `Create Spec Ui Redesign` (3/30/2026), `Hooks Refactor` (3/30/2026), `Multi Provider Agents` (4/13/2026), `Extension Docs Tree` (4/20/2026).

> These archived entries are the rendered, human-readable view of the SDD feature lineage (cross-ref `traceability/spec-impact-matrix.md` §3). Note the lineage's `009` gap is absent here too (consistent with "abandoned"). 🟢

---

## States captured
- Active spec **expanded** with Contracts + Tasks drilled in; **Archived** expanded; one spec in **Review** ("Ready for reviewers"). 🟢
- Per-task statuses: **done** (✅) vs **in-progress** (T081, with run/cloud actions). 🟢

## Gaps / follow-ups
- ✅ Resolved: ▶ = run locally, ☁ = run in cloud via configured provider (Devin / GitHub Copilot) — **maintainer-confirmed** (was 🟡, now 🟢).
- 🟡 Remaining: the exact provider-resolution rule for ☁ (how the "configured" cloud provider is chosen when multiple exist).
- Not captured: Checklists expanded, the new-spec (`+`) flow, context menus, the Changes node contents. 🔴
