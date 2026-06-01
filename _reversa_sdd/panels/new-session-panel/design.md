# new-session-panel, Design Técnico

> HOW the picker works. Source: `new-session-panel.ts` (296), `flowcharts/panels.md` §4.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `NewSessionPanel.open` | `()` | void | throws if disposed — `:103` |
| `NewSessionPanel.handleStart` | `(payload)` | void | onStart + dispose — `:193` |

## Fluxo Principal (§4)

1. `open`: disposed? → throw. panel exists? → reveal. else `createWebviewPanel` + stub HTML → subscribe `registryUpdateEvent` → `broadcastProviders` (`new-session/providers`). 🟢
2. webview `new-session/start`: `isStartPayload`? no → ignore; yes → `try { onStart(payload) } finally { dispose() }` (hand off to the real Agent Chat panel). 🟢

## Dependências

- `commands` (`NewSessionProviderItem`), the ACP provider registry update event, `NewSessionPanelDeps` (DI). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Self-disposal handoff (`try/finally`) | `new-session-panel.ts:199-204` | 🟢 |
| Stub HTML (real picker elsewhere) | `new-session-panel.ts` | 🟡 |

## Estado Interno

`disposed` flag, `panel`. 🟢

## Observabilidade

Provider list broadcast. 🟡

## Riscos e Lacunas

- 🟡 The stub HTML suggests the live picker may be the sidebar composer; confirm reachability (see `../questions.md`).
