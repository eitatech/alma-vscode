---
schemaVersion: 1
generatedAt: 2026-06-07T20:32:17Z
reversa:
  version: "1.2.34"
kind: topology_decision
producedBy: designer
hash: "sha256:c470b3cf619edebaac4ea4cfbfb2e71d6d008f93a996c3783a3ff4a80a0553eb"
---

# Topology Decision

> Conscious decision about how to organize the new system: preserve the legacy topology, adopt a modern one, or apply a hybrid.
> Required reading for the Designer itself (to decompose bounded contexts) and for the coding agent (to create the folder tree).

## Detected legacy topology
- **Organizational pattern**: **Hybrid** — package-by-feature (feature-folder bounded contexts) for the domain, package-by-layer for cross-cutting infra, **physically split into two bundles** (extension host + webview) joined by a single `postMessage` bridge.
- **Confidence**: 🟢 CONFIRMED
- **Evidence**:
  - "Feature-folder bounded contexts under `src/features/*` mirrored by `ui/src/features/*`" — `architecture.md` §2 (Modularity). 🟢
  - Layer buckets for presentation/infra: `providers/` (22), `panels/` (8), `commands/` (4), `services/` (34), `utils/` (28) — `inventory.md` §3/§10. 🟢
  - Two-bundle split + single bridge: dual bundler (esbuild host / Vite webview), `postMessage` bridge (ADR-0003), Zustand state on the webview side — `dependencies.md` "Observations", `architecture.md` §2. 🟢
- **Legacy tree map** (summarized):
  ```
  gatomia/ (VS Code extension, dual-build)
  ├── src/                      # extension host (esbuild, Node)
  │   ├── extension.ts          # activation; wires all providers/commands/services
  │   ├── features/             # package-by-feature (domain)
  │   │   ├── agent-chat/ agents/ cloud-agents/ devin/
  │   │   └── hooks/ orchestration/ spec/ steering/ tasks/
  │   ├── providers/ panels/ commands/         # package-by-layer (presentation)
  │   └── services/ utils/ prompts/ types/     # package-by-layer (infra/shared)
  └── ui/                       # webview SPA (Vite, browser)
      └── src/
          ├── features/         # mirrors host features (agent-chat, hooks-view, orchestration, preview, welcome)
          ├── components/ stores/ (Zustand) bridge/ lib/ services/
          └── page-registry.tsx # runtime page selection
  ── postMessage bridge ──      # the ONLY host<->ui channel (ADR-0003)
  ```

## Structural diagnosis
- **Coupling**: medium — feature folders are individually cohesive, but the two-bundle bridge introduces cross-bundle coupling and a hand-mirrored type contract that has already drifted (`domain.md` R-X-6 violation; gaps `D-8`).
- **Module cohesion**: high within `features/*`; medium for the large layer buckets `services/` (34) and `utils/` (28), which aggregate unrelated cross-cutting code.
- **Orphan / dead modules**: yes — unmounted Kanban/progress pages (gaps `D-6`/`D-7`), dead duplicate component trees (`D-9`), the redundant standalone `devin` path (`D-1`), and likely-stale `ts-loader`/`copy-webpack-plugin` build deps (`dependencies.md` obs).
- **Redundant layers**: markdown-rendering stack duplicated on both host and webview (`dependencies.md` obs); dual Devin polling path.
- **Boundary violations**: `webview-spec-explorer` imports `src/` types and acquires its own `acquireVsCodeApi()` (`window.specExplorerVscode`), violating the no-`src/` rule (R-X-6 / `D-8`).
- **Paradigm/style mix**: heterogeneous by design — OO-with-DI + event-driven host, reactive React/Zustand webview, joined by message-passing (the hybrid paradigm in `paradigm_decision.md`).
- **Overall assessment**: **partially problematic** — a healthy domain partition (feature folders) wrapped in a two-bundle bridge architecture that generated drift, duplication, and orphans. Crucially, the entire host/webview split exists **only to serve the bridge**, which `paradigm_decision.md` (Option 1) removes.

## Proposed modern topology
- **Pattern**: **Feature-sliced bounded contexts with a hexagonal (ports & adapters) seam per context**, delivered as a **single in-process IntelliJ plugin** with a shared `platform` foundation. Compose/Jewel UI lives **inside each context slice** (no separate UI bundle — the bridge is gone).
- **Justification**: This collapses the two-bundle split into one in-process artifact (honoring `paradigm_decision.md` I1), gives each bounded context an explicit port boundary (which Strategy A's incremental substitution and Strategy C's Parallel-Run isolation both want), and isolates the domain (FSMs/rules) from IntelliJ-platform adapters so the domain is **unit-testable headlessly** — essential for behavioral parity tests. It maps cleanly onto IntelliJ: each context = `@Service`s + extension points + a tool window; `platform` holds persistence/secrets/settings/telemetry/Git/ACP/provider SPI/MCP client.
- **Concrete expected gains**:
  - Headless, fast domain tests (parity-friendly) thanks to the hexagonal seam.
  - Incremental per-context build & release (matches Strategy A).
  - One type space — eliminates the bridge type-mirror drift class entirely (kills `D-8`/R-X-6).
- **Cost / risk**:
  - Hexagonal layering discipline + Kotlin/IntelliJ learning curve (RISK-007).
  - If taken to full Gradle multi-module, build ceremony is heavy for a solo dev — and a plugin ships as **one** artifact anyway, so multi-module yields compile-time boundaries but **not** independent deploy.
