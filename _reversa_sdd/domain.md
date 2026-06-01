# Domain Knowledge — gatomia

> Produced by the Reversa Detective (interpretation phase). Extracts the **"why"** of the system: ubiquitous language, implicit business rules, and domain invariants.
> Confidence scale: 🟢 CONFIRMED (read directly from code) · 🟡 INFERRED (pattern-based, may be wrong) · 🔴 GAP (needs human validation).
> Sources: `_reversa_sdd/code-analysis.md`, `_reversa_sdd/data-dictionary.md`, `specs/`, Git history (880 commits), `.specify/memory/constitution.md`.

---

## 1. System purpose

**gatomia** is a VS Code extension that turns the editor into an **Agentic Spec-Driven Development (SDD)** workbench. It orchestrates AI coding agents — both **local CLI agents** (over the Agent Client Protocol) and **cloud agents** (Devin, GitHub Copilot coding agent) — around a spec lifecycle (SpecKit `.specify/` or OpenSpec `openspec/`), and automates the workflow with event-driven **hooks**. 🟢

There is **no backend server and no database** — the extension is the whole system. State lives in VS Code `workspaceState`, JSON files under `.vscode/gatomia/`, and `SecretStorage` for credentials. 🟢

> 🟡 The product name is `gatomia` (config namespace `gatomia.*`, version `0.37.0`). The repository was forked from **`kiro-for-codex-ide`** on 2025-11-21 and pivoted on day one from OpenAI Codex to GitHub Copilot + OpenSpec/SpecKit conventions (see `adrs/0001-fork-and-copilot-pivot.md`). Residual identifiers (`openspec.chat/echoResult` dev stub, `window.specExplorerVscode`) survive from that lineage.

---

## 2. Bounded contexts (subdomains)

The `src/features/*` folders are the dominant domain partition. They group into five cohesive contexts plus shared infrastructure. 🟢

| Context | Modules | Responsibility |
|---------|---------|----------------|
| **Conversational Agents** | `agent-chat`, `agents`, `services/acp` | Run local ACP agents and cloud agents in a chat panel; own session lifecycle, transcripts, capability negotiation, model discovery, pending-write approval. |
| **Cloud Delegation** | `cloud-agents`, `devin` | Delegate work to remote agents (Devin REST, GitHub Copilot GraphQL); unified polling, status mapping, PR reconciliation, credential gating. |
| **Spec Lifecycle** | `spec`, `steering`, `tasks`, `utils/spec-kit-*` | Create/review/archive specs across two SDD systems; manage steering documents (constitution / AGENTS.md / instruction rules); normalize `tasks.md`. |
| **Automation** | `hooks` | Event-driven engine: bind a trigger + conditions + schedule to an action (agent/git/github/mcp/custom/acp). |
| **Orchestration (MAESTRO)** | `orchestration`, `tasks` | Aggregate all sessions into a monitoring dashboard; an autonomous loop that maps Kanban tasks to spawned agent sessions. 🟡 prototype-stage. |
| **Presentation infra** | `providers`, `panels`, `commands`, `prompts`, `ui/*` | VS Code tree views/webviews, command handlers, prompt templates, the React webview SPA. |

> 🟢 **Context map note:** `cloud-agents` was built as the provider-agnostic successor to the standalone `devin` integration, but **both still run** wired in `extension.ts`. The exact ownership boundary for a given session's polling is a 🔴 gap (see §5).

---

## 3. Ubiquitous language (glossary)

> Domain terms with their precise in-code meaning. Use these names consistently in specs.

