---
schemaVersion: 1
generatedAt: 2026-06-07T20:46:00Z
reversa:
  version: "1.2.34"
kind: handoff
producedBy: orchestrator
hash: "sha256:48dd4146bd054e3d197fe27db98aa0563d569bf266d53eaee9a575677c79a1f5"
---

# Handoff to the Coding Agent

> **New system to be built in paradigm = idiomatic IntelliJ (OO-with-DI + message bus + coroutines, declarative Compose UI); topology = Hybrid (feature slices + hexagonal seam in a single Gradle module); screens in mode = modernized (React -> Compose/Jewel). Before a single line of code, read `paradigm_decision.md`, `topology_decision.md`, and `screen_modernization_decision.md`.**
>
> Goal: port `gatomia` (a VS Code extension) to the **JetBrains/IntelliJ Platform** in Kotlin to expand reach. This is a **greenfield rewrite from the specs**, not a TS->Kotlin transpilation. There is **no database** and **no runtime data migration**.

## ⚠️ Required reading first
1. **`paradigm_decision.md`** — non-negotiable. Target paradigm shapes every coding choice (no bridge; FSMs as sealed classes; coroutines; Compose UI).
2. **`topology_decision.md`** — non-negotiable. Hybrid topology defines the folder tree and module boundaries (single Gradle module, package-by-feature + hexagonal `domain/app/ui/infra` per context).
3. **`screen_modernization_decision.md`** — non-negotiable (the legacy HAS UI). Mode = **modernized**: honor each screen's component hierarchy, events, **verbatim text**, and the 4 states; **no byte/pixel cloning**.

## Recommended reading order
1. `paradigm_decision.md` (required, first)
2. `topology_decision.md` (required, second)
3. `screen_modernization_decision.md` (required, third — UI present)
4. `migration_brief.md`
5. `target_business_rules.md`
6. `migration_strategy.md`
7. `target_architecture.md`
8. `target_domain_model.md`
9. `target_data_model.md`
10. `data_migration_plan.md`
11. `target_screens.md`
12. `parity_specs.md` + `parity_tests/`
13. `screen_deviation_log.md` (advisory; 6 approved deviations)
14. `risk_register.md` + `cutover_plan.md`
15. `discard_log.md` (advisory)
16. `ambiguity_log.md` (advisory)

## Artifacts produced

