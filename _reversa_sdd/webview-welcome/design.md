# webview-welcome (module), Design Técnico

> Module-level `design.md`. Source: `ui/src/features/welcome/`. Confidence: 🟢 unless noted.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `WelcomeScreen` | `()` | JSX | page + bridge — `welcome-screen.tsx:70` |
| `ErrorBoundary` | class | JSX | used by page-registry — `:29` |
| `useWelcomeStore` | Zustand hook | store | `stores/welcome-store.ts:75` |
| `computeRequirementProfile` | `(ideHost, deps)` | profile | `requirements.ts:89` |

## Tipos (`types.ts`, 278 LOC)

`IdeHost` (8), `DependencyStatus`, `ConfigurationState`, `SystemDiagnostic`, `LearningResource`, `FeatureAction`, message + props types. 🟢

## Fluxo Principal (visão de módulo)

1. **Lifecycle** — single-init → ready → state → section render. 🟢 (→ `welcome-lifecycle/`)
2. **Setup actions** — install/refresh/feature/config/learn fire-and-forget to host. 🟢 (→ `setup-actions/`)
3. **Profile** — host-aware required/optional/hidden/missing. 🟢 (→ `requirement-profile/`)

## State machine (Zustand store §5)

`uninitialized → loading → ready | errored` (`initialize` → `setState`/`setError`); `reset` → uninitialized; `errored → loading` on re-init. Diagnostics capped at 5 (newest first). 🟢

## Dependências

- `webview-shared` (`@/bridge/vscode`, `utils/relative-time`). Crosses to extension welcome/steering services. 🟢
- External: `zustand`, `react`, `@vscode/codicons`. 🟢
- ⚠️ Mirror: `requirements.ts` duplicates `src/services/welcome/requirements.ts` (parity test guards). 🟡

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Zustand store (the only webview module using it) | `welcome-store.ts:75` | 🟢 |
| StrictMode-safe single init + ErrorBoundary | `welcome-screen.tsx:29,98` | 🟢 |
| Host-aware requirement profile (pure) | `requirements.ts:89` | 🟢 |
| Mirror of extension requirements (parity-tested) | `requirements.ts` | 🟡 (intentional, not drift) |

## Estado Interno

Zustand store: `currentView`, config, deps, diagnostics (≤5), versions, loading/error, preferences. 🟢

## Observabilidade

Diagnostics list (≤5); install-progress state. 🟢

## Riscos e Lacunas

- 🟡 Hardcoded fallback versions (`0.25.6` / `1.84.0`) are placeholders overwritten by the extension at init.
- 🟡 The `requirements.ts` mirror must stay in sync with the extension copy (parity test exists — unlike the `webview-spec-explorer` drift, this one is intentional).
