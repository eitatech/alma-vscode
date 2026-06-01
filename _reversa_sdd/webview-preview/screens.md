# Screens — `webview-preview` (Document Preview panel)

> Produced by the Reversa Visor on 2026-05-29.
> Confidence: 🟢 CONFIRMED (visible in screenshot) · 🟡 INFERRED · 🔴 GAP.
> Source images: `webview-preview/screenshots/document-preview-tasks-1.png` (mid-scroll), `…-tasks-2.png` (bottom-scroll).
> Primary unit: `webview-preview/preview-lifecycle` (the panel + view-mode toggle); rendering covered by `webview-preview/markdown-pipeline`.

---

## Screen: Document Preview 🟢

- **Type:** VS Code editor-area **WebviewPanel** (not a sidebar view). Host: `panels/document-preview-panel` → React `PreviewApp` (`webview-preview`, page `document-preview`).
- **Context of use:** opened by clicking a spec artifact in the **Specs** tree (here, the `Tasks` of `018-agent-chat-panel`). 🟡
- **State captured:** populated, rendered-preview mode, viewing `specs/018-agent-chat-panel/tasks.md`.

### Editor chrome 🟢
- **Tabs:** `ACP - AMBIMA Community Process Untitled-1`, `-> ODS Untitled-2`, **`Document Preview`** (active, ✕ to close).
- **Top bar:** back/forward nav arrows; breadcrumb `Document Preview — gatomia-vscode — Python`; a count badge `6`; refresh/comment icon; **`Update`** button (accent/pink) — 🟡 regenerate/refresh the rendered document.

### Preview header 🟢
- **Title:** `Tasks` (H1).
- **Subtitle / source path:** `specs/018-agent-chat-panel/tasks.md`.
- **View-mode toggle (top-right, 3 segmented buttons):** 🟡 rendered **Preview** / **Source** / **Edit** — the **Edit** (pencil) button is highlighted (accent), indicating the active mode allows inline editing/refinement. (Ties to `webview-preview/refinement-flow`.)

### Rendered body 🟢
The markdown pipeline renders headings, paragraphs, inline `code`, **bold**, links, and **task checkboxes**:
- **Checked (done):** e.g. `T006 [P] Create ui/src/features/agent-chat/types.ts …`, `T007`, `T008`, `T009a/b`, `T010`, `T012–T017` (image 1); `T077`, `T078 [P]`, `T079 [P]`, `T080` (image 2).
- **Unchecked (pending):** `T081 Manually walk through all six sections of quickstart.md` (image 2). 🟢
- **Section headings rendered:** "Session store (persistence) — TDD", "Registry — TDD", "AcpClient event bus + per-(providerId, cwd) keying — TDD", "Cloud-agents (spec 016) event-stream extension — TDD", "Phase 3: User Story 1 …", "Phase 7: Polish & Cross-Cutting Concerns", "Dependencies & Execution Order", "Parallel opportunities". 🟢
- **Callouts:** `Checkpoint:` paragraphs; `Goal:` / `Independent Test (from spec.md)` blocks. 🟢

### Metadata footer 🟢
A 4-column metadata strip at the bottom of the document:

| TYPE | VERSION | OWNER | LAST UPDATED |
|------|---------|-------|--------------|
| task | — | — | 2026-06-01T21:23:00.481Z |

> The footer reflects the spec artifact's frontmatter/derived metadata (here `type: task`; version/owner empty). 🟡

### Status bar (bottom) 🟢
`018-agent-chat-panel*` · `Beads` · ⊘ 0 · ⚠ 0/0 · `Sarif` · `Mise` · `AzureOpenAI: Completion` · `Screen Reader Optimized` · `Prompt Registry` · `GatomIA: Copilot Chat` · `Chat` · `CodeQL CLI v2.25.5`.

---

## Document types rendered (captured)
- **Spec task list** — `specs/018-agent-chat-panel/tasks.md` (TYPE=`task`) — documented above. 🟢
- **Repo Wiki doc** — `docs/overview.md` ("Gatomia Vscode"), opened from the Repo Wiki tree (TYPE=**`doc`**, VERSION=`v0.32.1-2-g5a4ac1b` from git-describe). Renders a **Mermaid** architecture diagram (VS Code Extension Host → UI Layer → Core Automation → External Systems) plus a numbered Data Flow list — confirming `markdown-pipeline` includes **Mermaid** rendering. Capture: `providers/screenshots/repo-wiki-view-expanded.png`. 🟢

## States captured
- **Populated / rendered-preview** with **Edit** mode active (two scroll positions captured). 🟢
- Two document TYPEs captured: `task` (spec) and `doc` (wiki, with Mermaid). 🟢
- Not captured: **Source** mode, **empty/loading** state, **refinement** interaction, error state. 🔴

## Mapping notes
- The same captures show the **Specs tree** on the left — documented in `providers/spec-explorer-tree/screens.md` (co-located originals there as `specs-tree-detail-*.png`).
- Other `webview-preview` units not yet captured: `interactive-form`, and the `refinement-flow` in action. 🔴
