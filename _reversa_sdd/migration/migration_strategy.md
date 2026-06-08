---
schemaVersion: 1
generatedAt: 2026-06-07T20:26:10Z
reversa:
  version: "1.2.34"
kind: migration_strategy
producedBy: strategist
hash: "sha256:2165a950e036c781c79ca1f4efac55239ab11120bd2a7e7abc05f9b1b1a7a5ca"
---

# Migration Strategy

> Migration strategies evaluated with explicit trade-offs. The recommended strategy is the Strategist's suggestion; the final decision is human.

## Context synthesis

- **Legacy size**: 22 modules, ~650 source files (624 `.ts(x)`), ~247 test files; **no database**; external integrations: Devin REST, GitHub Copilot (Chat + GraphQL coding agent), MCP, Git, SpecKit/OpenSpec filesystem, local ACP CLIs (`inventory.md`, `dependencies.md`).
- **Derived appetite**: **transformational** (`paradigm_decision.md`).
- **Paradigm-gap severity**: medium overall, **large in the UI layer** (full React->Compose rewrite, no JCEF; `paradigm_decision.md` I2, `ambiguity_log.md` AMB-002).
- **Brief constraints**: no hard deadline; **solo maintainer**; success = **functional parity**; target = JetBrains IntelliJ Platform (Kotlin).
- **Critical framing**: this is a **greenfield build on a different platform**, not an in-place migration. The VS Code extension is **not decommissioned** — it serves its existing audience while the JetBrains plugin **expands reach** to a new one. Consequence: there is **no production cutover, no shared runtime to route, and no runtime data to migrate**. "Cutover" here means *Marketplace release*, and "rollback" means *users stay on the VS Code extension*.

## Strategies evaluated

### Strategy A: Incremental per-bounded-context build & release (Strangler-style)
- **Description**: Build the JetBrains plugin one bounded context at a time, shipping usable slices to the JetBrains Marketplace (EAP/beta then stable), each validated for behavioral parity against the running VS Code extension before release.
- **When it applies**: large surface, incrementality desired, ability to release partial value; here the "router" is the Marketplace release channel rather than a proxy.
- **Cost**: medium. **Risk**: **low**. **Time**: long.
- **Fit to derived appetite (transformational)**: strong — the catalog prescribes "Strangler Fig with deep edges" for transformational appetite on **larger** systems (this one is medium-large).
- **Trade-offs**:
  - Pros: continuous verifiable parity (matches the success metric); avoids a giant unvalidated batch; fits solo-dev capacity and "no deadline"; early user feedback per slice; de-risks the UI rewrite by spiking it first (Phase 0).
  - Cons: longer calendar time; per-release packaging overhead; partial-feature UX during early releases; requires discipline to keep the VS Code oracle and the JetBrains build comparable.

