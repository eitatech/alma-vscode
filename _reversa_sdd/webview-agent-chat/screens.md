# Screens — `webview-agent-chat` (Agent Chat panel)

> Produced by the Reversa Visor on 2026-05-29. Maintainer-narrated flow.
> Confidence: 🟢 CONFIRMED (visible) · 🟡 INFERRED · 🔴 GAP.
> Source images: `webview-agent-chat/screenshots/agent-chat-new-session.png` (empty/new), `…/agent-chat-active-transcript.png` (active).
> Container: auxiliary bar **"GatomIA Chat"** (`gatomia-chat`) → view `gatomia.views.agentChat` ("Agent Chat"), provider `src/providers/agent-chat-view-provider.ts` (🟢). This is the **spec 018** flagship surface.
> Units: `inputbar-composer-gating` (composer), `message-reducer-routing` (transcript), `bridge-lifecycle` (postMessage bridge).

---

## Entry
The panel is reached from **Running Agents → `+ New agent session…`** (new), or by **clicking an Active/Recent session** (reopen with transcript). The aux-bar shows two tabs: **`CHAT`** (native Copilot Chat) and **`AGENT CHAT`** (this GatomIA panel). 🟢

---

## State A — New session (empty composer) 🟢
> Capture: `agent-chat-new-session.png`.
- **Header actions (top-right):** new (`+`), history (↺), split, maximize, close. 🟡
- **Body:** empty (no transcript yet). 🟢
- **Composer (bottom):**
  - Placeholder: **"Describe the task you want the agent to start with…"** 🟢
  - Controls: **agent picker** (person-icon dropdown — selects the **ACP-available agent**), a **`None`** dropdown (mode), an **`Auto`** dropdown (model/auto), and a **send** arrow (`↑`). 🟡 (labels confirmed; exact bound field inferred)
- **Behavior:** the user selects an ACP agent + config, types the task, and submits to **create a session** (`agent-chat/start-and-run-session`; capability/model resolution per `agent-chat`). 🟡

## State B — Active session transcript 🟢
> Capture: `agent-chat-active-transcript.png`. Example task: *"atualize meu arquivo CHANGELOG.md ele está totalmente errado."*
- **User turn:** right-aligned bubble with the user's message. 🟢
- **Agent turn:** labeled **"Copilot CLI"** (bot icon) — the selected ACP agent. First line: **"Invoked skill: gatomia"**. 🟢
- **Turn-by-turn transcript** — interleaved **action summaries** (muted) and **agent reasoning** (normal), i.e. the ACP event stream projected into typed `ChatMessage`s (`message-reducer-routing`):
  - muted summaries: `Reviewed 3 files and inspected recent history`, `Reviewed package.json and searched for version patterns`, `Searched for files matching release version patterns`, `Applied patch to files`, `Reviewed CHANGELOG.md and ran project checks`, `Ran bd close gatomia-vscode-5gc && git add CHANGELOG.m…`, `Ran git commit -m "docs(changelog): rebuild release hi…"`, `Inspected staged beads sync diff and committed changes`. 🟢
  - agent reasoning paragraphs between each step; final **summary** ("Atualizei e publiquei o CHANGELOG.md…", noting versions `v0.36.0`/`v0.37.0` and push to `origin/018-agent-chat-panel`). 🟢
- **Message footer:** model badge **`GPT-5.4`** + a **copy** icon. 🟢
- **Composer (bottom):** placeholder **"Run tasks in the background with the Copilot CLI, type `#` for adding context"**; controls: `+` (add context), **`Agent`** dropdown, **`GPT-5.4 · Medium`** model dropdown, send arrow. 🟢
- **Panel footer bar:** **`Copilot CLI`** (agent) · **`Default Approvals`** · **`Workspace`** (scope). 🟢 (these select the session's agent / approval policy / execution scope) 🟡

---

## Elements
- **Transcript list:** alternating user/agent turns; agent turns embed tool-call/action summaries + reasoning + a model badge + copy action. 🟢
- **Composer / InputBar:** multiline task input + agent/model/mode pickers + `#` context insertion + send. Maps to `inputbar-composer-gating` (input enabled only when the session accepts a turn; cloud/terminal sessions gate input — R-AC-3). 🟡
- **Tabs:** `CHAT` (native) vs `AGENT CHAT` (this panel). 🟢

## States captured
- **A. New/empty** (compose a task to start). 🟢
- **B. Active/populated** (running/finished session transcript with tool calls, reasoning, model badge). 🟢
- Not captured: queued follow-up (at-most-one, R-AC-2), pending file-write Accept/Reject gate, cloud read-only session, error/cancelled terminal states. 🔴

## Mapping notes
- The agent shown is **Copilot CLI** (an ACP agent) running model **GPT-5.4** — per the maintainer, this is the Agent Chat panel rendering a running agent's full history (not the native Copilot Chat tab). 🟢 (maintainer-confirmed)
- Transcript fidelity (tool-call summaries + agent messages + final summary) matches `agent-chat`'s `AcpChatRunner` projection and `webview-agent-chat/message-reducer-routing`. 🟡