- **Proposed tree sketch** (full modern form):
  ```
  gatomia-intellij/ (Gradle IntelliJ plugin)
  ├── platform/   # @Service: persistence, secrets, settings, telemetry, git, acp, provider-spi, mcp-client
  ├── spec/       { domain/ (FSMs as sealed classes) , application/ (coroutines) , ui/ (Compose/Jewel) , infra/ (IntelliJ adapters) }
  ├── automation/ agents/ cloud/ orchestration/   # same hexagonal slice shape per context
  └── plugin.xml  # extension points, actions, tool windows
  ```

## Options presented to the user
1. **Preserve the legacy topology** (conservative)
   - Consequences: replicate feature-folders + a host/UI split. But the host/UI split is meaningless natively (no bridge), so it would force an **artificial seam** and perpetuate the drift-prone boundary. Lowest conceptual change, but fights the chosen paradigm and keeps structural debt.
2. **Adopt the modern proposal** (transformational)
   - Consequences: full feature-sliced + hexagonal, **Gradle multi-module**, single in-process plugin. Maximizes idiomaticity, testability, and clean boundaries; highest up-front ceremony for a solo dev (and multi-module gives compile-time isolation, not independent deploy, for a single plugin).
3. **Hybrid** (balanced) — **recommended**
   - Adopt the valuable modern parts: **feature-sliced packages** + a **hexagonal domain/infra seam per context** (keep this strict — it's what makes parity tests cheap), but **package it as a single Gradle module** (package-by-feature, no multi-module overhead). Promote a context to its own Gradle module only when it proves it needs it (Rule of Three).
   - Edges: *modern* domain/application/ui/infra separation per context; *pragmatic* single-module packaging instead of full multi-module. Preserves nothing structurally from the legacy two-bundle split (it's dropped), but preserves a low-ceremony build that fits solo capacity (RISK-006).
   - Tree sketch:
     ```
     gatomia-intellij/ (single Gradle module, package-by-feature)
     └── src/main/kotlin/dev/gatomia/
         ├── platform/   (persistence, secrets, settings, telemetry, git, acp, providers, mcp)
         ├── spec/       { domain/ , app/ , ui/ , infra/ }   # hexagonal-lite per feature
         ├── automation/ agents/ cloud/ orchestration/        # same shape
         └── GatomiaPlugin.kt + plugin.xml
     ```

## User decision
- **Choice**: **3 — Hybrid** (feature slices + a strict hexagonal domain/infra seam per context, packaged as a single Gradle module; promote a context to its own module only by the Rule of Three).
- **User justification**: Balances the native/idiomatic direction with solo-dev capacity (RISK-006): keeps the hexagonal seam strict where it pays (cheap headless parity tests) while avoiding Gradle multi-module ceremony that yields no independent-deploy benefit for a single-artifact plugin. The legacy two-bundle split is dropped regardless (the bridge is gone).
- **Decided at**: 2026-06-07T20:32:17Z

## Legacy -> new mapping
| Legacy module / folder | New bounded context | Type | Notes |
|---|---|---|---|
| `features/spec` + `steering` + `tasks` + `utils/spec-kit-*` | **spec** (Spec Lifecycle) | merged | One SDD-lifecycle context; task normalization folds in (R-SP-*). |
| `features/hooks` | **automation** | preserved (renamed) | Event engine (R-HK-*); embeds the own MCP client (AMB-004). |
| `features/agent-chat` + `agents` + `services/acp` | **agents** (Conversational Agents) | merged | Chat + `.agent.md` defs + ACP (R-AC-*); JetBrains AI Assistant host (AMB-005). |
| `features/cloud-agents` + `devin` | **cloud** (Cloud Delegation) | merged + pruned | `cloud-agents` canonical; standalone `devin` discarded (`discard_log.md` BR-DESCARTAR-004). |
| `features/orchestration` + Kanban view | **orchestration** (MAESTRO) | preserved | Aggregates the others (R-OR-*); heaviest native UI (AMB-002). |
| `providers/` + `panels/` + `commands/` + `ui/*` | (folded into each context's `ui/`+`infra/`) | dissolved / redistributed | No separate presentation bundle; each context owns its tool window + actions. |
| `services/` (cross-cutting) + `utils/` + `prompts/` | **platform** | merged | Shared foundation module. |
| `ui/` webview + `bridge/` + `page-registry` + type-mirror | (removed) | removed | Bridge dropped — `discard_log.md` BR-DESCARTAR-001/002/005. |

## Pending implications for the Designer's next steps
| Designer step | Implication | How to honor |
|---|---|---|
| Bounded contexts | Decomposition is **not 1:1** with the legacy 22 modules — it is **6** contexts (5 product + `platform`) via justified merges. | Document each context's cohesion/transaction rationale (step 8). |
| target_architecture | Single in-process plugin; no bridge; UI inside contexts. | Mermaid shows `platform` + 5 contexts + IntelliJ host + external integrations; "Honra ao paradigma" maps I1-I5; "Honra à topologia" renders the chosen tree. |
| target_domain_model | FSMs (22) + hook/orchestration triggers are the core. | Aggregates per context; FSMs as **sealed classes**; model domain events for the internally event-driven hooks/orchestration (R-HK/R-OR). |
| target_data_model | **No database** — state only. | Express `PersistentStateComponent` state classes + JSON/JSONL file shapes + `PasswordSafe` secrets; data-migration plan is state-shape mapping only (no ETL). |

## Notes
- The recommended Option 3 keeps the hexagonal domain seam strict (parity-test leverage) while avoiding multi-module build ceremony a solo dev doesn't need for a single-artifact plugin.
- Whichever option is chosen, the legacy host/webview **two-bundle split does not carry** — it was an artifact of the bridge that `paradigm_decision.md` removes.
