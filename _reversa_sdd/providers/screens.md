# Screens — `providers` (GatomIA sidebar)

> Produced by the Reversa Visor (UI documentation from screenshots) on 2026-05-29.
> Confidence: 🟢 CONFIRMED (visible in screenshot, cross-checked vs `package.json` `contributes.views`) · 🟡 INFERRED · 🔴 GAP.
> Source image: `providers/screenshots/gatomia-sidebar.png` (1044×3318).
> Granularity: `hybrid` — this composite captures the whole **GatomIA** activity-bar container (`viewsContainers.activitybar` id `gatomia`, title "GatomIA"), which is owned by the `providers` module. Two sections map to nested units (`spec-explorer-tree`, `hooks-panel-crud`); the rest map at the `providers` module level.

---

## Container: GatomIA activity-bar 🟢

- **Header:** "GATOMIA" with an overflow `…` menu (view actions). 🟢
- **Composition:** a stacked set of collapsible tree views. 8 of the 11 contributed views are visible in this capture. 🟢
- **Not visible in this capture (below fold / collapsed / empty):** `Orchestration` (`gatomia.views.orchestration`), the primary `Agent Chat` view (`gatomia.views.agentChatPrimary`), and the separate auxiliary-bar container "GatomIA Chat" (`gatomia-chat` → `gatomia.views.agentChat`). 🟡
- **Status bar (bottom):** branch `018-agent-chat-panel*` (dirty), `Beads`, ✓, ⊘ 0 (errors), ⚠ 0/1 (warnings), `Sarif`. 🟢

---

## 1. Specs view 🟢
- **View:** `gatomia.views.specExplorer` ("Specs") → unit **`providers/spec-explorer-tree`**.
- **State:** populated; one active spec expanded.
- **Tree:**
  - `Current Specs` (group)
    - `Agent Chat Panel` (spec group)
      - `Spec` → `specs/018-agent-chat-panel/spec.md` 🟢
      - `Plan` → `specs/018-agent-chat-panel/plan.md` 🟢
      - `Research` → `specs/018-agent-chat-panel/research.md` 🟢
      - `Contracts` (collapsible sub-group) 🟢
      - `Data Model` → `specs/018-agent-chat-panel/data-model.md` 🟡 (label truncated `data-mo…`)
      - `Quickstart` → `specs/018-agent-chat-panel/quickstart.md` 🟡 (label truncated)
- **Per-item:** each artifact has a distinct file icon; clicking opens the markdown (and the spec supports the review-flow webview). 🟡

## 2. Actions view 🟢 (detailed)
- **View:** `gatomia.views.actionsExplorer` ("Actions") → unit **`providers`** (`src/providers/actions-explorer-provider.ts` 🟢).
- **Detail capture:** `providers/screenshots/actions-view-expanded.png`.
- **Header toolbar (4 actions):** agent picker, tools/settings, sparkle (generate), refresh. 🟡
- **State:** populated. The view surfaces **two asset groupings**: the **SDD engine (SpecKit)** and the **coding agent (GitHub Copilot)** assets. 🟢

### 2a. SpecKit (SDD engine) 🟢
- `SpecKit` group with: `Prompts`, `Agents`, `Instructions`, `Scripts`, `Templates`.
- `Templates` (expanded) — backed by `.specify/templates/*`:
  - `[PROJECT NAME] Development Guidelines` → `.specify/templates/a…` 🟡 (truncated; agent-file template)
  - `[CHECKLIST TYPE] Checklist: [FEATURE NAME]` → `.specify/templ…` 🟡
  - `[PROJECT_NAME] Constitution` → `.specify/templates/constitution-te…` 🟡
  - `Implementation Plan: [FEATURE]` → `.specify/templates/plan-templat…` 🟢
  - `Feature Specification: [FEATURE NAME]` → `.specify/templates/spec…` 🟢
  - `Tasks: [FEATURE NAME]` → `.specify/templates/tasks-template.md` 🟢