| Term | Meaning | Confidence |
|------|---------|------------|
| **Session** | One agent run. Two kinds: an `AgentChatSession` (local ACP or cloud, in `agent-chat`) and an `AgentSession`/`DevinSession` (cloud delegation). Identified by a local UUID; cloud sessions also carry a provider/external id. | 🟢 |
| **Agent (definition)** | A `.agent.md` file (YAML frontmatter + markdown) registered as a **GitHub Copilot chat participant**, exposing named commands bound to tool-registry handlers. Distinct from an "agent" as a running provider. | 🟢 |
| **Provider** | A backend that runs agents. **ACP providers** (local CLIs: Devin, Gemini, spawned over stdio JSON-RPC) vs **Cloud providers** (`CloudAgentProvider`: Devin REST, GitHub Copilot coding agent). Exactly one cloud provider is "active" at a time. | 🟢 |
| **ACP** | Agent Client Protocol (`@agentclientprotocol/sdk`). The local-agent integration: spawn a CLI subprocess and drive it with JSON-RPC over stdio. | 🟢 |
| **Execution Target** | Where an agent-chat session runs: `local`, `worktree` (isolated git branch), or `cloud`. Immutable after the first turn. | 🟢 |
| **Worktree** | A git worktree created to isolate an agent's edits on a dedicated branch; lifecycle `created → in-use → cleaned/abandoned`; destructive cleanup needs explicit confirmation. | 🟢 |
| **Turn** | One agent response cycle. At most one follow-up may be queued while a turn is in flight. Mode/model/target changes apply on the **next** turn. | 🟢 |
| **Pending Write** | An agent's buffered `writeTextFile` request awaiting user **Accept/Reject**; blocks agent execution until settled. | 🟢 |
| **Capabilities** | The negotiated set of modes/models/thinking-levels/agent-roles for a session. Resolved as **agent-reported wins over static catalog**. | 🟢 |
| **Spec** | A unit of Spec-Driven Development. SpecKit specs live in numbered `specs/NNN-slug/`; OpenSpec specs in `openspec/`. Surfaced through a unified `UnifiedSpec` facade. | 🟢 |
| **Spec System** | The active SDD toolchain: **SpecKit** (`.specify/`) or **OpenSpec** (`openspec/`), chosen by config, auto-detection, or user prompt. | 🟢 |
| **Change Request** | A reviewer-filed request against a spec in review; carries severity, may block archival, and dispatches tasks. | 🟢 |
| **Steering** | AI-behavior-shaping documents: the project **constitution** (SpecKit) / **AGENTS.md** (OpenSpec), global Copilot instructions, and `*.instructions.md` rules. | 🟢 |
| **Hook** | An automation rule: *trigger/events* + optional *conditions/schedule* + *action*. Fires before/after an SDD agent operation. | 🟢 |
| **Trigger / Operation / Timing** | A hook fires when a given **operation** (one of ~15 SDD ops) on a given **agent type** (`speckit`/`openspec`/`orchestration`) completes, at a given **timing** (`before`/`after`). | 🟢 |
| **Action** | What a hook does: `agent`, `git`, `github`, `mcp`, `custom`, or `acp`. | 🟢 |
| **MCP** | Model Context Protocol. Discovered via VS Code's Language Model API (`vscode.lm.tools`); hooks can invoke MCP tools. | 🟢 |
| **Task (normalized)** | A `NormalizedTask` parsed from `tasks.md` (either SDD system) into a common shape consumed by the Kanban board and the autonomous loop. | 🟢 |
| **Snapshot / Bucket** | The orchestration read-model projects every session into one `OrchestrationSnapshot`, bucketed `active`/`waiting`/`completed`/`failed`. | 🟢 |
| **IDE Host** | The detected editor fork (`windsurf`, `antigravity`, `cursor`, `vscode`, …). Drives ACP eligibility and dependency requirements. | 🟢 |

---

## 4. Domain rules by subdomain

> Implicit business rules extracted from conditionals, validations, constants, and enums. Line references in `code-analysis.md` / `data-dictionary.md`.

