# hook-load-migration, Design Técnico

> HOW migration works. Source: `hook-manager.ts:355,389-425`, `flowcharts/hooks.md` §5.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `HookManager.loadHooks` | `()` | `Hook[]` | load + migrate + filter — `:355` |
| `HookManager.migrateHook` | `(stored)` | `Hook` | in-place upgrade — `:389` |

## Fluxo Principal

1. `loadHooks` reads from `workspaceState` (`gatomia.hooks.configurations`). 🟢
2. For each stored hook → `migrateHook`:
   - `trigger` without `timing` → set `timing='after'`. 🟢
   - `trigger` without `events` → map to `events:[{type:'agent-operation', agent, operation, timing}]` + `schedule:{type:'immediate'}`. 🟢
   - MCP action with `agentId` and no `modelId` → rename `agentId`→`modelId`. 🟢
3. `isValidHook?` → keep; else log warning + skip. 🟢
4. `this.hooks = validHooks`. 🟢

## Fluxos Alternativos

- **Already-normalized hook:** passes through unchanged. 🟢

## Dependências

- `workspaceState` (Memento), `isValidHook`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| In-place idempotent migration on every load (no separate version stamp) | `hook-manager.ts:389` | 🟢 |

## Estado Interno

`this.hooks` populated with valid, migrated hooks. 🟢

## Observabilidade

Skipped invalid hooks logged with a warning. 🟢

## Riscos e Lacunas

- 🟡 Whether migration is re-persisted (write-back) or only applied in-memory each load — confirm in `hook-manager.ts:355`.