- **Tie-in:** spec-system detection via `utils/spec-system-adapter`; templates drive `spec`/`tasks`. 🟡

### 2b. Coding agent (GitHub Copilot) assets 🟢
Top-level groups (separate from SpecKit), surfacing the Copilot agent toolkit:
- **`Prompts`** (collapsed).
- **`Agents`** (expanded) — `*.agent.md` files. Includes the project's own agents — **`Gatomia Agent`** (`gatomia.agent.md`), **`Gatomia Orchestrator Agent`** (`gatomia-orchestrator.agent.md`), **`Gatomia Leaf Agent`** (`gatomia-leaf.agent.md`) — plus a library of role/mode agents: `ADR Generator`, `API Architect`, `Senior Cloud Architect` (`cloud-arch` + `github.cloudarch`), `Electron Code Review Mode`, `Example Notification/Review/Test` agents, `Expert React Frontend Engineer`, `Specification Writer` (`github.specification`), `Expert Software Engineer` (`github.swe`), `Task Planner`/`Task Researcher` (`github.*`), TDD **Red/Green/Refactor** (`github.tdd-*`), `Implementation Planner`, `Plan Mode`, `Playwright Tester Mode`, `Principal Software Engineer`, `Prompt Builder`, `Prompt Engineer`, `Software Engineer Agent v1`, `Specification`, and FIRE modes `Activate FIRE` / `FIRE Builder` / `FIRE Planner` (`specsmd-fire*`). 🟢
- **`Skills`** (expanded): `chrome-devtools`, `gatomia`, `gh-cli`, `git-commit`, `github-issues`, `make-skill-template`, `mcp-cli`, `prd`, `refactor`, `vscode-ext-commands`, `vscode-ext-localization`, `web-design-reviewer`, `webapp-testing`. 🟢
- **`Scripts`** (expanded) — `.github/skills/gatomia/scripts/*.py` (verified present 🟢): `Codewiki Analyzer` (`codewiki_analyzer.py`), `Diagram Generator` (`diagram_generator.py`), `Orchestrator` (`orchestrator.py`).
- **`Templates`** (collapsed).
- **Tie-in:** these are the GitHub Copilot agent/prompt/skill assets loaded by the `agents` module (`agent-loader`, `chat-participant-registry`) + `services/agent-service`; the Actions view is their browser/launcher. 🟡

- **Purpose:** a single tree to browse & launch both the **SDD workflow** (SpecKit prompts/templates/scripts) and the **Copilot coding-agent toolkit** (agents/prompts/skills/scripts/templates). 🟢

## 3. Steering view 🟢 (detailed)
- **View:** `gatomia.views.steeringExplorer` ("Steering") → unit **`providers`** (`src/providers/steering-explorer-provider.ts` 🟢) + `steering` module.
- **Detail capture:** `providers/screenshots/steering-view-expanded.png`.
- **Header toolbar (5 actions):** rules, globe (global/user), split view, refresh, shield (security). 🟡
- **State:** populated; git `M` (modified) badges on some entries. Three groups: **Rules**, **Custom Instructions**, **User Instructions**.

### 3a. Rules 🟢
- `Project Instructions` → `.github/copilot-instructions.md` **[M]**
- `SpecKit Constitution` → `.specify/memory/constitution.md`
- `Rules (General)` → `AGENTS.md` **[9+, M]** (badge: 9+ entries, git-modified)

### 3b. Custom Instructions 🟢 (17 — backed by `.github/instructions/*.instructions.md`, verified present)
`Agent Skills File Guidelines` (`agent-skills`), `Custom Agent File Guidelines` (`agents-guidelines`), `AI Prompt Engineering & Safety Best Practices` (`ai-prompt-engineering-safety-best-practices`), `Generic Code Review` (`code-review-generic`), `Genai Script` (`genai-script`), `GitHub Actions CI/CD Best Practices` (`github-actions-ci-cd-best-practices`), `Custom Instructions File Guidelines` (`instructions-guidelines`), `Markdown Content Rules` (`markdown`), `Node.js and JavaScript code with Vitest testing` (`nodejs-javascript-vitest`), `Object Calisthenics Rules` (`object-calisthenics`), `Playwright Typescript` (`playwright-typescript`), `Copilot Prompt Files Guidelines` (`prompt`), `Secure Coding and OWASP Guidelines` (`security-and-owasp`), `Self-explanatory Code Commenting Instructions` (`self-explanatory-code-commenting`), `Shell Scripting Guidelines` (`shell`), `Important Tool Guidelines` (`sonarqube_mcp`), `TypeScript Development` (`typescript-5-es2022`).

