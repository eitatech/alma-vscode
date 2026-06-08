---
schemaVersion: 1
generatedAt: 2026-06-07T20:14:03Z
reversa:
  version: "1.2.34"
kind: discard_log
producedBy: curator
hash: "sha256:ddc1f843ee316404c98229b18cb09c28f16eb7d2791579c0bdbb68dc0a31acd5"
---

# Discard Log

> Complete record of what was discarded from the migration and why. Every item traces back to its legacy origin.
> Context: `paradigm_decision.md` Option 1 (idiomatic IntelliJ; native Compose UI; the `postMessage` bridge and the two-bundle webview architecture are removed).

## Discarded items

### BR-DESCARTAR-001 — Webview HTML security + page-selection mechanics (R-X-1)
- **Origin**: `domain.md` §4.6 (R-X-1).
- **Description**: Webview HTML uses a per-render 32-char nonce + strict CSP, and the active page is selected at runtime from `#root[data-page]`.
- **Justification**: There is no webview, no HTML document, and no CSP under native Compose/Jewel UI. Page selection becomes native navigation (tool-window content / routing).
- **Paradigm-linked**: **yes**
  - The target paradigm renders UI in-process on the JVM; the entire web-content-security model (nonce/CSP) and the HTML page-mounting indirection are absorbed by not having a browser context at all.
- **Replacement in the new system**: None for CSP/nonce (no web attack surface); page selection → IntelliJ tool-window content + navigation state.
- **Discard risk**: **low** — removing CSP is safe precisely because the web context that needed it is gone.

### BR-DESCARTAR-002 — Webview/host contract boundary: no-`src/` rule, type mirror, parity tests (R-X-6)
- **Origin**: `domain.md` §4.6 (R-X-6); ADR-0002/0003.
- **Description**: The webview must not import from `src/`; `ui/src/.../types.ts` is a hand-maintained contract mirror of extension types, guarded by parity tests against drift.
- **Justification**: This rule exists *only* because the legacy ships two separate bundles communicating over a serialization bridge. Native UI shares Kotlin types in-process; there is no second bundle, no mirror, and nothing to drift.
- **Paradigm-linked**: **yes**
  - Directly fulfills `paradigm_decision.md` implication **I1** (the bridge dissolves; type-mirror parity machinery becomes obsolete).
