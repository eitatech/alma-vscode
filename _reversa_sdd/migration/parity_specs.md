---
schemaVersion: 1
generatedAt: 2026-06-07T20:42:00Z
reversa:
  version: "1.2.34"
kind: parity_specs
producedBy: inspector
hash: "sha256:db16014d90580eb66f217165d5ef96782105dabef3db935593e96b344ec78bb7"
---

# Parity Specs

> Behavioral-equivalence validation strategy between the legacy VS Code extension and the new IntelliJ plugin, adapted to `paradigm_decision.md` (Option 1, transformational) and `migration_strategy.md` (A + C: incremental + Parallel-Run).
> **Core principle (AMB-001): parity is BEHAVIORAL, not structural.** The implementation model changes fundamentally (React->Compose, bridge dropped, Promises->coroutines), so parity asserts observable behavior (FSM transitions, gates, hook firing, content, states) and **never** widget trees, file structure, or implementation shape.

## Estratégia geral
- **Validation modes**:
  - [ ] Shadow mode (live traffic mirroring) — **not applicable** (client-side IDE plugin; no server traffic).
  - [x] **Characterization tests** — suite derived from the legacy's current behavior (the MIGRATE `R-*` rules in `target_business_rules.md`).
  - [x] **Contract tests** — external interfaces (Devin REST, GitHub Copilot, MCP via the own client, ACP stdio) + **screen contract tests** (modernized mode, §2b).
  - [ ] Data parity (snapshots/checksums) — **not applicable** (no database; state is local per-project).
  - [x] **Outro: Parallel-Run against the VS Code oracle** (Strategy C) — offline behavioral comparison: run the same SDD operation in the legacy extension and the new plugin and compare observable outcomes per slice.

## Critérios de "paridade aceita"
- **Primary metric**: **zero functional divergence** on the characterization suite for the MIGRATE rules within a context slice's scope (this is internal developer tooling — "система interno baixa criticidade" in the matrix, but functional parity is the stated success metric, so the bar is zero divergence on covered rules, not <5%).
- **Observation window**: per-slice **EAP/beta soak** (see `cutover_plan.md`) before promoting that slice to the stable channel.
- **Blocking criterion**: a context slice **cannot be released** to the Marketplace stable channel until its characterization + contract + screen-contract suites are green for its scope. There is no global cutover gate (incremental strategy); each slice gates itself.

## Cobertura adaptada ao paradigma

> Paradigm transition: legacy **OO-with-DI + event-driven** -> target **OO-with-DI + message bus** (idiomatic IntelliJ). The host transition is largely *no paradigm change* (OO-with-DI both sides), so most flows use standard functional equivalence. The **internally event-driven** parts (hooks, cloud polling, orchestration loop) add `@idempotencia` + `@ordem`.

### Standard functional equivalence (most flows)
- Same input -> same observable outcome -> same observable side effect (file writes, FSM state, persisted state). Applied to spec lifecycle, change requests, chat sessions, agent definitions.

### Internally event-driven flows (hooks / cloud / orchestration)
- **Order** (`@ordem`): hooks fire in deterministic `createdAt` order (R-HK-1); orchestration events reflect source order.
- **Idempotency** (`@idempotencia`): PR-state -> `tasks.md` checkbox is a single idempotent write (R-CD-12); hook chains block re-entry via the `executedHooks` set + chainDepth cap 10 (R-HK-3).
- **Async completion**: FS-watcher completion detection with 2s debounce (R-HK-7) -> `BulkFileListener`; polling stop after 3 failures (R-CD-4) -> coroutine loop.

### Screen contract tests (modernized mode, §2b)
- For each of the 14 screens in `target_screens.md`: assert **component hierarchy, declared events, textual content (verbatim), and the 4 states (idle/loading/error/success)**. **No byte/pixel comparison** (mode = modernized; `screen_modernization_decision.md`). Tag `@paridade-visual` / `@contrato-tela`. See `parity_tests/screens/`.

## Tipos de teste a aplicar
- **Functional / characterization**: Kotlin unit tests over the pure `domain` layer (hexagonal seam makes this headless and fast) — assert FSM transitions, gates, retention caps.
- **Contract**: provider adapters (Devin/Copilot) against recorded fixtures; ACP stdio JSON-RPC contract; MCP client contract; screen contracts from `target_screens.md`.
- **Load / performance**: out of scope for v1 (developer tooling; no throughput target).
- **Resilience**: graceful degradation (`degradedReasons`, R-OR-2); polling failure caps + backoff (R-CD-4/10); cancellation via coroutine/ProgressIndicator.

## Exceções (propagated approved deviations)
> From `screen_deviation_log.md` (all 6 approved by Italo, 2026-06-07).
- **DEV-001** — pair `vscode-extension-ui -> compose` (composable specs): parity is behavioral, not byte/pixel. (all screens)
- **DEV-002** — Jewel/IntelliJ theme + derived semantic tokens: colors not parity-checked; semantic meaning is. (all screens)
- **DEV-003** — VS Code TreeView -> Jewel LazyTree: parity on node content/structure/actions, not VS Code rendering. (9 tree views)
- **DEV-004** — React Flow composer + Kanban -> native Compose: behavioral parity on lanes/cards/graph semantics; interaction differences accepted. (Orchestration)
- **DEV-005** — multi-tab webview -> Jewel TabRow: parity on tab set + per-tab content. (Welcome)
- **DEV-006** — markdown/mermaid renderer change: parity on rendered structure/content, not byte/pixel HTML. (Document Preview)

## Reuso de characterization_specs do time de descoberta
- **Origin**: `_reversa_sdd/characterization_specs/` is **absent** (gap). Critical flows were therefore inferred from `_reversa_sdd/flowcharts/*.md`, `code-analysis.md`, and the critical MIGRATE rules (`R-AC-*`, `R-SP-*`, `R-CD-*`, `R-HK-*`, `R-OR-*`).
- **Gap note**: no pre-existing characterization suite to adapt; the `.feature` files below are derived fresh and traced to the flowcharts.

## Saídas
- `parity_tests/*.feature` — 8 critical-flow scenarios (Gherkin, behavioral).
- `parity_tests/screens/*.feature` — screen-contract scenarios for the modernized UI (representative; the pattern applies to all 14 screens in `target_screens.md`).

## Notas
- Parallel-Run oracle fidelity risk (RISK-009): some behavior is UI-internal; where the legacy can't be observed, parity is asserted from the specs.
- The `.feature` files are **specs, not executable tests** — the coding agent maps them to a Kotlin test framework (e.g., JUnit5 + a Gherkin runner or plain behavioral tests over the domain layer).
