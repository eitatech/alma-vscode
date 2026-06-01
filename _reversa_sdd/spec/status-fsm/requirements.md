# status-fsm (use-case)

> Use-case under `spec`. The spec status finite-state machine.
> Source: `review-flow/state.ts`, `flowcharts/spec.md` §1.

## Visão Geral

Validates and applies spec status transitions, normalizes the legacy `readyToReview` alias to `review`, and stamps lifecycle timestamps on entry to `review`/`archived`. 🟢

## Responsabilidades

- Validate each transition against the allowed-transition table. 🟢
- Normalize `readyToReview` → `review`. 🟢
- Stamp `completedAt` + `reviewEnteredAt` on first `review` entry; `archivedAt` on `archived`. 🟢
- Reject invalid transitions. 🟢

## Regras de Negócio

- **R-SP-1** FSM validated; invalid rejected; `readyToReview` legacy alias → `review`. 🟢 `state.ts:135-151,287`
- **R-SP-3** review entry stamps `completedAt` + `reviewEnteredAt`; archived stamps `archivedAt`. 🟢 `state.ts:299-306`
- Allowed edges: `current→review`; `review→{reopened, archived, current}`; `reopened→review`; `archived→reopened`. 🟢 `flowcharts/spec.md` §1

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Transition validation | Must | `updateSpecStatus` applies only allowed edges; invalid → null/reject |
| RF-02 | Legacy normalization | Must | `readyToReview` treated as `review` (R-SP-1) |
| RF-03 | Timestamp stamping | Must | review/archived entries stamp correct dates (R-SP-3) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Confiabilidade | Transition table is the single source of FSM truth | `state.ts:135` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um spec em current
Quando updateSpecStatus(review) é chamado
Então a transição é aceita e completedAt + reviewEnteredAt são carimbados (R-SP-3)

Dado um spec em current
Quando updateSpecStatus(archived) é chamado diretamente
Então a transição é rejeitada (aresta inválida) (R-SP-1)

Dado um status persistido readyToReview
Quando normalizado
Então é tratado como review (R-SP-1)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Validation + normalization + stamping (RF-01–RF-03) | Must | The integrity of the lifecycle |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `review-flow/state.ts` | `updateSpecStatus` (271), `validateStatusTransition` (128), `normalizeStatus` (146) | 🟢 |
