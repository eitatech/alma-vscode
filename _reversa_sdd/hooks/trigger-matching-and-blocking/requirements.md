# trigger-matching-and-blocking (use-case)

> Use-case under `hooks`. Select matching hooks for a trigger and decide blocking vs non-blocking.
> Source: `hook-executor.ts`, `flowcharts/hooks.md` §3.

## Visão Geral

Given a fired trigger `(agent, operation, timing)`, selects all enabled hooks that match (legacy `trigger` or normalized `events`), sorts them deterministically by `createdAt`, and executes them — blocking the agent operation only for `before` hooks marked `waitForCompletion`. 🟢

## Responsabilidades

- Filter enabled hooks matching `agent` + `operation` + `timing`. 🟢
- Sort matches by `createdAt` for deterministic order. 🟢
- For each: if `before` + `waitForCompletion` → block (await before proceeding); else await (non-blocking semantics). 🟢

## Regras de Negócio

- **R-HK-1** Match requires `agent` + `operation` + same `timing`; sorted by `createdAt`. 🟢 `hook-executor.ts:835-858`
- **R-HK-2** Blocking only when `timing="before"` AND `waitForCompletion`. 🟢 `hook-executor.ts:873-882`
- 🟡 Non-blocking branch is commented "parallel" but awaits sequentially. 🟡 `hook-executor.ts:884-895`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Match by agent+op+timing | Must | Only enabled hooks with the exact triple match (legacy or normalized) |
| RF-02 | Deterministic order | Must | Matches sorted by `createdAt` ascending (R-HK-1) |
| RF-03 | Blocking decision | Must | `before` + `waitForCompletion` blocks; otherwise non-blocking (R-HK-2) |
| RF-04 | Collect results | Should | Each `executeHook` result is collected and returned |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Determinismo | `createdAt` ordering makes multi-hook firing reproducible | `hook-executor.ts:858` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado dois hooks habilitados que casam (speckit, plan, after), criados em t1<t2
Quando o trigger dispara
Então eles executam na ordem t1 depois t2 (R-HK-1)

Dado um hook (before, waitForCompletion=true)
Quando o trigger dispara
Então a operação aguarda o hook concluir antes de prosseguir (R-HK-2)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Match + order + blocking (RF-01–RF-03) | Must | Determines which/when hooks run |
| Result collection (RF-04) | Should | Reporting |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `hook-executor.ts` | `executeHooksForTrigger` (823, match 835-858, blocking 873-882) | 🟢 |
