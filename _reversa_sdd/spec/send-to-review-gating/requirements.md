# send-to-review-gating (use-case)

> Use-case under `spec`. The gate that decides whether a spec may enter review (and forced-exit rules).
> Source: `review-flow/state.ts`, `flowcharts/spec.md` §2.

## Visão Geral

Computes whether a spec can be sent to review — it must be `current`/`reopened` with zero pending tasks and zero pending checklist items — accumulating human-readable blockers otherwise. Also handles forced exit from review when pending items appear. 🟢

## Responsabilidades

- Verify the spec exists and its normalized status is `current`/`reopened`. 🟢
- Reject if already in review, or if pending tasks/checklist > 0 (with counts). 🟢
- On pass, transition to `review`. 🟢
- Force exit from review (`reopened` if blockers else `current`) when pending items appear, with a warning. 🟢

## Regras de Negócio

- **R-SP-2** Gate: `current`/`reopened` + zero pending tasks AND checklist items. 🟢 `state.ts:887-929`
- **R-SP-6** Pending items during review → forced exit (`reopened`/`current`) + warning. 🟢 `state.ts:522-544`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Existence + status gate | Must | not found / wrong status → blocker |
| RF-02 | Pending-items gate | Must | pending tasks or checklist > 0 → blocker with count |
| RF-03 | Pass → transition | Must | no blockers → `sendToReview` → status `review` |
| RF-04 | Forced exit | Should | pending items during review → exit to reopened/current with warning (R-SP-6) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Usabilidade | Blockers are human-readable strings (counts included) | `state.ts:887-929` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um spec em current com 2 tarefas pendentes
Quando canSendToReview é chamado
Então retorna canSend=false com um blocker "2 pending tasks" (R-SP-2)

Dado um spec em current sem pendências
Quando sendToReview é chamado
Então o spec transiciona para review (R-SP-2)

Dado um spec em review onde surgem itens pendentes
Quando o estado é reavaliado
Então o spec sai de review para reopened (com blockers) ou current, com aviso (R-SP-6)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Gating + transition (RF-01–RF-03) | Must | Protects review integrity |
| Forced exit (RF-04) | Should | Keeps state consistent |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `review-flow/state.ts` | `canSendToReview` (887), `sendToReview` (937), forced-exit (522-544) | 🟢 |
