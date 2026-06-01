# execution-chain-guard, Design Técnico

> HOW chain safety works. Source: `hook-executor.ts:908-928`, `types.ts:515,565`, `flowcharts/hooks.md` §6.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `HookExecutor.createExecutionContext` | `()` | `ExecutionContext` | depth 0, empty set — `:908` |
| `HookExecutor.isCircularDependency` | `(hookId, ctx)` | `boolean` | `:920` |
| `HookExecutor.isMaxDepthExceeded` | `(ctx)` | `boolean` | `:927` |

### `ExecutionContext` (`types.ts:515`)
`{ executionId: string; chainDepth: number; executedHooks: Set<string>; startedAt: number }`

## Fluxo Principal (state machine §6)

1. `createExecutionContext` → root: `chainDepth=0`, `executedHooks={}`, fresh `executionId`. 🟢
2. `executeHook` adds `hookId` to `executedHooks` (running). 🟢
3. `isCircularDependency(hookId)` → if already in the set → `CircularDependencyError`. 🟢
4. `isMaxDepthExceeded` → if `chainDepth >= MAX_CHAIN_DEPTH(10)` → `MaxDepthExceededError`. 🟢
5. When a hook chains to another, the child runs with `chainDepth+1` and the inherited set. 🟢

## Dependências

- Used by the single-hook pipeline (`executeHook`). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Per-execution set + depth counter (not global) | `hook-executor.ts:908` | 🟢 |
| Hard depth cap of 10 | `types.ts:565` | 🟢 |

## Estado Interno

The `ExecutionContext` carried through a chain. 🟢

## Observabilidade

`chainDepth` is recorded in each `HookExecutionLog`. 🟢

## Riscos e Lacunas

- 🟡 Whether the cycle set is shared across `before`/`after` of the same operation is implementation detail — confirm in `hook-executor.ts:908`.
