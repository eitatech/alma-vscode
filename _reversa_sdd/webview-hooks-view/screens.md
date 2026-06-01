# Screens — `webview-hooks-view` (Hooks panel & form)

> Produced by the Reversa Visor on 2026-05-29.
> Confidence: 🟢 CONFIRMED (visible) · 🟡 INFERRED · 🔴 GAP.
> Host: Hooks WebviewPanel (page `hooks`) ↔ `providers/hooks-panel-crud` (tree) ↔ `hooks` module (backend).
> Units: `action-form-routing` (form switches by action type), `hooks-crud` (create/edit/delete/enable), `mcp-discovery-grouping` (MCP tool grouping for GitHub/Custom Tools).
> Source images: `hooks-create-agent-command.png`, `hooks-edit-with-logs.png`, `hooks-create-git-operation.png`, `hooks-create-custom-agent.png`, `hooks-create-acp-agent.png`.

---

## Screen: Hooks 🟢
- **Header:** "Hooks" — "Configure automated actions triggered by agent operations. Use the Hooks view toolbar to add hooks, open execution logs, or import/export configurations."
- **Hook Details:** "Configure automation rules for SpecKit/OpenSpec workflows".
- **Sidebar toolbar (Hooks view):** refresh, add (`+`), export (cloud-up), import (cloud), overflow. 🟡

### Hook tree — grouped by action type 🟢
> `providers/hooks-panel-crud`. Each group shows a hook count; per-hook inline actions: run (▶), pause (‖), delete (🗑).
- **Agent Commands** (`1 hook`) — e.g. `Auto Clarify after Specification` · `speckit.specify → /speckit.clarify $specId`
- **Git Operations** (`1 hook`) — e.g. `Stash after Implementation` · `speckit.implementation → Git Push • Active`
- **GitHub Tools** (`0 hooks`) — "No hooks configured for this action type"
- **Custom Agents** (`0 hooks`) — "No hooks configured for this action type"
- **Custom Tools** (`0 hooks`) — "No hooks configured for this action type"
- **Empty state:** "No hooks configured yet" + `Add Hook` + `Import Hooks` (sidebar). 🟢

---

## Create / Edit Hook form 🟢
Shared form (Create Hook ↔ Edit Hook). On **Edit**, the Trigger fields appear locked and the buttons show `Saving…`.

### Common fields
- **Name*** (e.g. "Auto Clarify after Specification"; placeholder "Auto-clarify after specify"). 🟢
- **Enabled** (checkbox). 🟢
- **Trigger:**
  - **Agent** dropdown (e.g. **SpecKit**). 🟢
  - **Operation** dropdown (e.g. `Specify`, `Implementation`, `Unit Tests`, …). 🟢
  - **When to Execute** dropdown (e.g. **After Operation**; before/after timing — ties to `hooks` timing config). 🟢
- **Action → Type** dropdown selects one of the action types below (the form **routes** to type-specific fields — `action-form-routing`). 🟢
- **Buttons:** Cancel · Create Hook (or Saving…). 🟢

### Action type A — Agent Command 🟢 (`hooks-create-agent-command.png`)
- **Command*** (e.g. `/speckit.clarify --spec $specId`).
- **Available Variables** (categorized, click to insert):
  - STANDARD: `$timestamp $triggerType $feature $workspacePath $agentId $agentType`
  - SPEC: `$specId $specPath $useCaseId $requirementId`
  - OUTPUT CAPTURE: `$agentOutput $clipboardContent $outputPath`
  - USER: `$user` · GIT: `$branch $repoOwner $repoName`

### Action type B — Git Operation 🟢 (`hooks-create-git-operation.png`)
- **Operation** dropdown (e.g. **Stash**, Push, …).
- Operation-specific field, e.g. **Stash Message** = `WIP $feature` ("Optional label for the stash entry").

### Action type C — Custom Agent 🟢 (`hooks-create-custom-agent.png`)
- **Agent*** dropdown (e.g. `speckit.doctor`).
- **Agent Type** = **Auto-detect (recommended)** ("Type determined from agent source").
- **Arguments** (e.g. `$specId`).
- Variables here are a **reduced set** (STANDARD + USER + GIT + only `$clipboardContent` from OUTPUT CAPTURE; **no SPEC vars**) — i.e. the variable picker is **scoped per action type** (the `availableFor` gating; note: validation of this is a known stub — see `hooks/questions.md` Q1). 🟢

### Action type D — ACP Agent 🟢 (`hooks-create-acp-agent.png`)
- **Known Agents** (detection-aware checkboxes):
  - `Claude Code` (Detected), `Kimi Code CLI` (Not installed), `Gemini CLI` (Detected), `GitHub Copilot` (Detected), `OpenAI Codex` (Not installed), `Mistral Vibe` (Not installed), **`OpenCode` (Detected, selected)**, `JetBrains Junie` (Detected). 🟢
  - Detection ties to `utils/cli-probe` (CLI availability) + the ACP provider registry. 🟡
- **Mode:** `Local Agent`. **Agent Command:** `OpenCode`. **Task Instruction:** free text (e.g. "do a deep review in the current unit tests…"). **Agent Display Name:** `OpenCode`. **Working Directory:** optional (defaults to workspace root).

### Action types E/F — GitHub Tools / Custom Tools 🟡
- Present as hook groups (0 hooks each in capture); their forms (MCP-tool pickers grouped by server — `mcp-discovery-grouping`) were not captured. 🔴

---

## Execution Logs 🟢 (`hooks-edit-with-logs.png`)
- Below the form: **Execution Logs** with a **Filter by hook** dropdown, **Refresh** / **Close** actions, and "No execution logs yet" empty state. 🟢
- Ties to `hooks` execution history (`View Hook Logs` quick action). 🟡

---

## States captured
- Tree: empty + populated (grouped by 5 action types). 🟢
- Form: Create (4 action types: Agent Command, Git Operation, Custom Agent, ACP Agent) + Edit (locked trigger, Saving…). 🟢
- Execution Logs: empty. 🟢
- Not captured: GitHub Tools / Custom Tools forms (MCP pickers), before-execution + wait-for-completion timing options, populated execution logs. 🔴

## Mapping notes
- Form routing by action type = `action-form-routing`; CRUD/enable/delete = `hooks-crud`; MCP tool grouping (GitHub/Custom Tools) = `mcp-discovery-grouping`. The hook tree is `providers/hooks-panel-crud`. Backend execution/timing/variables = `hooks` module (cross-ref `hooks/questions.md`).
- The **per-action-type variable scoping** observed here is the UI side of the `availableFor` gating; enforcement is a documented stub (`hooks` Q1, decided in review: **enforce**).
