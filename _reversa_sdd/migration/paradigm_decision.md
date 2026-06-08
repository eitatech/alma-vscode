---
schemaVersion: 1
generatedAt: 2026-06-07T20:12:03Z
reversa:
  version: "1.2.34"
kind: paradigm_decision
producedBy: paradigm_advisor
hash: "sha256:605de1f0731155c0d4d45e365b7efea2210b4cb4373c0b6508769e667b946234"
---

# Paradigm Decision

> Conscious decision about how to handle the paradigm shift between the legacy and the target stack.
> This artifact is REQUIRED first reading for every downstream agent and for the coding agent.

## Legacy paradigm detected

- **Main paradigm**: **Hybrid** — OO-with-DI + event-driven on the extension host, plus a reactive/functional webview.
- **Confidence**: 🟢 CONFIRMED (pattern + ADR + rule evidence across the discovery specs).
- **Evidence**:
  - OO-with-DI host: `SpecSystemAdapter` facade over SpecKit/OpenSpec and `CloudAgentProvider` abstraction with Devin/Copilot adapters — `architecture.md` §5 patterns 2-3, ADR-0004/0007. 🟢
  - Bounded contexts via feature folders: `architecture.md` §4 and `domain.md` §2 (Conversational Agents, Cloud Delegation, Spec Lifecycle, Automation, Orchestration, Presentation infra). 🟢
  - Event-driven host: hooks engine (trigger + conditions + schedule -> action), `domain.md` §4.4 R-HK-1..R-HK-8; **22 FSMs** with absorbing terminal sets and status-detail-overrides-base, ADR-0010, `state-machines.md`. 🟢
  - Filesystem-watcher completion detection with 2s debounce (not command dispatch): R-HK-7. 🟢
  - VS Code contribution model: 89 commands + 10 views contributed (`confidence-report.md`). 🟢
  - Reactive webview: React 18.3 + Zustand 5 unidirectional data flow over a single `postMessage` bridge the webview never bypasses — ADR-0003, `architecture.md` §2/§6. 🟢
- **Observed variations (hybrid breakdown)**:
  - Extension host (`src/`): **OO-with-DI + event-driven** (services, adapters/providers, FSMs, hooks, command callbacks). 🟢
  - Webview (`ui/`): **functional/reactive component model** (React + hooks + Zustand). 🟢
  - Cross-boundary: **message-passing** (`postMessage` bridge) with hand-mirrored type contracts + parity tests (ADR-0002/0003). 🟢

## Target stack declared

- Language: Kotlin (Java possible) — from `migration_brief.md`.
- Framework: IntelliJ Platform SDK (`intellij-platform-gradle-plugin`) — from `migration_brief.md`.
- Infra: JetBrains Marketplace distribution; no database; no messaging — from `migration_brief.md`.

## Natural paradigm inferred

- **Paradigm**: **OO-with-DI + message bus** (inversion-of-control plugin platform), with coroutine-based async.
- **Justification**: The catalog maps Kotlin -> OO-with-DI. The IntelliJ Platform specifically is an IoC plugin host: `plugin.xml` extension points, `@Service` project/application services, `AnAction` actions and tool windows, a **message bus** for events, `VirtualFileListener`/`BulkFileListener` for file events, and Kotlin coroutines / `Task.Backgroundable` for async. Persistence via `PersistentStateComponent`/`PropertiesComponent` + `PasswordSafe`.
- **Viable alternatives (UI rendering)**:
  - **Compose for Desktop / Jewel** — declarative, reactive (closest analogue to React); idiomatic on modern JetBrains. **Chosen.**
  - **Swing / Kotlin UI DSL** — imperative, retained-mode; the platform default for forms/dialogs.
  - **JCEF** — embedded Chromium that can host the existing React SPA verbatim (keeps the bridge). **Rejected by the decision below.**

## Gap identified

- **Severity**: **medium overall** — but **concentrated in the UI layer** (the host paradigm transfers well; both VS Code and IntelliJ are "register a contribution, get called back").
- **Concrete implications** (citing the legacy):
  - **I1 — The `postMessage` bridge dissolves.** Native UI runs in-process on the JVM and calls services directly, so the single bridge (ADR-0003) and the hand-mirrored type contracts + parity tests (ADR-0002) become obsolete. No JS<->JVM channel is introduced.
  - **I2 — Declarative React -> declarative Compose, but a full rewrite.** Heavy reactive surfaces — `webview-orchestration` (React Flow composer + Kanban) and `webview-preview` (markdown/mermaid) — must be re-implemented in Compose/Jewel. There is **no JCEF escape hatch** under this decision, so the interactive graph canvas and Kanban are rebuilt natively (the single biggest effort item).
  - **I3 — Commands/contributions -> extension points + actions + services.** The 89 commands / 10 views move to `plugin.xml` + `AnAction` + tool windows; the `SpecSystemAdapter` / `CloudAgentProvider` abstractions map to `@Service` + extension points; DI shifts from activation-time wiring (`extension.ts`) to `project.getService(...)`.
  - **I4 — Event/FSM/async model changes.** Hooks' FS-watcher completion detection (R-HK-7) becomes `BulkFileListener` on the message bus; the 22 FSMs (ADR-0010) become Kotlin **sealed-class** state machines (a natural fit for absorbing terminal sets); long-running work becomes `Task.Backgroundable` / coroutines with `ProgressIndicator` cancellation, replacing Node's event loop and the legacy local-only cancel (R-CD-2).
  - **I5 — Persistence API maps 1:1 (no paradigm shift).** `workspaceState` + JSON/JSONL + `SecretStorage` (`architecture.md` §1) -> `PersistentStateComponent`/`PropertiesComponent` + project files + `PasswordSafe`.

