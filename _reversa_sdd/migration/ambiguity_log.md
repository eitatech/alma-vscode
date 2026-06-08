---
schemaVersion: 1
generatedAt: 2026-06-07T20:14:03Z
reversa:
  version: "1.2.34"
kind: ambiguity_log
producedBy: orchestrator
hash: "sha256:412bacdaadfb97f753325fa1efb052434b61959f18b8c687a0627e23d0876ce2"
---

# Ambiguity Log

> Consolidation of every ambiguous (warning) or pending item detected by the agents across the pipeline.
> Expected final status when the pipeline completes: no PENDING items.

## Summary
- Total items: 6
- PENDING: 0
- RESOLVED WITH HUMAN DECISION: 5
- REFERRED TO CODING: 1

## Items

### AMB-001
- **Description**: Paradigm gap between the legacy (hybrid: OO-with-DI + event-driven host + reactive React/Zustand webview) and the IntelliJ Platform target (OO-with-DI + message bus; no native React). The gap is concentrated in the UI layer.
- **Detected by**: paradigm_advisor
- **Origin**: `paradigm_decision.md` (gap section I1-I5); legacy evidence in `architecture.md` §2/§5/§6, `domain.md` §2/§4.4, ADR-0002/0003/0010/0011.
- **Status**: RESOLVED WITH HUMAN DECISION
- **Decision taken**:
  - **Choice**: Option 1 — adopt the target's natural paradigm (idiomatic IntelliJ; native Kotlin host + declarative Compose/Jewel UI; drop the postMessage bridge).
  - **Decider**: Italo (solo maintainer)
  - **When**: 2026-06-07T20:12:03Z
  - **Justification**: Prioritize a clean, single-language, idiomatic, maintainable target over short-term UI parity speed; no hard deadline makes the larger UI rewrite affordable; dropping JCEF removes the bridge, type-mirror parity machinery, and the two-language maintenance burden.

### AMB-002
- **Description**: Under Option 1 there is **no JCEF escape hatch**, so the heavy interactive UI surfaces — `webview-orchestration` React Flow composer + Kanban board, and `webview-preview` markdown/mermaid rendering — must be rebuilt natively in Compose/Jewel. This is the single largest effort item and the materialization of the brief's top risk (effort/scope).
- **Detected by**: paradigm_advisor
- **Origin**: `paradigm_decision.md` (implication I2 + Notes); legacy evidence in `architecture.md` §6, `domain.md` §2 (Orchestration/Presentation contexts).
- **Status**: REFERRED TO CODING
- **Decision taken**:
  - **Choice**: Proceed native; if effort proves prohibitive mid-migration, the only paradigm-preserving fallback is to re-open the paradigm decision toward Option 3 (Hybrid) for those specific screens. To be carried into the Strategist's risk register and the Screen Translator's deviation log.
  - **Decider**: orchestrator (carry-forward)
  - **When**: 2026-06-07T20:14:03Z
  - **Justification**: Consistent with the user's transformational choice; flagged for visibility so downstream agents and the coding agent size it explicitly.

### AMB-003
- **Description**: `validateConstitution` (steering) is an inert stub; the decision is to implement real validation but the concrete rules are undefined (required sections? non-empty principles? schema checks?).
- **Detected by**: curator
- **Origin**: `target_business_rules.md` BR-HUMANA-001; `gaps.md` G-A; confidence-report Q5.
- **Status**: RESOLVED WITH HUMAN DECISION
- **Decision taken**:
  - **Choice**: (a) wire-it-rules-later — migrate the validator extension point wired-but-permissive; define concrete rules in a forward `/reversa-requirements` cycle.
  - **Decider**: Italo
  - **When**: 2026-06-07T20:26:10Z
  - **Follow-up**: concrete constitution rules are a forward-cycle coding item.

### AMB-004
- **Description**: MCP discovery surface on JetBrains. The legacy discovers MCP tools via VS Code's `vscode.lm.tools` (with a tool->server heuristic, gap G-B); that API does not exist on the IntelliJ Platform, so the discovery source and the server-of-origin signal must be re-answered.
- **Detected by**: curator
- **Origin**: `target_business_rules.md` BR-HUMANA-002; `gaps.md` G-B; `domain.md` §4.4 R-HK-6; confidence-report Q9.
- **Status**: RESOLVED WITH HUMAN DECISION
- **Decision taken**:
  - **Choice**: (b) embed our own MCP client in the plugin (owns server-of-origin metadata, resolves G-B).
  - **Decider**: Italo
  - **When**: 2026-06-07T20:26:10Z
  - **Follow-up**: the Designer places this client in the target architecture; implementation is a coding item.

### AMB-005
- **Description**: JetBrains chat host for agent definitions. Legacy agents register as GitHub Copilot chat participants (VS Code API); JetBrains has no identical concept, and the choice shapes `agent-chat`, `agents`, and prompt decoration.
- **Detected by**: curator
- **Origin**: `target_business_rules.md` BR-HUMANA-003; `domain.md` §3/§4.1; `migration_brief.md` (technical constraint).
- **Status**: RESOLVED WITH HUMAN DECISION
- **Decision taken**:
  - **Choice**: (b) **JetBrains AI Assistant** as the chat host — **user override** of the Curator's recommendation (c, own chat tool window).
  - **Decider**: Italo
  - **When**: 2026-06-07T20:26:10Z
  - **Follow-up / risk**: the Designer must map `.agent.md` definitions, commands, and prompt decoration (R-X-3) onto AI Assistant's extension surface and confirm it exposes a stable API for routing to gatomia's ACP/cloud providers. If that API is limited/closed, this is a platform-coupling risk for the Strategist's `risk_register.md`.

### AMB-006
- **Description**: Import of existing VS Code gatomia configuration/state (hooks.json, sessions, specs under `.vscode/gatomia/`) into the JetBrains plugin.
- **Detected by**: curator
- **Origin**: `target_business_rules.md` BR-HUMANA-004; `domain.md` §4.4 R-HK-8; `architecture.md` §1.
- **Status**: RESOLVED WITH HUMAN DECISION
- **Decision taken**:
  - **Choice**: (a) no import in v1 (greenfield for the new JetBrains audience, consistent with "expand reach").
  - **Decider**: Italo
  - **When**: 2026-06-07T20:26:10Z
  - **Follow-up**: R-HK-8's legacy in-place hook migration is out of scope for v1 (schema validation still migrates).

## Items referred to coding
> Lists only items with status REFERRED TO CODING. Highlighted in `handoff.md`.

- AMB-002: Native rebuild of the React Flow composer + Kanban + mermaid/markdown preview (no JCEF fallback) — largest effort item; fallback is per-screen Option 3.
- AMB-003 (follow-up): define concrete constitution-validation rules in a forward `/reversa-requirements` cycle.
- AMB-004 (follow-up): implement the embedded MCP client (server-of-origin metadata) once the Designer fixes its place in the architecture.

## Notes
- Updated incrementally after each Migration Team agent. As of the post-Curator gate, **all human decisions are resolved (0 PENDING)**. Strategist/Designer/Screen Translator/Inspector entries will be appended in order; any new ambiguity they raise re-opens this ledger.
- AMB-005's outcome (JetBrains AI Assistant) is a direct input to the Designer's architecture and a candidate risk for the Strategist.
