# welcome-lifecycle (use-case)

> Use-case under `webview-welcome`. mount → ready → state → section render (+ store FSM).
> Source: `welcome-screen.tsx`, `stores/welcome-store.ts`, `flowcharts/webview-welcome.md` §1–§2,§5.

## Visão Geral

On mount (guarded once), initializes the Zustand store (loading), posts `welcome/ready`, routes `welcome/*` messages, and renders nav + the current section — with loading/error UI. The store lifecycle is `uninitialized → loading → ready | errored`. 🟢

## Responsabilidades

- Single-init via `initializedRef`; `store.initialize` + `welcome/ready`. 🟢
- Route messages: `state`, `install-progress`, `diagnostic-added` (≤5), `error`. 🟢
- Render loading (2 s hint) / error banner / nav + section. 🟢
- Section nav: scroll + `welcome/navigate-section` + `setCurrentView`. 🟢

## Regras de Negócio

- Single-init guarded by `initializedRef` (StrictMode-safe). 🟢 `welcome-screen.tsx:98`
- `dontShowOnStartup` inverted for UI. 🟢 `welcome-screen.tsx:131`
- Diagnostics keep newest 5. 🟢 `welcome-store.ts:135`
- Store FSM: `uninitialized → loading → ready/errored`; `reset` → uninitialized. 🟢 `flowcharts/webview-welcome.md` §5

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Single-init + ready | Must | `initializedRef` guards; ready sent once |
| RF-02 | Message routing | Must | state/install-progress/diagnostic/error handled |
| RF-03 | Loading/error UI | Must | spinner + 2 s hint; error banner |
| RF-04 | Section nav + render | Must | scroll + `navigate-section`; 5 sections |
| RF-05 | Store FSM | Must | uninitialized→loading→ready/errored; reset |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Robustez | StrictMode-safe init + ErrorBoundary | `welcome-screen.tsx:29,98` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado StrictMode (mount duplo)
Quando WelcomeScreen inicializa
Então welcome/ready é enviado uma única vez (RF-01)

Dado um welcome/diagnostic-added
Quando processado
Então o diagnóstico é prepended e a lista cortada em 5 (RF-02)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| All (RF-01–RF-05) | Must | The screen bootstrap |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `welcome-screen.tsx` | `WelcomeScreen` (70), `ErrorBoundary` (29), init (98,117) | 🟢 |
| `stores/welcome-store.ts` | `useWelcomeStore` (75), diagnostics (135) | 🟢 |
