# open-for-session, Design Técnico

> HOW reopen works. Source: `agent-chat-commands.ts:284-313`, `flowcharts/commands.md` §2.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `handleOpenForSession` | `(idArg, deps)` | `Promise<void>` | `:284` |
| `coerceSessionIdArg` | `(arg)` | `sessionId \| undefined` | string \| TreeItemLike — `:708` |

## Fluxo Principal (§2)

1. `coerceSessionIdArg(arg)` → sessionId. 🟢
2. `session = registry.getSession(id)`; found? no → `session = store.getSession(id)`; store miss → return. 🟢
3. store hit → `registry.registerSession` (lazy hydrate T047). 🟢
4. `registry.focusPanel(id)`? yes → telemetry `PANEL_REOPENED` → return; no → `createPanel → attachPanel → reveal`. 🟢

## Dependências

- `agent-chat` registry/store, `panels` createPanel, telemetry. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Lazy registry hydration from the store (restart resilience) | `agent-chat-commands.ts:297-313` | 🟢 |
| focusPanel reuse enforces one-panel-per-session | `flowcharts/commands.md` §2 | 🟢 |

## Estado Interno

None (DI handler). 🟢

## Observabilidade

`PANEL_REOPENED` telemetry. 🟢

## Riscos e Lacunas

None. 🟢