### 3c. User Instructions 🟢
- `Global Instructions` → `copilot-instructions.md` — the **global / home-dir** user-level instructions (outside the workspace). This surface is the consent-gated **global-resource access** (ADR-0013; `steering/global-resource-consent`). 🟡

- **Tie-in:** the view aggregates workspace rules + per-file scoped custom instructions + the global user file; creation/CRUD flows live in `steering` (`create-instruction-rule`, `create-project-docs`) and the consent gate in `steering/global-resource-consent`. 🟡

## 4. Repo Wiki view 🟢 (detailed)
- **View:** `gatomia.views.wikiExplorer` ("Repo Wiki") → unit **`providers`** (`src/providers/wiki-explorer-provider.ts` 🟢).
- **Detail capture:** `providers/screenshots/repo-wiki-view-expanded.png`.
- **Source (verified):** the wiki is **generated** under `docs/` — flat docs are `docs/*.md`; categorized docs are `docs/architecture/<category>/*.md`. Generation state lives in `docs/{module_tree,first_module_tree,generation_state,metadata}.json` → produced by the **Codewiki Analyzer** script (`.github/skills/gatomia/scripts/codewiki_analyzer.py`, see Actions §2b). 🟢
- **Header action:** `Synchronize` (regenerate/refresh the wiki). 🟢
- **State:** populated; `Gatomia Vscode` row selected → renders `docs/overview.md` in the Document Preview (see `webview-preview/screens.md`).

### 4a. Flat docs (`docs/*.md`) 🟢
`Agents Management`, `Create Specification View`, `Dependencies Management`, `Dependencies View`, `Form Store System` (`preview_form_store`), `Gatomia Vscode` (`overview`, selected), `Hooks System`, `Hooks View`, `Preview Bridge APIs`, `Preview System`, `Preview System Quick Start` (`preview_quick_start`), `Specification Explorer` (`spec_explorer`), `Specification Management`, `Steering Management`, `System Overview: Hooks Automation Platform` (`system_overview`), `UI Components`, `UI Infrastructure`, `UI View Providers`, `Utilities`, `Welcome Setup`.

### 4b. Categorized docs (`docs/architecture/<category>/`) 🟢
- **Board** → `autonomous-agent-loop`, `kanban-board-model`, `task-card-design`
- **Design system** → `design-system-audit`, `design-system-foundations`, `workflow-interaction-patterns`
- **Hooks** → `hook-composer-ux`, `hook-execution-model`, `schedule-model`, `trigger-model`
- **Orchestration** → `orchestration-ui-contract`, `running-agents-prototype`
- **Tasks** → `autonomous-execution-states`, `pluggable-task-source-model`, `task-normalization-contract`
- **Workflows** → `workflow-composer-contract`, `workflow-inspector-patterns`, `workflow-node-types`

- **Purpose:** generated, browsable architecture/knowledge wiki of the repo; clicking a node opens it in the Document Preview panel. The `Board/Orchestration/Tasks/Workflows` categories document the MAESTRO prototype surfaces (cross-ref `webview-orchestration`, `orchestration`, `tasks`). 🟡

