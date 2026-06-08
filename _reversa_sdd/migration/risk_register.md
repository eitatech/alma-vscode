---
schemaVersion: 1
generatedAt: 2026-06-07T20:26:10Z
reversa:
  version: "1.2.34"
kind: risk_register
producedBy: strategist
hash: "sha256:54a9f1e9f70417253c819721b659b18033da1db03cae9ffb724f690726fb87d9"
---

# Risk Register

> Migration risks with probability, impact, mitigation, and owner. Owner is a role (solo project: "maintainer"); design-time risks are owned by the "Designer" stage.

## Risks

### RISK-001
- **Description**: Rebuilding the heavy interactive UI natively in Compose/Jewel with no JCEF fallback — `webview-orchestration` React Flow composer + Kanban, `webview-preview` markdown/mermaid (`ambiguity_log.md` AMB-002).
- **Category**: técnico
- **Probability**: alta
- **Impact**: alto
- **Combined severity**: **Alta**
- **Trigger / signal**: the Phase 0 Compose/Jewel spike cannot reproduce an interactive node-graph + drag Kanban with acceptable effort/quality.
- **Mitigation**: front-load a Phase 0 spike of the graph canvas + Kanban; evaluate Jewel + a JVM graph layout lib before committing; keep the orchestration context sequenced last so the spike informs it.
- **Contingency**: re-open `paradigm_decision.md` toward **Option 3 (Hybrid)** for *only* those screens (JCEF for the canvas/Kanban), preserving the native host elsewhere.
- **Owner**: maintainer (approach: Designer)
- **Status**: aberto

### RISK-002
- **Description**: Compose for Desktop / Jewel maturity for complex, IDE-embedded interactive UI (theming, focus, accessibility, virtualization) may lag the React stack it replaces.
- **Category**: técnico
- **Probability**: média
- **Impact**: alto
- **Combined severity**: **Alta**
- **Trigger / signal**: missing components, theming gaps, or performance issues surfacing during Phase 0/Phase 1.
- **Mitigation**: prefer **Jewel** (IntelliJ-themed Compose) for platform consistency; validate component coverage against the legacy screen inventory early (Screen Translator).
- **Contingency**: drop to **Swing / Kotlin UI DSL** for components Compose can't cover; JCEF only as last resort for a specific screen.
- **Owner**: Designer / maintainer
- **Status**: aberto

### RISK-003
- **Description**: The chosen chat host — **JetBrains AI Assistant** (AMB-005, user override) — may not expose a stable public API to register custom agents/`.agent.md` participants or to route to gatomia's ACP/cloud providers.
- **Category**: técnico / organizacional
- **Probability**: média
- **Impact**: alto
- **Combined severity**: **Alta**
- **Trigger / signal**: AI Assistant SDK lacks a participant/tool extension point, or the API is internal/unstable, discovered in Phase 3 planning.
- **Mitigation**: validate the AI Assistant plugin SDK surface and prototype a minimal agent registration **before** committing the Conversational Agents slice.
- **Contingency**: fall back to gatomia's **own chat tool window** (the Curator's original recommendation BR-HUMANA-003 option c), driving ACP/cloud providers directly.
- **Owner**: maintainer (validation: Designer)
- **Status**: aberto

### RISK-004
- **Description**: Effort and protocol-drift of embedding our own MCP client (AMB-004) to own server-of-origin metadata.
- **Category**: técnico
- **Probability**: média
- **Impact**: médio
- **Combined severity**: **Média**
- **Trigger / signal**: no usable Kotlin/JVM MCP client library; spec churn in the MCP protocol.
- **Mitigation**: reuse an existing JVM MCP client if available; isolate the client behind an interface (`@Service`); pin the protocol version.
- **Contingency**: defer MCP-action hooks — ship non-MCP hook actions (agent/git/github/custom/acp) first.
- **Owner**: maintainer
- **Status**: aberto

### RISK-005
- **Description**: JetBrains ACP-eligibility predicate is undefined (the legacy gated ACP to Windsurf/Antigravity VS Code forks, R-HK-9 / BR-DESCARTAR-003).
- **Category**: técnico
- **Probability**: média
- **Impact**: médio
- **Combined severity**: **Média**
- **Trigger / signal**: ambiguity about which IntelliJ-family IDEs / remote (Gateway) scenarios may spawn the local ACP CLI.
- **Mitigation**: the Designer defines a JetBrains eligibility predicate; test on IntelliJ IDEA + one Gateway/remote scenario.
- **Contingency**: ship ACP disabled by default, enabling it per validated host.
- **Owner**: Designer
- **Status**: aberto

