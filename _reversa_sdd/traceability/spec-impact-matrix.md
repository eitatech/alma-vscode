# Spec Impact Matrix — gatomia

> Produced by the Reversa Architect (interpretation phase).
> Confidence: 🟢 CONFIRMED from code · 🟡 INFERRED · 🔴 GAP.
> Purpose: answer *"if I change component X, what else is impacted?"* and trace SDD features → modules. Drives change-risk assessment for the Writer/Reviewer and any forward-cycle feature.

---

## 1. Directed dependency map (A depends on B)

> Read as **A → B** = "A imports/uses B; a breaking change in B impacts A".

### Extension host

| From (A) | To (B) | Reason |
|----------|--------|--------|
| `extension.ts` | `services/acp/*`, `services/prompt-loader`, `services/chat-router`, `services/dependency-checker` | activation wiring |
| `agent-chat` | `services/acp/acp-session-manager` | spawns/drives ACP sessions |
| `agent-chat` | `services/document-preview-service` | artifact sections |
| `agents` | `services/agent-service`, `services/prompt-loader` | chat-participant registration, resources |
| `cloud-agents` | `services/dependency-checker` | credential/CLI gating |
| `devin` | `services/acp/*` | reuses ACP client for v3 detection |
| `hooks` | `services/mcp-client`, `services/acp/acp-session-manager` | MCP + ACP actions |
| `orchestration` | `agent-chat` (registry/store), `cloud-agents` (storage/registry), `hooks` (triggers) | session aggregation + task lifecycle hooks |
| `spec` | `hooks` (triggers), `utils/spec-kit-adapter` | fires SDD-op triggers; system detection |
| `steering` | `services/prompt-loader`, `utils/chat-prompt-runner` | constitution via chat |
| `tasks` | `utils/spec-kit-adapter`, `utils/task-parser` | path resolution + parsing |

### Providers → features

| Provider | Depends on |
|----------|------------|
| `AgentChatViewProvider` | `agent-chat` (registry/store/model-discovery/capabilities) |
| `SpecExplorerProvider` | `spec` (review-flow state, `SpecManager`) |
| `HookViewProvider` | `hooks` (manager/executor/MCP) |
| `WelcomeScreenProvider` | `services/welcome/*`, `services/dependency-checker` |
| `OrchestrationViewProvider` | `orchestration` (read-model) |
| `RunningAgentsTreeProvider` | `agent-chat` + `cloud-agents` |
| `CloudAgentProgressProvider` | `cloud-agents` |

### Panels & commands

| Component | Depends on |
|-----------|------------|
| `AgentChatPanel` | `agent-chat` (registry/store/runner) |
| `WelcomeScreenPanel` | `steering` (doc creation) |
| `DocumentPreviewPanel` | `services/document-preview-service` |
| `CloudAgentProgressPanel` | `cloud-agents` |
| `DevinProgressPanel` | `devin` |
| `AgentChatCommands` | `agent-chat`, `panels/agent-chat-panel` |
| `CloudAgentCommands` | `cloud-agents` |
| `DevinCommands` | `devin` |

### Webview

| From | To | Channel |
|------|----|---------|
| all `ui` features | `webview-shared` (`bridge/vscode`, UI primitives) | import |
| `webview-orchestration` | `webview-hooks-view` | reuses Hook types + HookForm |
| `webview-spec-explorer` | 🟡 `src/` types + own `acquireVsCodeApi()` | **drift (R-X-6)** |
| `webview-agent-chat` | `agent-chat` module | postMessage |
| `webview-hooks-view` | `hooks` module | postMessage |
| `webview-preview` | `panels/document-preview-panel` | postMessage |
| `webview-welcome` | `services/welcome/*` | postMessage |

---

## 2. Reverse impact — high blast-radius components

> Changing these ripples widely. Ordered by number of dependents.

| Component | Dependents (impacted by a change) | Blast radius |
|-----------|-----------------------------------|--------------|
| `utils/spec-kit-adapter` (`SpecSystemAdapter`) | `spec`, `tasks`, `providers`, `services` | **High** 🟢 |
| `bridge/vscode.ts` (webview) | every webview feature except spec-explorer | **High** 🟢 |
| `agent-chat` types (`AgentChatSession`, FSM) | `agent-chat`, `orchestration`, `providers`, `panels`, `webview-agent-chat` | **High** 🟢 |
| `services/acp/acp-client` | `agent-chat`, `devin`, `hooks` (acp action) | **High** 🟢 |
| `hooks` `TriggerRegistry` / trigger contract | `spec`, `orchestration`, `hooks` consumers | **Medium** 🟢 |
| `cloud-agents` `AgentSession` shape | `cloud-agents`, `orchestration`, `providers`, `panels` | **Medium** 🟢 |
| `NormalizedTask` (`utils/task-parser`) | `tasks`, `orchestration`, `providers` | **Medium** 🟢 |
| `postMessage` protocol (per page) | the paired provider/panel + webview feature | **Medium** 🟢 |