## 5. Running Agents view 🟢 (detailed)
- **View:** `gatomia.views.runningAgents` ("Running Agents") → unit **`providers`** (`src/providers/running-agents-tree-provider.ts` 🟢) + `agent-chat`.
- **Detail capture:** `providers/screenshots/running-agents-view.png`.
- **Tree (maintainer-confirmed semantics):**
  - **`+ New agent session…`** — opens the **Agent Chat** panel to start a new session: pick an **ACP-available agent** + its config, then describe the task. → `webview-agent-chat` (see `webview-agent-chat/screens.md`). 🟢
  - **`Active`** (▶) — agents **currently running**. 🟢
  - **`Recent`** (↺) — sessions that **ran and already finished** (terminal). 🟢
  - **`Orphaned worktrees`** (⚠) — worktrees that were **lost / left behind** (no owning session); candidates for cleanup. 🟢
- **Flow:** clicking a **running** session opens it in the **Agent Chat** panel with its full transcript (history, responses, interactions) — see `webview-agent-chat/screens.md` (active-transcript state). 🟢
- **Tie-in:** sessions are `AgentChatSession`s driven over ACP (`agent-chat/start-and-run-session`); orphaned worktrees link to `agent-chat/worktree-lifecycle`; retention/eviction moves evicted sessions' worktrees to the orphaned list (R-AC-5). 🟡

## 6. Cloud Agents view 🟢
- **View:** `gatomia.views.cloudAgents` ("Cloud Agents") → mapped to the **`cloud-agents`** module (TreeView created in `extension.ts:2661`).
- **States:** **empty** here ("No sessions", provider "Devin"); the **populated** state (running `T040` session + open PR + "Open in Provider") and the external **Devin Cloud** provider session are documented in **`cloud-agents/screens.md`**. 🟢
- **Purpose:** list remote cloud-agent sessions (Devin / GitHub Copilot Coding Agent); open them in the provider. 🟡

## 7. Hooks view 🟢
- **View:** `gatomia.views.hooksExplorer` ("Hooks") → unit **`providers/hooks-panel-crud`**.
- **States:**
  - **Empty** — "No hooks configured yet" + `Add Hook` (+) + `Import Hooks`. 🟢
  - **Populated** — hooks **grouped by action type** with count badges and per-hook actions (run ▶ / pause ‖ / delete 🗑): `Agent Commands`, `Git Operations`, `GitHub Tools`, `Custom Agents`, `Custom Tools`. Detailed in `webview-hooks-view/screens.md`. 🟢
- **Toolbar:** refresh, add, export, import. 🟡
- **Purpose:** CRUD entry for automation hooks; `Add Hook` opens the Hooks webview form (`webview-hooks-view`). 🟡

## 8. Quick Access view 🟢 (detailed)
- **View:** `gatomia.views.overview` ("Quick Access") → unit **`providers`** (overview-provider).
- **Detail capture:** expanded in `webview-welcome/screenshots/welcome-setup.png` + `…/welcome-configuration.png` (left sidebar).
- **Tree (3 groups):**
  - `Spec System`
    - `Select Spec Agent` 🟢
    - `Install Dependencies` 🟢 (tooltip: "Check and install required dependencies for SpecKit and OpenSpec")
  - `Configuration`
    - `Open Settings` 🟢
    - `Open MCP Config` 🟢
  - `Resources`
    - `Help` 🟢
- **Purpose:** compact launcher mirror of the **Welcome to GatomIA** webview — spec-agent selection, dependency install, settings/MCP config, help. Full version documented in `webview-welcome/screens.md`. 🟡

---

## States captured
- **Empty:** Cloud Agents ("No sessions"), Hooks ("No hooks configured yet"). 🟢
- **Populated:** Specs, Actions, Steering, Repo Wiki, Quick Access. 🟢
- **Collapsed/idle:** Running Agents (Active/Recent/Orphaned groups not expanded). 🟢

## Gaps 🔴 / follow-ups
- Webview surfaces are **not** in this capture: Agent Chat panel, Document Preview, Welcome screen, Orchestration (MAESTRO) board, Hooks form. Send screenshots of those to extend coverage. 🔴
- Truncated labels (Data Model / Quickstart / custom-instruction filenames) inferred from naming conventions; confirm exact filenames if precision is needed. 🟡