### Strategy B: Big Bang (single v1.0 at full parity)
- **Description**: Build all 22 modules to parity, then publish one complete v1.0.
- **When it applies (catalog)**: **small** systems, tolerated window, transformational appetite, few live integrations.
- **Cost**: low (no incremental release overhead). **Risk**: **high**. **Time**: long here (the catalog's "short" assumes a *small* system; 22 modules + full native UI breaks that assumption).
- **Fit to derived appetite (transformational)**: appetite fits, but the **size** does not — the catalog only blesses Big Bang for transformational appetite on *small* systems.
- **Trade-offs**:
  - Pros: one clean release; no partial-feature UX; simplest release story.
  - Cons: **high "never-ships" risk for a solo dev**; no feedback until the very end; the largest-risk item (native graph/Kanban UI, AMB-002) stays unvalidated longest; a single enormous parity-test surface at the end.
  - Mitigating note: production-cutover risk is *not* a Big Bang concern here (the VS Code extension remains the fallback), so the danger is schedule/never-ships, not outage.

### Strategy C: Parallel Run — parity-validation overlay (not standalone)
- **Description**: Use the **VS Code extension as the behavioral oracle**: run the same SDD operations in both and compare observable behavior (FSM transitions, gates, hook firing, retention) to prove equivalence. Combines with A or B; feeds the Inspector's golden files and `parity_specs.md`.
- **When it applies**: mandated when there is a **large paradigm change + transformational appetite** (catalog recommendation rule) — exactly this case.
- **Cost**: high (ongoing comparison effort). **Risk**: medium. **Time**: medium (runs alongside the build).
- **Fit to derived appetite (transformational)**: it is the *guardrail* that makes a transformational rewrite safe against the functional-parity metric.
- **Trade-offs**:
  - Pros: directly enforces "functional parity"; turns the surviving legacy into a reusable test oracle; localizes regressions to the slice under build.
  - Cons: requires the legacy to remain runnable as an oracle; effort to capture/maintain golden cases; behavioral (not structural) comparison only, because the implementation model changes.

### Dropped: Branch by Abstraction
- **Reason for non-recommendation**: Branch by Abstraction is for **in-place** internal migration (language/framework changes while the codebase and domain stay). The paradigm decision chose a **greenfield native-Kotlin** target with **no shared core and no JCEF**, so there is no single codebase to place an abstraction seam inside. It contradicts `paradigm_decision.md` Option 1 and is therefore not applicable.

## Comparison

| Criterion | A (Incremental) | B (Big Bang) | C (Parallel-Run overlay) |
|---|---|---|---|
| Cost | medium | low | high |
| Risk | low | high | medium |
| Time | long | long (size breaks "short") | medium (parallel) |
| Fit to appetite (transformational) | strong (large-system form) | weak (size mismatch) | strong (parity guardrail) |
| Compatibility with paradigm change | high (de-risk UI per slice) | low (UI risk unvalidated longest) | high (mandated by gap rule) |

## Strategist recommendation
- **Recommended strategy**: **A (Incremental per-bounded-context) + C (Parallel-Run validation overlay)**.
- **Justification** (traceable to brief + paradigm + appetite):
  - The **functional-parity** success metric + **large paradigm change** trigger the catalog's "recommend Parallel Run to validate parity" rule → C is non-negotiable as an overlay.
  - **Solo maintainer + 22 modules + no deadline** make incremental, testable slices (A) far safer than a giant Big-Bang batch; this also matches the brief's "favor reuse, automation, incremental testable steps."
  - Because there is **no production cutover**, A's only real downside (longer calendar time) is acceptable, and B's only real upside (a single clean cutover) is irrelevant.

### Recommended sequencing (Strategy A)
- **Phase 0 — Foundation + UI spike**: plugin skeleton (`plugin.xml`, `@Service` scaffolding), persistence (`PersistentStateComponent`/`PasswordSafe`), settings, telemetry, Git integration, **and an early Compose/Jewel spike of the hardest UI (graph canvas + Kanban) to de-risk AMB-002 before committing**.
- **Phase 1 — Spec Lifecycle** (`spec`, `steering`, `tasks`): core product value, file-based, highest parity-testability, lighter UI. First user-facing slice.
- **Phase 2 — Automation (`hooks`)**: depends on spec ops; FS watching via `BulkFileListener`; embed the **own MCP client** (AMB-004).
- **Phase 3 — Conversational Agents** (`agent-chat`, `agents`, ACP): integrate the **JetBrains AI Assistant** chat host (AMB-005); define JetBrains **ACP eligibility** (replaces R-HK-9, BR-DESCARTAR-003).
- **Phase 4 — Cloud Delegation** (`cloud-agents`): Devin/Copilot providers; polling via coroutines; `devin` standalone dropped (BR-DESCARTAR-004).
- **Phase 5 — Orchestration / MAESTRO** (last): aggregates all prior contexts **and** carries the heaviest native UI rebuild (React Flow composer + Kanban). Sequenced last by dependency, but its risk is spiked in Phase 0.

## Specific alert signals
- **Large paradigm change + transformational appetite → Parallel Run is mandatory** for parity validation (applied as Strategy C). 
- **AMB-002 (native graph/Kanban UI) is the dominant risk** — the Phase 0 spike exists specifically to surface it before the rest of the build commits. If the spike fails, re-open `paradigm_decision.md` toward Option 3 (Hybrid/JCEF) for those screens (see `risk_register.md` RISK-001).
- **AMB-005 (JetBrains AI Assistant extension API)** may be limited/closed — validate its capabilities in Phase 3 planning before committing the agent-chat slice (RISK-003).

## Human decision
- **Chosen strategy**: **A + C** — Incremental per-bounded-context build with the Parallel-Run parity overlay (the Strategist's recommendation).
- **Who decided**: Italo (solo maintainer)
- **When**: 2026-06-07T20:32:17Z
- **Decider justification**: Accepted the recommended approach: continuous, verifiable parity against the VS Code oracle (matching the functional-parity success metric) with incremental, solo-friendly slices; no deadline makes the longer calendar time acceptable, and there is no production-cutover cost to a single-shot Big Bang that would justify its higher never-ships risk.