## Options presented to the user

1. **Adopt the target's natural paradigm** (transformational)
   - Consequences: native Kotlin host (extension points, `@Service` DI, message bus, coroutines) + **declarative Compose/Jewel UI**; drop the `postMessage` bridge and type-mirror parity tests; re-implement React Flow composer + Kanban + preview natively. Cleanest, most idiomatic, single-language target; **largest** UI rewrite.
2. **Force a paradigm similar to the legacy** (conservative)
   - Consequences: embed the existing React SPA in **JCEF**, keep a `JBCefJSQuery` bridge, thin Kotlin host mirroring `src/` services. Fastest UI parity (reuse `ui/` largely as-is); non-idiomatic ("web app in a box"), carries serialization-drift risk, JCEF packaging/availability caveats, and a two-language (Kotlin + TS) maintenance burden.
3. **Hybrid per-screen** (balanced)
   - Consequences: native idiomatic host + Compose for simple/form screens, **JCEF only for heavy canvases** (React Flow composer, Kanban, preview). Two UI technologies; the Screen Translator owns the per-screen mode list.

## User decision

- **Choice**: **1 — Adopt the target's natural paradigm (idiomatic IntelliJ with Compose/Jewel).**
- **User justification**: Prioritize a clean, single-language, idiomatic IntelliJ target with the best long-term maintainability over short-term UI parity speed. The "no hard deadline" constraint makes the larger UI rewrite affordable, and avoiding JCEF removes the serialization bridge, the type-mirror parity machinery, and the two-language (Kotlin + TS) maintenance burden entirely.
- **Decided at**: 2026-06-07T20:12:03Z

## Derived appetite

- `derived_appetite`: **transformational**

## Pending implications for downstream agents

| Agent | Implication | How to honor |
|---|---|---|
| Curator | Many legacy "rules" are VS Code-platform mechanics, not business rules (I1, I3). The `postMessage` bridge, hand-mirrored webview type contracts, and `acquireVsCodeApi` plumbing do not carry. | Separate behavior-level rules (FSM invariants, review/archive gates, retention caps, hook firing semantics — R-AC-*, R-CD-*, R-SP-*, R-HK-*) which MIGRATE, from platform mechanics (bridge/type-mirror/VS Code API) which are REPLACED/DISCARDED. Drop the legacy `devin` module (confidence-report Q1). |
| Strategist | The transformational core and top risk (effort/scope) is the native UI rewrite, with **no JCEF fallback** (I2). | Front-load the React Flow composer + Kanban + mermaid/markdown preview rebuild in the plan and risk register. Recommend vertical, per-bounded-context slices each delivered native end-to-end with behavioral parity. Register risks: Compose-for-Desktop/Jewel maturity, native graph-canvas effort, solo-dev capacity. |
| Designer | Architecture must be fully native IntelliJ; the bridge is gone (I1, I3, I4, I5). | Topology = native IntelliJ plugin module layout; replace the bridge with in-process service calls; map the 6 bounded contexts to `@Service` + extension points + tool windows + actions; render the 22 FSMs as Kotlin sealed-class state machines; async via coroutines; persistence via `PersistentStateComponent`/`PasswordSafe`; UI via Compose/Jewel. |
| Screen Translator | Native-UI decision means screens are **modernized** (React -> Compose), never literal (I2). | Mode = modernized (platform change). Translate each `page-registry` page (agent-chat, spec-explorer, hooks-view, orchestration, preview, welcome) to Compose/Jewel; capture golden files from the running VS Code webview where possible; log canvas-rendering deviations (native graph vs React Flow) explicitly. |
| Inspector | Implementation model changes fundamentally (React->Compose, bridge dropped, Promises->coroutines), so parity must be **behavioral, not structural** (I1-I4). | Parity specs assert observable behavior — FSM transitions/invariants, review/archive gates, retention caps, hook firing order/timing — and **not** implementation shape. UI parity = flow/state equivalence, not widget-tree equivalence. |

## Notes

- The coding agent must treat this as a **greenfield rewrite on the IntelliJ Platform from the specs**, not a TS->Kotlin transpilation (consistent with `migration_brief.md`).
- The biggest single risk under this decision is rebuilding the interactive graph/Kanban surfaces natively, because Option 1 deliberately removes the JCEF escape hatch. If effort proves prohibitive mid-migration, the only paradigm-preserving fallback is to re-open this decision toward Option 3 (Hybrid) for those specific screens.
- No database in the legacy means no runtime data migration; the Designer's `data_migration_plan.md` will be minimal (state-shape mapping only).
