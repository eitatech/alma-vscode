# status-fsm, Design Técnico

> HOW the FSM works. Source: `review-flow/state.ts:128-306`, `flowcharts/spec.md` §1.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `updateSpecStatus` | `(specId, newStatus)` | `Specification \| null` | `:271` |
| `validateStatusTransition` | `(from, to)` | `boolean` | table — `:128` |
| `normalizeStatus` | `(status)` | `SpecStatus` | alias map — `:146` |

## Fluxo Principal

1. `normalizeStatus(newStatus)` (and the current) — `readyToReview` → `review`. 🟢
2. `validateStatusTransition(from, to)` against the allowed-edge table. 🟢
3. If invalid → reject (return null). 🟢
4. If valid → apply; on first `review` entry stamp `completedAt` + `reviewEnteredAt`; on `archived` stamp `archivedAt`. 🟢
5. Persist + fire change event + telemetry. 🟢

## Allowed transitions (table)

| From | To |
|------|----|
| current | review |
| review | reopened, archived, current |
| reopened | review |
| archived | reopened |

## Fluxos Alternativos

- **Self-transition / unknown status:** rejected by the table. 🟢

## Dependências

- Review-flow state store (Map + persistence); telemetry. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Explicit transition table (not ad-hoc conditionals) | `state.ts:135` | 🟢 |
| Legacy alias handled at normalization, not stored | `state.ts:146` | 🟢 |

## Estado Interno

The spec's `status` + timestamp fields. 🟢

## Observabilidade

Status-change telemetry per transition. 🟢

## Riscos e Lacunas

- 🟡 The `review → current` edge (forced exit) is driven by gating logic (see `send-to-review-gating` / R-SP-6), not a manual command.
