# claim-task (use-case)

> Use-case under `orchestration`. Eligibility gate before a task enters the autonomous loop.
> Source: `autonomous-agent-loop.ts`, `flowcharts/orchestration.md` §4.

## Visão Geral

Decides whether a `NormalizedTask` may be claimed for autonomous execution: rejects tasks already running/completed, and rejects a second concurrent task unless it is `parallelizable`. On success it clones the task, sets state `queued`, adds it to `activeTasks`, and emits a change. 🟢

## Responsabilidades

- Reject tasks whose `execution.state` is `running` or `completed`. 🟢
- Reject a new task when another is running, unless `execution.parallelizable`. 🟢
- Clone + set `queued` + add to `activeTasks` + fire `onDidChange`. 🟢

## Regras de Negócio

- **R-OR-3** `claimTask` rejects running/completed; rejects a second concurrent task unless `execution.parallelizable`. 🟢 `autonomous-agent-loop.ts:37-51`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Reject running/completed | Must | `claimTask` returns false for those states |
| RF-02 | Concurrency gate | Must | another running + not `parallelizable` → false |
| RF-03 | Claim success | Must | clone task, set `queued`, add to `activeTasks`, fire `onDidChange`, return true |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Determinismo | Eligibility is a pure function of execution state + parallelizable flag | `autonomous-agent-loop.ts:37` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma task com execution.state running
Quando claimTask é chamado
Então retorna false (R-OR-3)

Dado outra task running e uma task não-paralelizável
Quando claimTask é chamado
Então retorna false (R-OR-3)

Dado nenhuma task running
Quando claimTask é chamado para uma task ready
Então a task é clonada como queued, adicionada a activeTasks e retorna true
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Eligibility + claim (RF-01–RF-03) | Must | The entry gate to the loop |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `autonomous-agent-loop.ts` | `claimTask` (35,37-51) | 🟢 |
