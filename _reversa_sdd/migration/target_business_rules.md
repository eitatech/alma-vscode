---
schemaVersion: 1
generatedAt: 2026-06-07T20:14:03Z
reversa:
  version: "1.2.34"
kind: target_business_rules
producedBy: curator
hash: "sha256:db830edaa40f84ed9c0cb59ccdb117b2f57fd356184de6729924da7e9d14164f"
---

# Target Business Rules

> Catalog of the legacy business rules with a migration decision: MIGRATE, DISCARD, or HUMAN DECISION.
> Each item traces back to its origin in `_reversa_sdd/` and respects `paradigm_decision.md` (Option 1: idiomatic IntelliJ, transformational; the `postMessage` bridge is dropped, FSMs become Kotlin sealed classes, async becomes coroutines, UI becomes Compose/Jewel).
> Rule IDs (R-AC-*, R-CD-*, R-SP-*, R-HK-*, R-OR-*, R-X-*) are the Detective's IDs from `domain.md` §4.

## Summary
- Total rules analyzed: **56** behavioral rules (+ 2 residual gaps G-A/G-B, + 9 decided-defect items D-1..D-9 folded in as notes/discards).
- MIGRATE: **53** rules (grouped by bounded context for readability; every R-* id is enumerated).
- DISCARD: **3** rules (R-X-1, R-X-6, R-HK-9) + 2 decided items (legacy `devin` module; webview wiring defect-class). Detail in `discard_log.md`.
- HUMAN DECISION: **4** items.

## MIGRATE rules

### BR-MIGRAR-001 — Conversational Agents: session lifecycle
- **Covers**: R-AC-1, R-AC-2, R-AC-3, R-AC-4, R-AC-5, R-AC-6, R-AC-7, R-AC-8, R-AC-9
- **Origin**: `domain.md` §4.1; `state-machines.md` (session FSM); ADR-0010.
- **Original confidence**: 🟢
- **Description**: Absorbing terminal session states + new-run-creates-new-session (R-AC-1); single queued follow-up (R-AC-2); cloud sessions read-only (R-AC-3); transcript archival at 10k msgs / 2 MB offloading oldest 25% (R-AC-4); 100-session retention with orphaned-worktree migration (R-AC-5); shutdown stamps `ended-by-shutdown` atomically (R-AC-6); agent-reported capabilities win over static catalog (R-AC-7); mode/model/target changes apply next turn, target immutable after first turn (R-AC-8); dirty/unpushed worktree cleanup requires two-step `confirmedDestructive` (R-AC-9).
- **Migration justification**: Pure domain behavior; defines the product's session semantics. Platform-agnostic.
- **Target-paradigm compatibility**: FSMs → Kotlin **sealed classes** (absorbing terminal sets are a natural fit); transcript/session persistence → project-scoped files + `PersistentStateComponent`; the two-step destructive confirmation → IntelliJ `Messages.showYesNoDialog`; worktree ops → Git4Idea or shell.

### BR-MIGRAR-002 — Conversational Agents: agent definitions & session binding
- **Covers**: R-AC-10, R-AC-11
- **Origin**: `domain.md` §4.1, §3 (Agent definition); `permissions.md`.
- **Original confidence**: 🟢
- **Description**: `.agent.md` definition validation — kebab-case `id` `^[a-z0-9-]+$`, ≥1 command, `/help` auto-injected, unique tool names (R-AC-10); exactly one live sidebar session binding, rebinding disposes the prior, one-panel-per-session (R-AC-11).
- **Migration justification**: The agent-definition contract and the single-active-binding invariant are product behavior.
- **Target-paradigm compatibility**: `.agent.md` parsing/validation migrates as-is (file-based). **The registration target changes** — legacy registers agents as *GitHub Copilot chat participants* (a VS Code API); the JetBrains chat host is a product decision (see **BR-HUMANA-003**). The "command handler is the single source of truth for panel↔session" detail is a VS Code-webview implementation artifact; natively it becomes tool-window content management (Designer re-expresses it).