### RISK-006
- **Description**: Solo-maintainer capacity against a 22-module surface + full UI rewrite (the brief's stated top risk: effort/scope).
- **Category**: organizacional
- **Probability**: alta
- **Impact**: alto
- **Combined severity**: **Alta**
- **Trigger / signal**: slices slipping repeatedly; Phase 0/1 taking far longer than expected.
- **Mitigation**: the incremental strategy (A) with shippable slices; ruthless YAGNI; use `_reversa_sdd/` specs as the ready-made build backlog; reuse parity tests as the definition of done.
- **Contingency**: narrow v1.0 to the core (Spec Lifecycle + Automation), defer Orchestration/MAESTRO to a later release.
- **Owner**: maintainer
- **Status**: aberto

### RISK-007
- **Description**: Kotlin / IntelliJ Platform learning curve coming from a TypeScript / VS Code background.
- **Category**: organizacional
- **Probability**: média
- **Impact**: médio
- **Combined severity**: **Média**
- **Trigger / signal**: slow progress in Phase 0; repeated platform-idiom mistakes.
- **Mitigation**: treat Phase 0 (foundation) as a deliberate learning ramp; lean on IntelliJ Platform SDK docs/sample plugins/templates.
- **Contingency**: extend Phase 0; use Java for the earliest modules if Kotlin idioms slow things down.
- **Owner**: maintainer
- **Status**: aberto

### RISK-008
- **Description**: Dual maintenance of two products (VS Code extension + JetBrains plugin) lets behavior diverge during/after the long build.
- **Category**: operacional
- **Probability**: alta
- **Impact**: médio
- **Combined severity**: **Média**
- **Trigger / signal**: bug fixes landing in one product but not the other; parity tests starting to fail after legacy changes.
- **Mitigation**: treat `_reversa_sdd/` as the single behavioral source of truth; the Parallel-Run parity tests (Strategy C) detect drift.
- **Contingency**: freeze the VS Code extension to maintenance-only once the JetBrains plugin reaches parity for a context.
- **Owner**: maintainer
- **Status**: aberto

### RISK-009
- **Description**: Parity-oracle fidelity — using the VS Code extension as the behavioral oracle requires it to stay runnable and its behavior to be externally observable (some behavior is UI-internal).
- **Category**: técnico (teste)
- **Probability**: média
- **Impact**: médio
- **Combined severity**: **Média**
- **Trigger / signal**: behaviors that can't be observed/compared without instrumenting the legacy.
- **Mitigation**: capture golden cases early (Inspector); assert observable behavior, not structure; instrument the legacy minimally where needed.
- **Contingency**: derive parity expectations from the specs where the oracle can't be observed.
- **Owner**: maintainer (criteria: Inspector)
- **Status**: aberto

### RISK-010
- **Description**: External API change (Devin REST / GitHub Copilot / JetBrains AI Assistant) during the long calendar window.
- **Category**: técnico / operacional
- **Probability**: média
- **Impact**: médio
- **Combined severity**: **Média**
- **Trigger / signal**: provider deprecations/version bumps.
- **Mitigation**: isolate providers behind interfaces (as the legacy already does, ADR-0007); pin/version external contracts.
- **Contingency**: adapter updates per provider; the interface seam localizes the change.
- **Owner**: maintainer
- **Status**: aberto

## Severity summary

| Severity | Count | IDs |
|---|---|---|
| Crítica | 0 | — |
| Alta | 4 | RISK-001, RISK-002, RISK-003, RISK-006 |
| Média | 6 | RISK-004, RISK-005, RISK-007, RISK-008, RISK-009, RISK-010 |
| Baixa | 0 | — |

## Risks related to the target paradigm

> Risks whose direct origin is the gap recorded in `paradigm_decision.md` (transformational; native Compose, bridge dropped).

- **RISK-001** — native rebuild of the heavy interactive UI (no JCEF) — implication I2 / AMB-002.
- **RISK-002** — Compose/Jewel maturity for the UI that replaces React — implication I2.
- **RISK-003** — JetBrains AI Assistant as the chat host (the platform replacement for the Copilot-chat-participant model) — AMB-005 / implication I3.
- **RISK-005** — JetBrains ACP eligibility (platform replacement for the Windsurf/Antigravity gate) — BR-DESCARTAR-003.