| Artifact | Produced by | Status |
|---|---|---|
| migration_brief.md | orchestrator | created |
| paradigm_decision.md | paradigm_advisor | created |
| target_business_rules.md | curator | created (53 MIGRATE, 3+2 DISCARD, 4 HUMAN-DECISION resolved) |
| discard_log.md | curator | created |
| migration_strategy.md | strategist | created (chosen: A + C) |
| risk_register.md | strategist | created (4 High, 6 Medium) |
| cutover_plan.md | strategist | created (Marketplace-release model) |
| topology_decision.md | designer (Phase 1) | created (Option 3: Hybrid) |
| target_architecture.md | designer | created (6 bounded contexts) |
| target_domain_model.md | designer | created (8 aggregates, 7 events) |
| target_data_model.md | designer | created (no DB; state-shape model) |
| data_migration_plan.md | designer | created (no runtime ETL) |
| screen_modernization_decision.md | screen_translator (Phase 1) | created (mode: modernized) |
| target_screens.md | screen_translator | created (14 composable screen specs) |
| screen_deviation_log.md | screen_translator | created (6 deviations, all approved) |
| _reversa_sdd/screens/inventory.json | screen_translator | created (14 screens) |
| _reversa_sdd/screens/golden/manifest.yaml | screen_translator | created (behavioral parity; no byte golden) |
| _reversa_sdd/design-system/tokens-derived.md | screen_translator | created (EC-17; Jewel semantic tokens) |
| parity_specs.md | inspector | created |
| parity_tests/*.feature | inspector | 9 files (8 critical flows + 1 screen-contract) |
| ambiguity_log.md | orchestrator | consolidated (0 pending, 5 resolved, 1 referred) |

## Blockers to start implementation
- **None.** All 4 human decisions are resolved (AMB-003..006) and all 6 screen deviations are approved. The pipeline is unblocked; the coding agent may proceed.

## Items referred to coding (from `ambiguity_log.md`)
> Carry these forward explicitly; they are not blockers but must be sized/handled during implementation.
- **AMB-002 — Native rebuild of the heavy UI** (React Flow workflow composer + Kanban + mermaid/markdown preview) in Compose/Jewel, **with no JCEF fallback**. This is the single largest effort item and the program's top risk (RISK-001). Spike it in **Phase 0**; if prohibitive, the only paradigm-preserving fallback is to re-open `paradigm_decision.md` toward Option 3 (Hybrid/JCEF) for those specific screens.
- **AMB-003 (follow-up)** — Define concrete **constitution-validation rules** in a forward `/reversa-requirements` cycle; ship the validator wired-but-permissive in the interim.
- **AMB-004 (follow-up)** — Implement the **embedded MCP client** (owns server-of-origin metadata; resolves gap G-B) at the place the Designer fixed it (`platform` foundation).

## Watch items (resolved decisions with downstream risk)
- **AMB-005 / RISK-003** — Chat host = **JetBrains AI Assistant** (user override). Validate its plugin SDK exposes a stable participant/tool API for routing to gatomia's ACP/cloud providers **before** committing the Conversational Agents slice (Phase 3). Contingency: gatomia's own chat tool window.
- **RISK-005 / BR-DESCARTAR-003** — Define a **JetBrains ACP-eligibility predicate** (the legacy Windsurf/Antigravity gate is discarded); test on IntelliJ IDEA + a Gateway/remote scenario.

## Next steps for the coding agent
1. **Internalize `paradigm_decision.md`**: idiomatic IntelliJ. No `postMessage` bridge; FSMs (22) as Kotlin **sealed classes**; async via **coroutines** + `Task.Backgroundable`; events via the IntelliJ **message bus** + `BulkFileListener`; UI in **Compose/Jewel**; persistence via `PersistentStateComponent`/`PasswordSafe` (no DB).
2. **Internalize `topology_decision.md`** (Hybrid): create a **single Gradle IntelliJ plugin** module using `intellij-platform-gradle-plugin`; package by feature under `dev.gatomia` with `platform/` + 5 context packages (`spec`, `automation`, `agents`, `cloud`, `orchestration`), each split `domain/ app/ ui/ infra/`. Keep `domain` pure (no IntelliJ imports) for headless parity tests.
3. **Internalize `screen_modernization_decision.md`** (modernized): build screens from `target_screens.md` as Compose/Jewel; **preserve all text verbatim**; implement the 4 states per screen; reference Jewel theme + `design-system/tokens-derived.md`; honor the 6 approved deviations (`parity_specs.md § Exceções`).
4. **Set up the repo**: Kotlin + IntelliJ Platform SDK, `plugin.xml` skeleton (tool windows, actions, extension points), settings, telemetry, Git4Idea, ACP process manager, provider SPI, MCP client. **Phase 0** also spikes the hardest UI (graph canvas + Kanban) to clear RISK-001 before committing.
5. **Implement bottom-up, slice by slice (Strategy A)** in this order, each delivered native end-to-end with parity tests before release: **Phase 1 Spec Lifecycle -> Phase 2 Automation (hooks) -> Phase 3 Conversational Agents (AI Assistant host) -> Phase 4 Cloud Delegation -> Phase 5 Orchestration/MAESTRO** (heaviest UI, last). Within each: infra -> persistence -> domain (sealed-class FSMs) -> application (coroutines) -> UI (Compose).
6. **Honor the discards** (`discard_log.md`): do NOT re-implement the bridge/type-mirror/page-registry/`acquireVsCodeApi`, the standalone `devin` module, or the Windsurf/Antigravity ACP gate. Devin support lives in `cloud`.
7. **Write parity tests from day one**: map `parity_tests/*.feature` to Kotlin tests over the pure `domain` layer; assert **behavior, not structure** (`parity_specs.md`). Use the running VS Code extension as the **Parallel-Run oracle** (Strategy C) for each slice.
8. **Per component**, verify it honors `target_architecture.md § Honra ao paradigma escolhido` and `§ Honra à topologia escolhida`.
9. **Data**: per `data_migration_plan.md`, there is **no runtime migration** — the plugin creates fresh local state; repo SpecKit/OpenSpec files are read in place; **no VS Code import in v1** (AMB-006).
10. **Release ("cutover")**: per `cutover_plan.md`, each slice is a **JetBrains Marketplace release** (EAP/beta -> stable) gated by green parity tests for its scope. The VS Code extension is **not decommissioned**; rollback = yank the plugin version, users stay on VS Code.

## Auto-decided items
- None — the pipeline ran in **interactive mode** (no `--auto`); every decision was made by the human at its gate.

## Final notes
- Decomposition is intentionally **not 1:1**: 22 legacy modules -> 6 contexts (5 product + `platform`) via justified merges (`topology_decision.md` mapping). Do not recreate the legacy module-per-folder layout.
- Recommended minimum **v1.0 scope** if solo capacity forces a cut (RISK-006): **Spec Lifecycle + Automation**, deferring Orchestration/MAESTRO to a later release.
- The biggest risk is the native UI rebuild (AMB-002/RISK-001) — treat the Phase 0 spike as a go/no-go for staying fully native vs. re-opening the paradigm for those screens.