### BR-MIGRAR-003 — Cloud Delegation (Devin / Copilot)
- **Covers**: R-CD-1, R-CD-2, R-CD-3, R-CD-4, R-CD-5, R-CD-6, R-CD-7, R-CD-8, R-CD-9, R-CD-10, R-CD-11, R-CD-12, R-CD-13
- **Origin**: `domain.md` §4.2; `code-analysis.md` (cloud-agents); ADR-0007.
- **Original confidence**: 🟢
- **Description**: Devin API version by token prefix (R-CD-1); local-only cancellation (R-CD-2); `statusDetail` overrides base status (R-CD-3); polling stops after 3 failures + credential-expiry callback (R-CD-4); grace window for late PR merges (R-CD-5); terminal-session normalization (R-CD-6); 7-day retention (R-CD-7); inactive-provider sessions become read-only and leave polling (R-CD-8); task-group forces one PR / no per-task branches (R-CD-9); client rate limiting + exponential backoff (R-CD-10); clean-git pre-flight + commit-and-push flow (R-CD-11); PR-state change marks `tasks.md` checkbox idempotently (R-CD-12); duplicate-dispatch block + bounded retries (R-CD-13).
- **Migration justification**: External-API contracts and delegation policy are core behavior independent of the host IDE.
- **Target-paradigm compatibility**: Polling loop → Kotlin **coroutine** + `delay`/scheduled task; cancellation → coroutine cancellation locally (still no remote cancel, R-CD-2); git ops → Git4Idea / shell; rate-limit/backoff state migrates verbatim. **R-CD-5 caveat:** the canonical grace policy is `cloud-agents`' time-based grace (5 min known-PR / 1 h unknown); the `devin`-standalone `GRACE_CYCLES_AFTER_TERMINAL=6` retires with the `devin` module (see `discard_log.md` BR-DESCARTAR-004, gaps `D-1`).

### BR-MIGRAR-004 — Spec Lifecycle (specs, steering, tasks)
- **Covers**: R-SP-1, R-SP-2, R-SP-3, R-SP-4, R-SP-5, R-SP-6, R-SP-7, R-SP-8, R-SP-9, R-SP-10, R-SP-11, R-SP-12, R-SP-13
- **Origin**: `domain.md` §4.3; `state-machines.md` (spec + change-request FSMs); ADR-0004.
- **Original confidence**: 🟢
- **Description**: Spec status FSM with `readyToReview`→`review` alias (R-SP-1); send-to-review gate (R-SP-2); review/archive timestamp stamping (R-SP-3); change-request lifecycle + archival blocker (R-SP-4); archive gate + unarchive→reopened (R-SP-5); forced-out-of-review on pending items (R-SP-6); auto-return-to-review (R-SP-7); duplicate-CR rejection by normalized title (R-SP-8); spec-system selection precedence (R-SP-9); SpecKit dir pattern + next-number (R-SP-10); kebab-case instruction-rule names, no overwrite (R-SP-11); OpenSpec submission gate with STOP-for-approval (R-SP-12); path-based provider selection + spec-scoped task ids (R-SP-13).
- **Migration justification**: This is the heart of the SDD product. All rules are file-based (SpecKit `.specify/` / OpenSpec `openspec/`) and host-agnostic.
- **Target-paradigm compatibility**: FSMs → sealed classes; file/FS access → IntelliJ VFS; the "prompt the user" branches (R-SP-9) → IntelliJ dialogs. **CR→tasks (R-SP-4 dispatch) uses the real `/speckit.tasks` generator** (decided fix `D-4`), not the legacy mock.

### BR-MIGRAR-005 — Automation / hooks engine
- **Covers**: R-HK-1, R-HK-2, R-HK-3, R-HK-4, R-HK-5, R-HK-6, R-HK-7, R-HK-8
- **Origin**: `domain.md` §4.4; ADR-0011.
- **Original confidence**: 🟢
- **Description**: Fire on agent+operation+timing match in `createdAt` order (R-HK-1); blocking only when before+waitForCompletion (R-HK-2); chain safety — executionId, executedHooks set (circular block), chainDepth cap 10 (R-HK-3); action timeout 30 s + log/history caps (R-HK-4); `$variable` substitution, missing→empty, per-trigger `availableFor` gating (R-HK-5); MCP discovery cache TTL 5 min + concurrency cap 5 + per-call timeout clamp (R-HK-6); FS-watcher completion detection with parse-validate + 2 s debounce (R-HK-7); hook schema validation + immutable fields (R-HK-8).
- **Migration justification**: The hooks engine is a first-class product feature; its safety rails and firing semantics are behavior.
- **Target-paradigm compatibility**: FS watchers (R-HK-7) → IntelliJ **`BulkFileListener`** on the message bus; **strict `validateVariables` is enforced** (decided fix `D-5`, replacing the inert stub); the MCP discovery **policy** (R-HK-6: TTL/concurrency/timeout) migrates, but the discovery **source** `vscode.lm.tools` does not exist on JetBrains — the platform MCP-discovery surface is a **HUMAN DECISION** (see **BR-HUMANA-002**, which also subsumes gap G-B). R-HK-8's in-place migration of *stored* hooks (legacy `trigger`→`events[]`) is only relevant if VS Code configs are imported (see **BR-HUMANA-004**).

