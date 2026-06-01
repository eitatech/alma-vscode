# hooks-panel-crud (use-case)

> Use-case under `providers`. The Hooks webview panel: readiness gate + CRUD + status mirror.
> Source: `hook-view-provider.ts`, `flowcharts/providers.md` §4.

## Visão Geral

Manages the Hooks webview panel (`gatomia.hooksPanel`): buffers outbound messages until the webview signals `hooks.ready`, then handles hook CRUD/toggle/list/logs, MCP discovery, and agent listing, mirroring `HookExecutor` started/completed/failed events into per-hook status badges. 🟢

## Responsabilidades

- Buffer outbound messages in `pendingMessages` until `hooks.ready`; flush on ready. 🟢
- Route CRUD/toggle/list/logs/discovery messages to `HookManager`/MCP. 🟢
- Mirror executor events (started/completed/failed) into a per-hook status cache. 🟢

## Regras de Negócio

- Messages buffered until `hooks.ready`, then flushed (+ statuses + sync). 🟢 `hook-view-provider.ts:322-323,429-433`
- Hook execution status mirrored from `HookExecutor` events into a per-hook cache. 🟢 `hook-view-provider.ts:347-371`
- CRUD delegates to `HookManager` (which validates + persists + emits `onHooksChanged` → `hooks.sync`). 🟢 `flowcharts/providers.md` §4

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Readiness gate | Must | outbound before ready buffered; flushed on `hooks.ready` |
| RF-02 | CRUD routing | Must | create/update/delete/toggle → `HookManager` → `hooks.sync` |
| RF-03 | Logs | Should | `hooks.logs` → `sendExecutionLogs` |
| RF-04 | Status mirror | Should | executor started/completed/failed → status badge |
| RF-05 | Discovery | Should | MCP discovery + agent listing surfaced |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Confiabilidade | Buffer-until-ready avoids lost messages on slow webview init | `hook-view-provider.ts:322` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado o painel criado mas o webview ainda não pronto
Quando uma mensagem é enviada
Então ela é bufferizada e entregue após hooks.ready (RF-01)

Dado o painel pronto
Quando o usuário cria um hook
Então HookManager persiste e hooks.sync atualiza a lista (RF-02)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Readiness + CRUD (RF-01, RF-02) | Must | The hooks management surface |
| Logs + status + discovery (RF-03–RF-05) | Should | Observability + authoring aids |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `hook-view-provider.ts` | `initialize` (347), `handleWebviewMessage` (401), buffer/flush (322,429) | 🟢 |
