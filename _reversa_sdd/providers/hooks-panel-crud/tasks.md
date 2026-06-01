# hooks-panel-crud, Tarefas de Implementação

## Pré-requisitos

- [ ] `hooks` `HookManager` + `HookExecutor` + MCP discovery
- [ ] The `webview-hooks-view` SPA

## Tarefas

- [ ] T-01, Implement the readiness gate (buffer → flush)
  - Origem no legado: `hook-view-provider.ts:322-323,429-433`
  - Critério de pronto: outbound buffered until `hooks.ready`, then flushed + sync
  - Confiança: 🟢

- [ ] T-02, Implement CRUD/logs/discovery routing
  - Origem no legado: `hook-view-provider.ts:401`
  - Critério de pronto: create/update/delete/toggle → HookManager → hooks.sync; logs; discovery
  - Confiança: 🟢

- [ ] T-03, Implement executor status mirroring
  - Origem no legado: `hook-view-provider.ts:347-371`
  - Critério de pronto: started/completed/failed → per-hook badge
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Outbound buffered until ready (RF-01)
- [ ] TT-02, Create → hooks.sync (RF-02)
- [ ] TT-03, Executor event → status badge (RF-04)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