> **Guidance:** any change to the shared `SpecSystemAdapter`, the webview bridge, or the agent-chat session contract should be treated as a cross-cutting change and gated by the parity tests (`webview` type mirror) and the integration suite.

---

## 3. SDD feature lineage → modules touched

> Reconstructed from Git history (880 commits) and code comments referencing `specs/NNN-*`. The numbering **skips `009`** — 🟢 resolved 2026-05-29 (Reviewer): `009` was **abandoned** (started then dropped; number never reused). Confidence 🟡 (inferred mapping) unless the module is named in code 🟢.

| Spec | Theme | Primary modules |
|------|-------|-----------------|
| 001 | Devin integration | `devin`, `panels/devin-progress-panel`, `commands/devin-commands` |
| 002–005 | Hooks / preview / welcome foundations | `hooks`, `webview-preview`, `webview-welcome` |
| 006–007 | Steering / instructions | `steering`, `providers/actions-explorer-provider` |
| 008 | Auto review transition | `spec/review-flow` (`state.ts`, telemetry) |
| 009 | *(abandoned — never reused)* 🟢 | resolved 2026-05-29: started then dropped |
| 010 | Copilot agents | `agents`, `services/agent-service` |
| 011 | Custom agent hooks | `hooks` (output capture, timing, ACP action) |
| 012–015 | Multi-provider cloud + docs tree | `cloud-agents`, `providers/*` |
| 016 | Unified cloud-agent progress | `cloud-agents`, `panels/cloud-agent-progress-panel` |
| 017 | MAESTRO orchestration | `orchestration`, `tasks`, `webview-orchestration` |
| 018 | Agent chat panel | `agent-chat`, `services/acp`, `webview-agent-chat`, `providers/agent-chat-view-provider` |

> Branch at extraction time: `018-agent-chat-panel`. The `MAESTRO:` commit series (2026-04-30→05-04) overlays specs 017+ with the pluggable task layer, React Flow composer, Kanban board, and autonomous loop (ADR-0015, prototype).

---

## 4. External integration ownership

| External system | Owning module(s) | Protocol |
|-----------------|------------------|----------|
| Devin Cloud API | `devin` (legacy) **and** `cloud-agents/adapters/devin-adapter` 🔴 | REST v1/v2/v3 |
| GitHub Copilot Coding Agent | `cloud-agents/adapters/github-copilot-adapter` | GraphQL + REST |
| GitHub PRs | `devin/pr-review-integration`, `cloud-agents/adapters/*` | REST |
| Local ACP CLI agents | `services/acp/acp-client` | JSON-RPC/stdio |
| ACP Registry CDN | `services/acp/acp-provider-registry` | HTTPS |
| Copilot Chat (LM API) | `services/chat-dispatcher` | `vscode.lm` |
| MCP servers | `hooks/services/mcp-client`, `utils/copilot-mcp-utils` | `vscode.lm.invokeTool` |
| Git / worktrees | `agent-chat/agent-worktree-service`, `devin/git-operations` | git CLI |
| SpecKit / OpenSpec | `utils/spec-kit-adapter` | filesystem |
| Home-dir Copilot resources | `steering/global-resource-access-consent` | filesystem (consent-gated) |

---

## 5. Change-risk register (🔴 fragile coupling)

| Risk | Components | Why it's fragile | Resolution (2026-05-29, Reviewer) |
|------|------------|------------------|-----------------------------------|
| Devin ownership overlap | `devin` ↔ `cloud-agents` | two polling owners for the same remote session | ✅ `devin` standalone is **legacy** → remove its poller/commands; `cloud-agents` is canonical |
| Autonomous loop session shape | `orchestration/autonomous-agent-loop` → `agent-chat` types | builds non-canonical session; checks non-existent `"error"` state | ✅ Build a **real** session via `AgentChatSessionStore`; `completed`→success, other terminal→failure; `"error"` check is a defect to fix |
| CR→tasks pipeline | `spec/review-flow/tasks-dispatch` | mock generator; real wiring absent | ✅ Real producer = **`/speckit.tasks`** scoped to the CR (replace mock) |
| Webview spec-explorer drift | `webview-spec-explorer` → `src/` | bypasses bridge + type mirror; breaks on extension-type changes | ✅ **Migrate** to shared `@/bridge/vscode` + `types.ts` contract mirror |
| Unmounted pages | `panels/{devin,cloud-agent}-progress` → `page-registry` | request pages that don't exist ("Unknown page") | ✅ **Ship & wire**: register `cloud-agent-progress` + Kanban importer + contract mirror; legacy `devin-progress` removed with the standalone `devin` path |

> ✅ **All five change-risk items were resolved with the maintainer on 2026-05-29** (see `_reversa_sdd/questions.md` Q1–Q3, Q6–Q7). They remain the most likely sources of regressions for any forward-cycle change until the implementation follows the resolutions above. Cross-reference `architecture.md` §7 (technical debt) and `domain.md` §5.
