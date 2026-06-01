# trigger-matching-and-blocking, Design Técnico

> HOW matching + blocking work. Source: `hook-executor.ts:823-895`, `flowcharts/hooks.md` §3.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `HookExecutor.executeHooksForTrigger` | `(agent, operation, timing, event?)` | `Promise<ExecutionResult[]>` | `:823` |

## Fluxo Principal

1. `getAllHooks()`. 🟢
2. Filter: `enabled` AND (legacy `trigger` OR normalized `events`) match `agent` + `operation` + `timing`. 🟢 `:835`
3. Sort by `createdAt` (ascending, deterministic). 🟢 `:858`
4. For each matching hook:
   - if `timing=='before'` AND `waitForCompletion` → **blocking**: `await executeHook` before the agent operation proceeds. 🟢 `:873`
   - else → `await executeHook` (non-blocking semantics; see note). 🟢 `:884`
5. Push each result; return the array. 🟢

## Fluxos Alternativos

- **No matches:** return empty; the operation proceeds. 🟢

## Dependências

- `executeHook` (the pipeline), the hook store. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Deterministic `createdAt` ordering | `hook-executor.ts:858` | 🟢 |
| Blocking gated strictly to `before` + `waitForCompletion` | `hook-executor.ts:873` | 🟢 |

## Estado Interno

None beyond the shared `ExecutionContext` passed to each `executeHook`. 🟢

## Observabilidade

Per-hook results returned; individual logs via `executeHook`. 🟢

## Riscos e Lacunas

- 🟡 The "non-blocking" branch `await`s sequentially (`:884-895`); it is not truly parallel/fire-and-forget. Reimplementations should decide intended semantics.
