---
schemaVersion: 1
generatedAt: 2026-06-07T20:38:00Z
reversa:
  version: "1.2.34"
kind: screen_modernization_decision
producedBy: screen-translator
decidedBy: Italo
decidedAt: 2026-06-07T20:38:00Z
mode: modernized
sourcePlatform: vscode-extension-ui
targetPlatform: compose
hash: "sha256:3f0441e16764003b5ea7fb76ff47d737b96538d99e7421ff8e3b267912fe8806"
---

# Decisão de Modernização de Telas

> Conscious decision on how to translate the legacy screens. Required reading for the Screen Translator (Phase 2), the Inspector (to build mode-appropriate parity tests), and the coding agent.
> NOTE: `mode` in the front-matter is the Screen Translator's **recommendation**; it is confirmed by the human at the Phase-1 gate (`decidedBy`/`decidedAt` are filled on approval).

## Contexto

- **Detected source platform**: `vscode-extension-ui` — hybrid of (a) VS Code **TreeView** providers (native VS Code list UIs) and (b) a **React 18 webview SPA** (Vite + Zustand) for the panel surfaces.
- **Confidence**: 🟢 CONFIRMED (`architecture.md` §2/§6, `dependencies.md` webview deps, `ui/inventory.md`).
- **Target platform**: `compose` — Compose for Desktop / Jewel, in-process (per `target_architecture.md` AD-08, `paradigm_decision.md` Option 1).
- **Screens inventoried**: 14 gatomia-owned (8 tree views + 5 webview panels + 1 uncaptured activity-bar tree). The external Devin Cloud provider UI (`ui/inventory.md` row 11) is **excluded** (not gatomia-owned).
- **Inventory source**: `_reversa_sdd/screens/inventory.json` + `_reversa_sdd/ui/inventory.md` (divergence 6.7%, below the 10% RF-05 stop).
- **Adapter applied**: `vscode_extension_ui__compose` — **a new pair**, not in the v1 master table (`references/adapter-pairs.md`). It is a graphical->graphical modernization, so the canonical spec format is **`composable`** (Compose Kotlin). See Notes (pair extension is an assumption to confirm).

## Modos avaliados

### Modo: literal
- **Definition**: pixel-equivalent parity between the legacy React/VS Code UI and the new Compose UI.
- **Trade-offs**:
  - Implementation cost: **alto**
  - Visual fidelity: alta (only if pixel-matched against the 23 source screenshots)
  - Constructive parity tests: **não** (cross-platform pixel diffing React-webview vs native Compose is brittle/meaningless)
  - Expected end-user acceptance: **baixa** (a pixel-cloned web UI feels alien inside a JetBrains IDE)
  - Future tech debt: **alto** (fights Jewel/IntelliJ native theming forever)
- **Recommended**: **não**
- **Justification**: literal pixel-cloning contradicts the chosen native paradigm (Option 1) and Jewel's native theming; high cost, low native-feel, no useful parity tests. Not viable as a good fit even though screenshots exist.

### Modo: modernizado  (RECOMMENDED)
- **Definition**: idiomatic redesign in Compose/Jewel adopting IntelliJ-native look, preserving information, flow, and **textual content verbatim**, re-expressing hierarchy/interaction, with the 4 explicit states (idle/loading/error/success) per screen.
- **Trade-offs**:
  - Implementation cost: **médio**
  - Visual fidelity: média (re-expressed, native look)
  - Constructive parity tests: **parcial** -> behavioral (flow/state/content equivalence, not pixels) — aligns with Inspector's behavioral-parity mandate
  - Expected end-user acceptance: **alta** (native IntelliJ feel)
  - Future tech debt: **baixo**
- **Recommended**: **sim**
- **Justification**: it is the direct materialization of `paradigm_decision.md` I2 (React->Compose) and the only mode that yields a native-feeling, maintainable plugin while preserving behavior for parity.

### Modo: híbrido
- **Definition**: some screens literal, some modernized, with explicit per-screen lists.
- **Trade-offs**:
  - Implementation cost: **alto** (two UI approaches)
  - Mixed visual fidelity: literal screens pixel-cloned, modernized screens native — inconsistent look
  - Parity tests per subset: literal=pixel (brittle), modernized=behavioral
  - Separation maintenance cost: **alto**
- **Recommended**: **não**
- **Justification**: no screen here benefits from literal (uniform platform change to native Compose), so hybrid only adds split-maintenance cost and a visually inconsistent UI.

## Decisão

- **Modo escolhido**: **modernized**
- **Justificativa do humano**: Consistent with `paradigm_decision.md` Option 1 (React->Compose); a native-feeling, maintainable IntelliJ plugin with the target's Jewel theming, preserving information/flow/text for behavioral parity.
- **Alternativas descartadas**: literal (fights native theming, brittle/no useful parity tests, alien feel); hybrid (split-maintenance with no benefit for a uniform platform change).
- **Decidido em**: 2026-06-07T20:38:00Z
- **Decidido por**: Italo
- **Adapter-pair extension**: confirmed — proceed with `composable` (Compose Kotlin) specs for the new `vscode-extension-ui -> compose` pair (not the raw-prose fallback).

### Em modo híbrido, listas explícitas (obrigatórias)
- Not applicable unless hybrid is chosen (then both lists must be non-empty, else Phase 2 is refused — EC-12).

## Implicações pendentes para a Fase 2

| Etapa | Implicação | Como honrar |
|---|---|---|
| `target_screens.md` | 14 screens, modernized -> `composable` (Compose Kotlin) spec per screen with the 4 states | Generate one section per screen with component hierarchy, Jewel tokens, events, transitions, and the 4 states |
| Golden files | No executable legacy oracle wired in v1; 23 source screenshots exist as visual reference only | Emit `manifest.yaml` with suggested capture commands; do not auto-capture (OQ-02). Screenshots are reference, not byte-golden |
| Design-system tokens | **EC-17: `_reversa_sdd/design-system/` is absent** | Modernized -> reference **Jewel/IntelliJ theme tokens**; derive only semantic tokens (status/lane/badge colors) into `tokens-derived.md`, logged as deviations |
| Textual content | Preserve labels/messages verbatim (no linguistic revision unless explicitly approved) | Copy strings literally from the legacy; zero string diff |

## Implicações para o Inspector

- **Parity strategy (modernized)**: semantic contract — events, transitions, textual content, and the 4 states per screen. **No byte/pixel comparison.** Consistent with the paradigm decision's behavioral-parity mandate (AMB-001).
- **Deviations to propagate**: see `screen_deviation_log.md` (Phase 2). Expected: the adapter-pair extension and the Jewel-token derivations.

## Notas

- **Adapter-pair extension (assumption to confirm)**: `vscode-extension-ui -> compose` is not a v1 master-table pair. Per `adapter-pairs.md` ("Pares novos podem ser adicionados"), it is treated as a new graphical->graphical modernization using the `composable` format. If you prefer, the Screen Translator can fall back to the `raw-prose` template per screen — but `composable` gives the coding agent far more actionable specs. Flagged for your confirmation at the gate.
- **EC-17 (no design-system)**: the legacy used VS Code theming + Tailwind; the target uses Jewel/IntelliJ native theme. Modernized mode adopts the **target** theme, so a literal Tailwind-token port is neither needed nor desirable. You may optionally run `reversa-design-system` first to extract legacy semantic tokens, but it is not required for modernized mode.
- **Tree views vs panels**: the 8 VS Code tree views become Compose tool-window list/tree components; the 5 React panels become Compose screens. Both are `composable` specs in Phase 2.