### 4.1 Conversational Agents (`agent-chat`, `agents`, ACP)
- **R-AC-1** Terminal session states (`completed`/`failed`/`cancelled`/`ended-by-shutdown`) are **absorbing**; a new run always creates a new session, never reuses a terminal one. 🟢
- **R-AC-2** At most **one** follow-up may be queued while a turn is in flight (a second submit throws). 🟢
- **R-AC-3** **Cloud sessions are read-only** — follow-up submit and retry are rejected with a fixed reason. Terminal sessions also reject input. 🟢
- **R-AC-4** Transcript is archived when it exceeds **10,000 messages OR 2 MB**: the oldest 25% is offloaded to JSONL and dropped from memory. 🟢
- **R-AC-5** Retention cap is **100 sessions**; evicted sessions' worktrees migrate to an "orphaned" list for later cleanup. 🟢
- **R-AC-6** On extension shutdown, non-terminal ACP sessions are stamped `ended-by-shutdown` in a single atomic update. 🟢
- **R-AC-7** Capability precedence: **agent-reported capabilities win** over the static catalog. 🟢
- **R-AC-8** Mode/model/execution-target changes take effect on the **next turn** and are audited via a system message; execution target is immutable once a turn has run. 🟢
- **R-AC-9** A worktree with dirty or unpushed state can only be cleaned with `confirmedDestructive` (two-step confirmation). 🟢
- **R-AC-10** Agent definition `id` must be kebab-case `^[a-z0-9-]+$`; ≥1 command required; `/help` is auto-injected if absent; tool names must be unique. 🟢
- **R-AC-11** Exactly **one** sidebar session binding is alive at a time; rebinding disposes the prior one. The command handler — not the panel — is the single source of truth for panel↔session registration (one-panel-per-session). 🟢

### 4.2 Cloud Delegation (`cloud-agents`, `devin`)
- **R-CD-1** Devin API version is selected by **token prefix**: `cog_` → v3 (org-scoped, requires `orgId`), `apk_`/`apk_user_` → v1/v2; unknown prefix throws. 🟢
- **R-CD-2** Devin **cancellation is local-only** — the Devin API exposes no cancel endpoint; cancelling marks the local session, it does not stop the remote agent. 🟢
- **R-CD-3** `statusDetail`/`status_enum` overrides the base `status` (the base field can be stale, e.g. "suspended" while actually finished). 🟢
- **R-CD-4** Polling stops after **3 consecutive failures**; a credential-expiry callback fires (FR-020). Devin uses a default 5 s interval (min 3, max 60). 🟢
- **R-CD-5** **Grace window**: after all sessions reach terminal, polling continues for a few more cycles (Devin `GRACE_CYCLES_AFTER_TERMINAL=6`; cloud open-PR grace 5 min known / 1 h unknown) **only to catch late PR merges** — terminal sessions update PR data only, not status/tasks. 🟢
- **R-CD-6** Terminal-session normalization: tasks are derived from session status (else `SKIPPED`); an unknown PR becomes `merged` if the session completed, else `open`. 🟢
- **R-CD-7** **7-day retention**: completed sessions are cleaned up 7 days after completion. 🟢
- **R-CD-8** When a provider becomes inactive, its sessions become `isReadOnly` and are excluded from polling and from being the active session. 🟢
- **R-CD-9** A task-group dispatched to Devin forces **one PR / no per-task branches**, targeting the base branch. 🟢
- **R-CD-10** Client-side rate limiting: ≥500 ms between calls, ≤60/min (sliding window); retries use exponential backoff `base·2^(n-1)` (base 1 s, cap 30 s, +10% jitter), honoring `Retry-After`. 🟢
- **R-CD-11** Devin requires a **clean git repo** (pre-flight `validateGitState`) before starting; `commitAndPush` runs `git add -A` → commit-if-changes → `git push origin <branch>`. 🟢
- **R-CD-12** A PR state change (e.g. open→merged) detected during polling marks the corresponding `- [ ] TXXX` checkbox in `tasks.md` as done (idempotent single write). 🟢
- **R-CD-13** Cloud dispatch blocks **duplicates**: an active session for the same spec-task id prompts "Open Session / Cancel" instead of re-dispatching; dispatch retries at most twice and only on recoverable `ProviderError`. 🟢

