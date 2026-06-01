# execution-chain-guard (use-case)

> Use-case under `hooks`. Prevents infinite/cyclic hook chains.
> Source: `hook-executor.ts` (chain helpers), `flowcharts/hooks.md` §6.

## Visão Geral

When a hook's action triggers another hook (chaining), a per-execution context tracks which hooks have run (`executedHooks`) and how deep the chain is (`chainDepth`). Re-entering a hook raises a circular-dependency error; exceeding depth 10 raises a max-depth error. 🟢

## Responsabilidades

- Create a root `ExecutionContext` (depth 0, empty `executedHooks`) per trigger. 🟢
- Add each executing hook's id to `executedHooks`. 🟢
- Block re-entry of an already-executed hook (cycle). 🟢
- Block when `chainDepth >= MAX_CHAIN_DEPTH (10)`. 🟢
- Increment depth when a hook chains to another. 🟢

## Regras de Negócio

- **R-HK-3** Per-execution `executionId`, `executedHooks` set (circular block), `chainDepth` capped at `MAX_CHAIN_DEPTH=10`. 🟢 `types.ts:565`; `hook-executor.ts:920-928`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Root context creation | Must | `createExecutionContext` → depth 0, empty set, fresh `executionId` |
| RF-02 | Cycle detection | Must | `isCircularDependency(hookId)` true when id already in `executedHooks` → `CircularDependencyError` |
| RF-03 | Depth cap | Must | `isMaxDepthExceeded` true when `chainDepth >= 10` → `MaxDepthExceededError` |
| RF-04 | Depth increment on chain | Must | A chained hook runs with `depth+1` and the inherited `executedHooks` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Confiabilidade | Guards bound recursion and prevent infinite automation loops | `hook-executor.ts:920-928` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um hook A cuja ação dispara o hook A novamente
Quando a cadeia reentra A
Então CircularDependencyError é lançado e a cadeia para (R-HK-3)

Dado uma cadeia que encadeia 11 níveis
Quando o 11o nível é atingido
Então MaxDepthExceededError é lançado (chainDepth >= 10)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Cycle + depth guards (RF-01–RF-04) | Must | Safety-critical; prevents runaway automation |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `hook-executor.ts` | `createExecutionContext` (908), `isCircularDependency` (920), `isMaxDepthExceeded` (927) | 🟢 |
| `types.ts` | `ExecutionContext` (515), `MAX_CHAIN_DEPTH` (565) | 🟢 |