### BR-MIGRAR-006 — Orchestration / MAESTRO
- **Covers**: R-OR-1, R-OR-2, R-OR-3, R-OR-4
- **Origin**: `domain.md` §4.5; `architecture.md` §4 (Orchestration context).
- **Original confidence**: 🟢 (rules) over a 🟡 prototype surface.
- **Description**: Dashboard merge of agent-chat + cloud sessions, bucket-rank sort (R-OR-1); missing wiring → `degradedReasons`, graceful degradation (R-OR-2); `claimTask`/`startTask` concurrency rules + `parallelizable` gate (R-OR-3); terminal task fires `orchestration.task-completed/failed` hook with task JSON (R-OR-4).
- **Migration justification**: MAESTRO is in scope (confidence-report Q6 "ship & wire"); these rules define its read-model and autonomous loop.
- **Target-paradigm compatibility**: The autonomous loop builds sessions via the canonical session store and uses the **terminal-state set** for completion (decided fixes `D-2`/`D-3`), not the invalid `"error"` state. Dashboard UI → native Compose (the React Flow composer + Kanban rebuild is the top effort item — `ambiguity_log.md` AMB-002). Graceful degradation (R-OR-2) is a pattern worth preserving idiomatically.

### BR-MIGRAR-007 — Cross-cutting behavioral rules
- **Covers**: R-X-2, R-X-3, R-X-4, R-X-5
- **Origin**: `domain.md` §4.6; `permissions.md`.
- **Original confidence**: 🟢
- **Description**: Attach Copilot Chat `files` only when the host supports it (R-X-2, legacy gate = VS Code ≥1.95.0); decorate chat prompts with global + per-type instructions and a language directive when `chatLanguage ≠ English` (R-X-3); ACP dispatch rewrites a leading `/command` into natural language (R-X-4); one ACP subprocess per `(providerId, cwd)` for worktree isolation + one-time `npx`-spawn consent (R-X-5).
- **Migration justification**: These are behavioral/security rules, not bridge mechanics. ACP (CLI subprocess over JSON-RPC stdio) is host-agnostic.
- **Target-paradigm compatibility**: R-X-2's version gate → **JetBrains Copilot capability detection** (intent preserved, the specific `1.95.0` check is platform-specific); prompt decoration + ACP `/command` rewrite migrate verbatim; the `npx`-consent UI → IntelliJ dialog. (The legacy `R-HK-9` ACP-eligibility gate is platform-specific and is **discarded** — see `discard_log.md`.)

## DISCARD rules (summary)

| ID | Origin | Short reason | Paradigm-linked? |
|---|---|---|---|
| BR-DESCARTAR-001 | R-X-1 (`domain.md` §4.6) | Webview HTML nonce + strict CSP + `#root[data-page]` page selection — no webview under native Compose | **yes** |
| BR-DESCARTAR-002 | R-X-6 (`domain.md` §4.6) | Webview-no-`src/` rule + hand-mirrored `types.ts` + parity tests — the bridge is dropped, types are shared in-process | **yes** |
| BR-DESCARTAR-003 | R-HK-9 (`domain.md` §4.4) | ACP eligibility restricted to Windsurf/Antigravity VS Code forks — meaningless on JetBrains | **yes** (platform) |
| BR-DESCARTAR-004 | `devin` module (gaps `D-1`, `domain.md` §4.2, confidence-report Q1) | Legacy standalone Devin path; redundant with canonical `cloud-agents` | no (decided redundancy) |
| BR-DESCARTAR-005 | Webview wiring defect-class (gaps `D-6`,`D-7`,`D-8`,`D-9`) | `page-registry`/Kanban-importer/`acquireVsCodeApi`-bypass/dead-duplicate-components — all artifacts of the two-bundle webview that disappears | **yes** |

> Full detail, replacements, and risk per item in `discard_log.md`.

## HUMAN DECISION rules

### BR-HUMANA-001 — Constitution-validation rules (steering)
- **Origin**: `gaps.md` G-A; `domain.md` §4.3 (steering); confidence-report Q5.
- **Ambiguity type**: 🔴 GAP (decided to implement, concrete rules undefined).
- **Description**: `validateConstitution` is an inert stub in the legacy; the decision is to implement real validation, but the concrete rules (required sections? non-empty principles? schema checks?) are unspecified.
- **Options**: (a) carry the validation hook point and leave rules as a forward-cycle `/reversa-requirements` item; (b) define a minimal rule set now (e.g., required sections + non-empty principles); (c) skip validation in v1.
- **Curator recommendation**: **(a)** — migrate the extension point with a no-op-but-wired validator and define rules in a dedicated forward cycle; do not block the migration on an undefined contract.
- **Status**: RESOLVED — chose **(a)** wire-it-rules-later. Decider: Italo. When: 2026-06-07T20:26:10Z. The validator extension point migrates wired-but-permissive; concrete constitution rules are a forward `/reversa-requirements` item (REFERRED TO CODING).