### 4.3 Spec Lifecycle (`spec`, `steering`, `tasks`)
- **R-SP-1** Spec status FSM is strictly validated; invalid transitions are rejected. `readyToReview` is a **legacy alias** normalized to `review`. 🟢
- **R-SP-2** **Send-to-review gate**: a spec must be `current`/`reopened` with **zero** pending tasks AND zero pending checklist items. 🟢
- **R-SP-3** First entry to `review` stamps `completedAt` + `reviewEnteredAt`; entry to `archived` stamps `archivedAt`. 🟢
- **R-SP-4** A new **change request** is `open` with `archivalBlocker=true`; filing one while in review transitions the spec to `reopened`. Attaching tasks → `inProgress`; all tasks done → `addressed` and the blocker clears. 🟢
- **R-SP-5** **Archive gate**: review status + zero pending items + no blocking change requests. Unarchive moves `archived → reopened`. 🟢
- **R-SP-6** If pending tasks/checklist items appear while in review, the spec is forced out of review (`reopened` if blockers exist, else `current`) with a warning. 🟢
- **R-SP-7** **Auto-return to review**: when all change requests are addressed AND all tasks done AND zero pending items, the spec auto-returns to review (with a failure retry queue). 🟢
- **R-SP-8** Duplicate change requests are rejected by **normalized title** (lowercase/trim/collapse-spaces) among non-`addressed` requests. 🟢
- **R-SP-9** The active spec system: explicit `gatomia.specSystem` wins; else auto-detect; if **both** SpecKit and OpenSpec are present with no preference, prompt the user and persist the choice (cancel ⇒ default SpecKit, not persisted). 🟢
- **R-SP-10** SpecKit feature directory must match `^\d{3,}-(.+)$`; the next feature number is `max(existing)+1`. Files not in the known-file set surface as `extra:`/`extra-folder:` entries. 🟢
- **R-SP-11** Instruction-rule names must normalize to lowercase **kebab-case** (else rejected); the system refuses to overwrite existing rule files. 🟢
- **R-SP-12** OpenSpec submission requires `.github/prompts/openspec-proposal.prompt.md` and the prompt instructs the agent to **STOP for user approval**. 🟢
- **R-SP-13** Provider selection for tasks is path-based: `openspec/` ⇒ OpenSpec provider; `.specify`/`specs/` (not openspec) ⇒ SpecKit provider. Task ids are spec-scoped: `${specId}-${task.id}`. 🟢

### 4.4 Automation (`hooks`)
- **R-HK-1** A hook fires only when `agent` + `operation` + **same `timing`** match; matched hooks run in deterministic `createdAt` order. 🟢
- **R-HK-2** **Blocking** execution happens only when `timing="before"` AND `waitForCompletion` is set. 🟢
- **R-HK-3** Chain safety: each execution carries an `executionId`, an `executedHooks` set (**circular-dependency block**), and a `chainDepth` capped at **`MAX_CHAIN_DEPTH=10`**. 🟢
- **R-HK-4** Action timeout defaults to **30 s**; execution logs are capped at **100** (FIFO); trigger history capped at **50**. 🟢
- **R-HK-5** `$variableName` substitution: a missing/undefined variable resolves to the **empty string** (graceful); an invalid name or `$`+space is a syntax error. Variables are gated per trigger via `availableFor` (`[]` = all). 🟢
- **R-HK-6** MCP discovery cache TTL is 5 min; execution concurrency is capped at **5**; per-call timeout is clamped to 1 s–5 min. 🟢
- **R-HK-7** "Completion" is detected via **filesystem watchers** (e.g. `**/specs/*/spec.md`) with a parse-validate step and 2 s debounce — not merely by command dispatch. 🟢
- **R-HK-8** Hook `id` must be UUID v4; `name` unique and ≤100 chars; immutable fields (`id`/`createdAt`/`executionCount`) cannot be updated. On load, stored hooks are migrated in place (default `timing="after"`, legacy `trigger` → normalized `events[]`). 🟢
- **R-HK-9** ACP local hosts only: ACP routing is eligible **only** on Windsurf/Antigravity and **non-remote** workspaces (`env.remoteName` falsy). 🟡 (also a routing rule for chat)

