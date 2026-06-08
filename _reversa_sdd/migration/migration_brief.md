---
schemaVersion: 1
generatedAt: 2026-06-07T20:05:15Z
reversa:
  version: "1.2.34"
kind: migration_brief
producedBy: orchestrator
hash: "sha256:443e9875db6a480a01ab0f6efcc4604ca8a6f9cc7780f0c46b4e07b3435724b5"
---

# Migration Brief

> Migration-criteria document collected via interview at the start of `/reversa-migrate`.
> Consumed by the six agents of the Migration Team. It does not ask about paradigm (the Paradigm Advisor's responsibility) nor appetite (derived in `paradigm_decision.md`).

## Migration objective

Expand reach: port `gatomia` — today a VS Code-only extension for Agentic Spec-Driven Development — to the **JetBrains platform** (IntelliJ / WebStorm / PyCharm and siblings), so the product reaches the JetBrains user base. Without this migration the product stays confined to the VS Code ecosystem.

## Success metrics

- **Functional parity (primary):** 100% of the legacy behavior across the 22 modules available and working in the JetBrains plugin, validated by the Inspector through parity tests.
- No date-based target — success is measured by completeness, not by a deadline (no hard timeline).

## Constraints

- **Timeline:** no hard deadline (exploratory). Favor sequencing that delivers verifiable parity slices.
- **Budget:** solo maintainer (limited capacity) — favor reuse, automation, and incremental, testable steps.
- **Technical:** the GitHub Copilot Chat + MCP integration must have a working equivalent on the JetBrains platform; SpecKit / OpenSpec (file-based) behavior must be preserved; the legacy has no runtime database, so none is required in the target.
- **Operational:** none (developer tooling, no runtime SLA or maintenance windows).

## Known risk factors

- **Effort / scope (top risk):** 22 modules + a substantial React webview UI + an extension host is a large surface for a solo developer to port.
- **UI model divergence:** the VS Code React webview model has no 1:1 analogue on JetBrains (Swing / Kotlin UI DSL vs. JCEF embedded Chromium) — the UI approach is a Designer / Screen Translator decision.
- **VS Code-specific APIs:** `workspaceState`, the `postMessage` bridge, tree-view providers, and the command / contribution model need JetBrains-platform equivalents.
- **AI integration surface:** reproducing Copilot Chat / MCP discovery and the agent-chat / orchestration loops on a different host.

## Stakeholders

| Name / role | Migration responsibility |
|---|---|
| Italo — solo maintainer | All product, architecture, and execution decisions. |

## Target stack

- **Language:** Kotlin (idiomatic on the IntelliJ Platform); Java possible.
- **Framework:** IntelliJ Platform SDK (Plugin DevKit, `intellij-platform-gradle-plugin`).
- **Database:** none (mirrors the legacy; state via `PropertiesComponent` / project-scoped files).
- **Messaging:** none.
- **Infra:** distribution via the JetBrains Marketplace.
- **Other relevant components:** the UI rendering approach (Swing / Kotlin UI DSL vs. JCEF to reuse the existing web UI) is **deferred to the Designer (topology) and Screen Translator (mode)**; AI integration via the Copilot SDK or a platform equivalent.

## Declared scope

- **Included:** all 22 legacy modules (extension host + webview), per `inventory.md`.
- **Excluded:** nothing explicitly excluded by the user. Note: the legacy `devin` module is already flagged for removal in `confidence-report.md` (Q1); whether to carry or drop it is left to the **Curator**, not a user-declared exclusion here.

## Free notes

- This is a **greenfield rewrite** on the target (re-implement on the IntelliJ Platform from the specs), **not** a TS->Kotlin transpilation.
- The legacy has no database; no runtime data migration is needed (state is local, per workspace).
- Paradigm and appetite will be set by the **Paradigm Advisor**; topology by the **Designer**; screen-modernization mode by the **Screen Translator**.
- `config.toml` declares `doc_language = English`; all migration artifacts are authored in English to match the existing `_reversa_sdd/` specs.
