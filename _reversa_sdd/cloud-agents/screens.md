# Screens — `cloud-agents` (Cloud Agents view + provider session)

> Produced by the Reversa Visor on 2026-05-29. Maintainer-narrated.
> Confidence: 🟢 CONFIRMED (visible) · 🟡 INFERRED · 🔴 GAP.
> View: `gatomia.views.cloudAgents` ("Cloud Agents") — a TreeView created in `bootstrapCloudAgents` (`src/extension.ts:2661`), backed by the `cloud-agents` runtime. 🟢
> Source images: `cloud-agents/screenshots/cloud-agents-view-populated.png`, `cloud-agents/screenshots/devin-cloud-provider-session.png`.

---

## Screen A — Cloud Agents view, EMPTY 🟢
- Captured in the sidebar composite (`providers/screenshots/gatomia-sidebar.png`): **"No sessions"** with provider label **"Devin"**. The view shows the configured provider even with zero sessions. 🟢

## Screen B — Cloud Agents view, POPULATED 🟢
> Capture: `cloud-agents/screenshots/cloud-agents-view-populated.png`.
- **Header actions:** refresh (↻) and a sync/swap (⇄) action. 🟡
- **Session node (⚠):** `T040: Validate full observability acceptance checklist in \`specs/001-observabil…\`` — a running cloud session; the ⚠ icon flags attention (e.g. blocked / needs input). 🟢
  - **Sub-item (○):** the task title again with a status circle (in-progress). 🟡
  - **`PR: 001-observability-stack` `open`** — the linked pull request with its state badge (`open`). 🟢
  - **`Open in Provider`** (↗) — opens the session in the external provider (Devin / Copilot). 🟢
- **Tie-in:** sessions + PR state come from `cloud-agents/polling-and-normalization` (normalized `AgentSession` with PR status); creation via `cloud-agents/create-session`; retention via `session-retention-cleanup`. The PR→checkbox sync ties to the Devin/`tasks` integration. 🟡

## Screen C — Clicking a running agent (content) 🟢
- Per the maintainer, clicking a running agent shows its **content/transcript**. For the local-ACP case this is the **Agent Chat** panel (see `webview-agent-chat/screenshots/agent-chat-active-transcript.png` — identical capture). Cloud sessions are **read-only** mirrors (R-AC-3). 🟡

## Screen D — Provider session (via "Open in Provider") 🟢 (external UI)
> Capture: `cloud-agents/screenshots/devin-cloud-provider-session.png`. This is the **external Devin Cloud** provider UI (shown in Windsurf / "Cognition Platform (Enterprise)") — what `Open in Provider` opens. Illustrative repo: `sbr-dabtkn-bchainconnector` (not gatomia itself). 🟢
- **Left — agent execution log (Devin Cloud):** the task prompt ("execute specific tasks from a spec-driven plan… Feature path: specs/001-observability-stack… read spec.md/plan.md/tasks.md… execute only T040"), then `Worked for 2 seconds`, `Working for 7 minutes 53 seconds (+2 -2)`, interleaved `Thought for Ns`, `Read …`, `Searched …`, task progress `5/10 → 8/10 tasks done`, git ops (`git checkout -b devin/…`, lint/tests, `git commit`, `git push origin devin/1780351319-t040-validate-acceptance-checklist`), `Fetching PR template`. 🟢
- **Composer:** `Ask anything (⌘L)`, `+ Agent`, `All repos`, **`Devin Cloud`** (with a stop control). 🟢
- **Right — `Preview requirements.md`:** rendered **"Acceptance Checklist: Observability Foundation Rollout"** — a Specification-Quality gate (all `[x]`), **Functional Requirements Verification** `FR-001…FR-018`, and **Success Criteria Validation** `SC-001…SC-004`. 🟢
- **Status bar:** `Cognition Platform (Enterprise)` · `Windsurf · Settings`. 🟢

---

## States captured
- Cloud Agents view: **empty** (composite) and **populated** (running `T040` + open PR + Open in Provider). 🟢
- Provider session (Devin Cloud, external) — running with branch pushed + PR template fetch. 🟢
- Not captured: completion/terminal session in the view, the unified `CloudAgentProgressPanel` (`panels/cloud-agent-progress-panel`) rendering, multi-provider (GitHub Copilot) session. 🔴

## Mapping notes
- The Cloud Agents **view** renders `cloud-agents` domain data; provider session UI is **external** (Devin Cloud) reached via `Open in Provider`. Cross-ref the sidebar composite (`providers/screens.md` §6) for the empty state.
