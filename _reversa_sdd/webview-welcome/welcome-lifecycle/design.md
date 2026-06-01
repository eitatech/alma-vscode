# welcome-lifecycle, Design Técnico

> HOW the screen boots. Source: `welcome-screen.tsx`, `stores/welcome-store.ts`, `flowcharts/webview-welcome.md` §1–§2,§5.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `WelcomeScreen` | `()` | JSX | `:70` |
| `ErrorBoundary` | class | JSX | `:29` |
| store: `initialize` / `setState` / `setError` / `reset` | lifecycle | — | `welcome-store.ts` |

## Fluxo Principal (§1)

1. mount → `initializedRef` already true? → skip. else set true → `store.initialize` (loading=true) → `postMessage welcome/ready` → `addEventListener`. 🟢
2. message: `welcome/state` → `setState` (+ `dontShowOnStartup = !msg.dontShowOnStartup`); `install-progress started/finished` → `setIsInstallingAll`; `diagnostic-added` → prepend + slice(0,5); `error` → console.error; default → console.warn. 🟢
3. loading? → spinner (2 s "taking longer"); error → banner; ok → nav + currentView section. 🟢

## Section nav (§2)

nav click → `scrollToSection` → `setCurrentView` → `postMessage welcome/navigate-section` + `contentRef.scrollTo` → render section (setup/features/config/status/learning). 🟢

## Store FSM (§5)

`uninitialized → loading` (initialize) `→ ready` (setState) / `errored` (setError); `ready → uninitialized` (reset); `errored → loading` (re-init). 🟢

## Dependências

- `webview-shared` bridge; `zustand`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| `initializedRef` for StrictMode safety | `welcome-screen.tsx:98` | 🟢 |
| ErrorBoundary exported for page-registry | `:29` | 🟢 |

## Estado Interno

Zustand store + local `isInstallingAll`/`isRefreshing`/`currentView`. 🟢

## Observabilidade

Diagnostics list; error console. 🟡

## Riscos e Lacunas

- 🟡 Hardcoded fallback versions are placeholders until the extension sends `welcome/state`.