### BR-HUMANA-002 — MCP discovery surface on JetBrains
- **Origin**: `gaps.md` G-B; `domain.md` §4.4 (R-HK-6); confidence-report Q9.
- **Ambiguity type**: 🔴 GAP + platform replacement.
- **Description**: Legacy discovers MCP tools via VS Code's `vscode.lm.tools` and correlates tool→server with a heuristic (G-B wanted a reliable metadata signal). On JetBrains there is **no `vscode.lm` API**, so both the discovery source and the correlation question must be re-answered for the new host.
- **Options**: (a) discover MCP via the GitHub Copilot JetBrains plugin's exposed surface (if any); (b) embed a direct MCP client in the plugin and manage server config ourselves; (c) defer MCP-action hooks to a later phase, shipping non-MCP hook actions first.
- **Curator recommendation**: **defer the source choice to the Designer** (it is an architecture/topology decision); recommend **(b)** as the most host-independent and the one that resolves G-B by owning the server-of-origin metadata directly.
- **Status**: RESOLVED — chose **(b)** embed our own MCP client (owns server-of-origin metadata, resolves G-B). Decider: Italo. When: 2026-06-07T20:26:10Z. The Designer must place this client in the target architecture; implementation is REFERRED TO CODING.

### BR-HUMANA-003 — JetBrains chat host for agent definitions
- **Origin**: `domain.md` §3 ("Agent definition" = GitHub Copilot chat participant), §4.1 (R-AC-10/11); `migration_brief.md` (technical constraint: Copilot Chat equivalent on JetBrains).
- **Ambiguity type**: dependency on platform/product decision.
- **Description**: Legacy agents are registered as **GitHub Copilot chat participants** via the VS Code Copilot Chat API. JetBrains has no identical concept; the chat host must be chosen and it materially shapes `agent-chat`, `agents`, and prompt decoration (R-X-3).
- **Options**: (a) integrate with the **GitHub Copilot for JetBrains** plugin's chat extension surface (if it exposes participants/tools); (b) integrate with **JetBrains AI Assistant**; (c) ship gatomia's **own chat tool window** that drives ACP/cloud providers directly and treats `.agent.md` as internal config (no third-party chat host).
- **Curator recommendation**: **(c)** for v1 — owning the chat tool window maximizes parity control and avoids coupling to a third-party plugin's unstable extension surface; reconsider (a) if first-party Copilot participation becomes important for reach.
- **Status**: RESOLVED — user chose **(b) JetBrains AI Assistant** (override of the Curator's (c)). Decider: Italo. When: 2026-06-07T20:26:10Z.
  - **Implication (input for Designer + Strategist)**: `agent-chat` and `agents` integrate with the **JetBrains AI Assistant** chat surface. The Designer must map `.agent.md` definitions, named commands, and prompt decoration (R-X-3) onto AI Assistant's extension surface, and confirm whether AI Assistant exposes a stable API for routing to gatomia's ACP/cloud providers. If that API is limited/closed, this becomes a platform-coupling risk — flag in the Strategist's `risk_register.md`.

### BR-HUMANA-004 — Import of existing VS Code configuration/state
- **Origin**: `domain.md` §4.4 (R-HK-8 in-place migration), §4.1 (retention stores); `architecture.md` §1 (`workspaceState`/JSON/`SecretStorage`).
- **Ambiguity type**: product scope decision.
- **Description**: The legacy migrates its own stored hooks (`trigger`→`events[]`) and persists sessions/specs in `.vscode/gatomia/`. Should the JetBrains plugin **import** an existing VS Code gatomia workspace's `hooks.json` / state for users who used both?
- **Options**: (a) no import in v1 (greenfield for the new JetBrains audience — consistent with "expand reach"); (b) one-way importer from `.vscode/gatomia/`; (c) shared on-disk format both IDEs read.
- **Curator recommendation**: **(a)** for v1 — the objective is reaching *new* JetBrains users; cross-IDE continuity is a later enhancement. This also means R-HK-8's legacy in-place migration is **not** needed initially (schema validation still migrates).
- **Status**: RESOLVED — chose **(a)** no import in v1. Decider: Italo. When: 2026-06-07T20:26:10Z. R-HK-8's legacy in-place hook migration is out of scope for v1 (schema validation still migrates).

## Notes
- The 53 MIGRATE rules are behavioral and survive the paradigm change; only their *expression* shifts (FSM→sealed class, callback→coroutine, dialog host, persistence API). None were discarded merely for "being done differently" (per Curator policy).
- The DISCARD set is dominated by **webview/bridge mechanics** that the transformational decision deliberately removes — this is the Curator honoring `paradigm_decision.md` implications I1/I3.
- All four HUMAN DECISION items were resolved at the post-Curator review gate (2026-06-07T20:26:10Z): BR-HUMANA-001 (a), BR-HUMANA-002 (b), BR-HUMANA-003 **(b) — user override to JetBrains AI Assistant**, BR-HUMANA-004 (a). Mirrored in `ambiguity_log.md`.