### 4.5 Orchestration / MAESTRO (`orchestration`, `tasks`)
- **R-OR-1** The dashboard merges agent-chat (active + recent; registry wins over store by id) and cloud sessions, sorted by **bucket rank** (active 0 → waiting 1 → completed 2 → failed 3) then `lastVisibleActivityAt` desc. 🟢
- **R-OR-2** Missing wiring (cloud storage/provider) yields human-readable `degradedReasons` instead of throwing — **graceful degradation** is a first-class behavior. 🟢
- **R-OR-3** `claimTask` rejects tasks already running/completed and rejects a second concurrent task unless `execution.parallelizable`. `startTask` only proceeds from `queued`. 🟢
- **R-OR-4** On a task reaching a terminal state, the loop fires an `orchestration.task-completed`/`task-failed` hook trigger with the task JSON as `outputContent`. 🟢

### 4.6 Cross-cutting / platform (`utils`, `services`, `providers`)
- **R-X-1** Webview HTML uses a per-render 32-char nonce + strict CSP; the active "page" is chosen at runtime from `#root[data-page]`. 🟢
- **R-X-2** Copilot Chat `files` parameter is only sent on **VS Code ≥ 1.95.0**. 🟢
- **R-X-3** Chat prompts are decorated with global + per-type custom instructions and a language directive when `chatLanguage ≠ "English"`. 🟢
- **R-X-4** ACP dispatch rewrites a leading `/command` into natural language ("Run the \"<cmd>\" workflow …") because ACP agents treat `/` as their own command. 🟢
- **R-X-5** One ACP subprocess per `(providerId, cwd)` for worktree isolation; `npx` spawns are gated behind a one-time consent prompt per `(providerId, cwd)`. 🟢
- **R-X-6** The webview must not import from `src/`; `ui/src/.../types.ts` is a hand-maintained **contract mirror** of the extension types (parity tests guard drift). 🟡 violated in two places (see §5). 🟢 for the rule itself.

---

## 5. Open questions & gaps (🔴 for the Reviewer)

These are decisions or behaviors that cannot be determined from code alone and should be validated with a maintainer.

1. **🔴 Devin ownership overlap.** Both the standalone `devin` integration and the provider-agnostic `cloud-agents` layer implement Devin session lifecycle + polling and are both wired in `extension.ts`. Which path "owns" polling for a given session (and whether they can run simultaneously for the same session) is undetermined.
2. **🔴 Autonomous loop maturity.** `AutonomousAgentLoopService` constructs a **non-canonical** `AgentChatSession` shape and detects completion by checking `lifecycleState !== "error"` — but `"error"` is **not** a valid `SessionLifecycleState`. Completion detection here is heuristic/provisional ("assuming … means done for now").
3. **🔴 Change-request → tasks pipeline is a mock.** `dispatchToTasksPrompt` simulates latency, fails 10% at random, and returns two hard-coded tasks. The real task generator is not wired.
4. **🔴 Stubbed validations.** `TemplateVariableParser.validateVariables` always returns valid (TODO Phase 4); `ConstitutionManager.validateConstitution` always returns true. Neither enforces anything yet.
5. **🔴 Unmounted prototypes.** The Kanban board has no importer; the `devin-progress` / `cloud-agent-progress` pages are requested by their panels but are **absent from `page-registry.tsx`** ("Unknown page"). These appear to be a "prototype graveyard" from the MAESTRO build-out.
6. **🔴 Webview contract drift.** `webview-spec-explorer` imports types directly from `src/` (violating the no-`src/` rule) and acquires its own `acquireVsCodeApi()` instance (`window.specExplorerVscode`) instead of the shared bridge.
7. **🟡 Spec `009` gap.** The SDD feature numbering skips `009` (`008-auto-review-transition` → `010-copilot-agents`). Reason unknown — possibly an abandoned/merged feature.

> All rules above are mechanically true to the current code. Whether each represents the **intended** product behavior (vs. an accident of implementation) is what the Reviewer should confirm with the maintainer.
