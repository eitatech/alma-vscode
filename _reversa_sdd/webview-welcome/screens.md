# Screens — `webview-welcome` (Welcome to GatomIA)

> Produced by the Reversa Visor on 2026-05-29.
> Confidence: 🟢 CONFIRMED (visible) · 🟡 INFERRED · 🔴 GAP.
> Host: `panels/welcome-screen-panel.ts` + `providers/welcome-screen-provider.ts` (🟢); React page `welcome-screen` (`webview-welcome`). Units: `setup-actions`, `welcome-lifecycle`, `requirement-profile`.
> Source images: `welcome-{setup,features,configuration,status}.png`.

---

## Screen: Welcome to GatomIA 🟢
- **Header:** "Welcome to GatomIA" + version badge **v0.37.0** · subtitle "An Agentic Spec-Driven Development Toolkit".
- **Tabs:** **Setup · Features · Configuration · Status · Learn** (Learn not captured 🔴).

### Tab 1 — Setup 🟢 (`welcome-setup.png`)
- **Setup & Dependencies** with a **Refresh** action.
- **System Prerequisites** (cards, all **Installed**): `Node.js` v26.0.0, `Python 3.11+` v3.14.5, `uv package manager` v0.9.26.
- **Dependency cards** (all **Installed**): `GitHub Copilot Chat` v0.47.2026043005, `GitHub Copilot CLI` v1.0.55, `SpecKit CLI` v0.9.1, `OpenSpec CLI` v0.23.0, `GatomIA CLI` v1.0.1. The GatomIA CLI card shows the Copilot-provider config: `gatomia config set --llm-provider copilot --main-model gpt-4`. 🟢
- **What You Need** checklist (green): GitHub Copilot Chat, GitHub Copilot CLI, SpecKit or OpenSpec, GatomIA CLI, Workspace Setup (optional).
- **Next Steps: Initialize Your Spec System** → "SpecKit Initialized" with create-spec / templates / plan / tasks guidance.
- **Tie-in:** dependency detection via `services/dependency-checker`; install action = Quick Access → Install Dependencies (`setup-actions`). 🟡

### Tab 2 — Features 🟢 (`welcome-features.png`)
- **Features & Quick Actions** — "Cards … mirror the commands contributed by the extension; some groups only appear on compatible IDE hosts." 🟢 (the Welcome screen is a launcher mirror of `package.json` commands)
- **Specs:** Create New Spec, Refresh Specs.
- **SpecKit Workflow** (canonical SDD pipeline): Create Constitution, Specify Feature, Clarify Requirements, Plan Feature, Research Feature, Define Data Model, Create Design, Generate Tasks, Analyze Spec Quality, Run Checklist, Convert Tasks to Issues, Implement Feature, Create Unit Tests, Create Integration Tests.
- **Actions:** Create Prompt, Create Prompt (Built-in), Create Agent, Create Skill, Refresh Actions.
- **Hooks:** Add Hook, View Hook Logs, Refresh Hooks, Export Hooks, Import Hooks.
- **Steering:** Create Project Rule, Create User Rule, Create Constitution, Global Access Settings, Refresh Steering.
- **Cloud Agents:** "Dispatch work to remote execution providers" (group cut off at bottom). 🟡
- **Tie-in:** each card invokes a contributed `gatomia.*` command (cross-ref Actions/Steering/Hooks modules + `commands`). 🟡

### Tab 3 — Configuration 🟢 (`welcome-configuration.png`)
- **Configuration Overview** — "Changes are saved to your workspace settings automatically." + **Open Full Settings** button.
- **Quick Edit Settings:**
  - `Spec System` = **Auto** (dropdown) — auto-detect SpecKit/OpenSpec from workspace files.
  - `SpecKit Specs Path` = `specs`
  - `SpecKit Memory Path` = `.specify/memory`
  - `SpecKit Templates Path` = `.specify/templates`
  - `OpenSpec Path` = `.openspec`
  - `Prompts Path` = `.prompts`
- **Configuration Tips:** Spec System / Paths (relative or absolute) / Validation / Persistence. 🟢
- **Tie-in:** writes through to VS Code workspace configuration; paths consumed by `utils/spec-system-adapter`, `prompts`. 🟡

### Tab 4 — Status 🟢 (`welcome-status.png`)
- **All Systems Healthy** — "Extension is working correctly with all dependencies installed".
- **Version Information:** Gatomia Extension **v0.37.0**; VS Code **v1.119.0-insider**. + **View Changelog**.
- **System Prerequisites** (REQUIRED, ✓): Node.js v26.0.0, Python 3.11+ v3.14.5, uv v0.9.26.
- **Dependencies:** GitHub Copilot Chat (REQUIRED) v0.47.2026043005, GitHub Copilot CLI (REQUIRED) v1.0.55, SpecKit CLI v0.9.1 (ℹ optional), OpenSpec CLI v0.23.0 (ℹ optional), GatomIA CLI (REQUIRED) v1.0.1.
- **Quick Tips:** diagnostics auto-cleaned after 24h; only 5 most recent issues shown; missing required deps may break features; check Output panel. 🟢
- **Tie-in:** health/diagnostics surface = `welcome-lifecycle` + `services/dependency-checker`. 🟡

### Tab 5 — Learn 🟡 (maintainer-described, no screenshot)
- Contains the **extension's Wiki documentation** — the same content normally published to the project's **GitHub Pages**. Per maintainer; not screenshot-confirmed. 🟡
- Likely surfaces/links the `docs/` wiki content (cross-ref the Repo Wiki view, `providers/screens.md` §4, and the generated `docs/`). 🟡

---

## States captured
- Setup (all deps installed), Features (full action grid), Configuration (quick settings), Status (all healthy). 🟢
- Learn tab documented from maintainer description (Wiki/GitHub Pages content) 🟡.
- Not captured: Learn tab screenshot; missing-dependency / unhealthy state (un-installed cards / warnings). 🔴

## Mapping notes
- The Welcome screen mirrors the contributed command surface; the **Quick Access** sidebar (`gatomia.views.overview`) is the compact launcher equivalent — see `providers/screens.md` §8.
- The `requirement-profile` unit (workspace requirement profiling) is not clearly isolated in these captures. 🔴
