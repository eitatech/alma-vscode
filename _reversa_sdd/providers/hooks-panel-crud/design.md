# hooks-panel-crud, Design Técnico

> HOW the hooks panel works. Source: `hook-view-provider.ts` (1012), `flowcharts/providers.md` §4.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `HookViewProvider.initialize` | `()` | void | wires manager/executor mirrors — `:347` |
| `HookViewProvider.handleWebviewMessage` | `(msg)` | void | CRUD/logs/discovery router — `:401` |

## State machine (§4)

`not_ready` (panel created) → buffer outbound in `pendingMessages` → on `hooks.ready` → flush pending + statuses + sync → `ready`:
- `hooks.create/update/delete/toggle` → `HookManager` CRUD → `onHooksChanged` → `hooks.sync`. 🟢
- `hooks.logs` → `sendExecutionLogs`. 🟢
- `HookExecutor` `onStarted/Completed/Failed` → status cache → badge. 🟢
- `dispose` (panel closed) → `[*]`. 🟢

## Fluxo Principal

1. Panel created; `isWebviewReady=false`; outbound buffered. 🟢
2. Webview posts `hooks.ready` → flush `pendingMessages` + push statuses + `hooks.sync`. 🟢
3. Inbound messages routed (CRUD → manager; logs → sender; discovery → MCP/agents). 🟢
4. Executor events update a per-hook status cache → badge. 🟢

## Dependências

- `hooks` (`HookManager`, `HookExecutor`, MCP discovery, agent listing). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Buffer-until-ready message gate | `hook-view-provider.ts:322` | 🟢 |
| Status badges mirrored from executor events (not polled) | `:347-371` | 🟢 |

## Estado Interno

`pendingMessages` buffer, `isWebviewReady`, per-hook status cache. 🟢

## Observabilidade

Status badges; execution logs on demand. 🟢

## Riscos e Lacunas

- 🟡 This panel and `webview-hooks-view` share a dual-keyed message convention (see that module).