- **Replacement in the new system**: Shared Kotlin types referenced directly by UI and services; the compiler enforces what parity tests used to.
- **Discard risk**: **low** — eliminates a whole class of drift bugs (cf. the legacy's own R-X-6 violations, gaps `D-8`).

### BR-DESCARTAR-003 — ACP eligibility limited to Windsurf/Antigravity (R-HK-9)
- **Origin**: `domain.md` §4.4 (R-HK-9); `architecture.md` §8 (portability).
- **Description**: ACP routing is eligible only on the Windsurf/Antigravity VS Code forks and only on non-remote workspaces (`env.remoteName` falsy).
- **Justification**: Windsurf and Antigravity are VS Code forks; the gate keys off VS Code IDE-host detection that has no meaning on the IntelliJ Platform.
- **Paradigm-linked**: **yes** (platform, not programming-paradigm)
- **Replacement in the new system**: A JetBrains-appropriate ACP-eligibility rule (can the running IntelliJ-family IDE spawn the local ACP CLI? remote/Gateway considerations?) — **to be defined by the Designer**. The ACP integration itself (CLI subprocess over JSON-RPC stdio, R-X-4/R-X-5) is host-agnostic and **migrates**.
- **Discard risk**: **medium** — the *eligibility predicate* must be re-derived for JetBrains so ACP isn't silently disabled or wrongly enabled (flagged for the Designer).

### BR-DESCARTAR-004 — Legacy standalone `devin` module (D-1)
- **Origin**: `gaps.md` `D-1`; `domain.md` §4.2 + §5.1; confidence-report Q1; `architecture.md` §7.1.
- **Description**: The standalone `devin` integration (`DevinPollingService`, `devin-commands`, `devin-progress-panel`, browser-opening PR actions, `GRACE_CYCLES_AFTER_TERMINAL=6`) duplicates Devin session lifecycle + polling already provided by the provider-agnostic `cloud-agents` layer.
- **Justification**: Maintainer-decided removal (confidence-report Q1): `cloud-agents` is canonical; the dual path is technical debt. The migration brief explicitly delegated the `devin` carry/drop decision to the Curator.
- **Paradigm-linked**: **no** — this is decided redundancy, independent of the paradigm change.
- **Replacement in the new system**: Devin support is preserved entirely via the **`cloud-agents` `CloudAgentProvider`** Devin adapter (BR-MIGRAR-003). The canonical grace policy is `cloud-agents`' time-based grace (5 min known-PR / 1 h unknown), replacing the standalone `GRACE_CYCLES` constant.
- **Discard risk**: **low** — no behavior is lost; the canonical path covers it (gaps §47-48).

### BR-DESCARTAR-005 — Webview wiring defect-class (D-6, D-7, D-8, D-9)
- **Origin**: `gaps.md` `D-6`/`D-7`/`D-8`/`D-9`; confidence-report Q6/Q7/Q8.
- **Description**: A cluster of defects that exist only because of the two-bundle webview: `cloud-agent-progress`/`devin-progress` pages missing from `page-registry` ("Unknown page", D-6); the Kanban board has no importer and imports `src/` (D-7); `webview-spec-explorer` bypasses the shared bridge via its own `acquireVsCodeApi()`/`window.specExplorerVscode` (D-8); dead duplicate component trees `components/hooks/*` and `components/cli-options/*` (D-9).
- **Justification**: With native Compose UI there is no `page-registry`, no `acquireVsCodeApi`, no second `src/` bundle, and no parallel React component trees. The **features** (progress views, Kanban, spec explorer, hooks UI) all **migrate natively** under their respective MIGRATE rules; the specific *wiring bug-class* simply cannot exist in the target.
- **Paradigm-linked**: **yes**
  - Absorbed by `paradigm_decision.md` I1/I2 (no bridge, no webview page registry).
- **Replacement in the new system**: Native Compose screens wired through the IntelliJ tool-window/navigation model; one component per screen (no dead duplicates).
- **Discard risk**: **low** — discarding the *defects*, not the features; the features are re-implemented natively.

## Discarded due to paradigm change (dedicated subsection)

> Items whose `Paradigm-linked = yes`. Explicit audit for the coding agent.

| ID | Origin | Legacy paradigm/mechanic | Replacement in target paradigm |
|---|---|---|---|
| BR-DESCARTAR-001 | R-X-1 | Webview HTML nonce + strict CSP + `#root[data-page]` | No web context; native Compose UI + tool-window navigation (CSP/nonce unneeded) |
| BR-DESCARTAR-002 | R-X-6 | Two-bundle `postMessage` boundary: no-`src/` rule + hand-mirrored `types.ts` + parity tests | Shared in-process Kotlin types; compiler-enforced, no mirror/parity tests |
| BR-DESCARTAR-003 | R-HK-9 | ACP eligibility via VS Code-fork detection (Windsurf/Antigravity) | JetBrains-specific ACP eligibility predicate (Designer-defined) |
| BR-DESCARTAR-005 | D-6/D-7/D-8/D-9 | `page-registry` + `acquireVsCodeApi` + duplicate React trees | Native Compose screens via tool-window/navigation; one component per screen |

## Notes
- The discard set is intentionally narrow: only **3** of 56 behavioral rules are dropped (R-X-1, R-X-6, R-HK-9), all because of the host/UI architecture change, plus the maintainer-decided `devin` removal and the webview defect-class that the paradigm absorbs.
- No domain/behavioral rule (sessions, cloud delegation, spec lifecycle, hooks semantics, orchestration) was discarded — the migration preserves the product's behavior and changes only its expression, consistent with the Curator policy.
- The coding agent should treat the "paradigm-linked" table as a checklist of things that should **not** be re-implemented in the target (they are anti-requirements).
