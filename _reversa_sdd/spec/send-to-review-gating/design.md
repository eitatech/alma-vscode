# send-to-review-gating, Design Técnico

> HOW the review gate works. Source: `review-flow/state.ts:522-544,887-937`, `flowcharts/spec.md` §2.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `canSendToReview` | `(specId)` | `{ canSend: boolean; blockers: string[] }` | `:887` |
| `sendToReview` | `(specId)` | transition | `:937` |
| `sendToReviewWithTrigger` | `(specId, trigger)` | transition + event | `:657` |

## Fluxo Principal (§2)

1. Spec found? no → blocker "Spec not found". 🟢
2. Normalize status:
   - `review` → blocker "already in review". 🟢
   - not `current`/`reopened` → blocker "not in current status". 🟢
3. `pendingTasks > 0` → blocker "N pending tasks". 🟢
4. `pendingChecklistItems > 0` → blocker "N pending checklist items". 🟢
5. No blockers → `canSend=true` → `sendToReview` → `updateSpecStatus(review)`. 🟢

## Forced exit (R-SP-6)

When pending tasks/checklist appear while in `review`, the spec is forced out: `reopened` if blocking change requests exist, else `current`, with a warning. 🟢 `state.ts:522-544`

## Fluxos Alternativos

- **Multiple blockers:** all accumulated and returned together. 🟢

## Dependências

- The FSM (`updateSpecStatus`), the spec's pending counts, telemetry. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Blocker accumulation (return all reasons, not first-fail) | `state.ts:887-929` | 🟢 |

## Estado Interno

Reads the spec's `status`, `pendingTasks`, `pendingChecklistItems`. 🟢

## Observabilidade

Review-transition telemetry (manual/auto). 🟢

## Riscos e Lacunas

- 🟡 Source of `pendingTasks`/`pendingChecklistItems` counts (who updates them) is upstream — confirm caller wiring.
