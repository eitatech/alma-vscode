# task-parser, Design Técnico

> HOW the parser works. Source: `task-parser.ts` (372), `flowcharts/utils.md` §2.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `parseTasksContent` | `(content)` | `TaskGroup[]` | `:89` |

## Fluxo Principal (§2)

Per line:
1. phase header (not in denylist)? → `finalizeTask` + start new group. 🟢
2. inline `- [x] T### ...`? → `finalizeTask` + push inline task (checked ⇒ completed). 🟢
3. header `### T1.1: Title`? → `finalizeTask` + start `currentTask`. 🟢
4. inside `currentTask`? → collect content; track Acceptance Criteria checkboxes. 🟢

**finalizeTask:**
- acceptance items: all ✓ → completed; some → in-progress; none → not-started. 🟢
- explicit `**STATUS**` (COMPLETE/IN-PROGRESS) overrides. 🟢
- extract priority/complexity regex → push to group. 🟢

## Algorithm

Single pass with a `finalizeTask` closure; inline-vs-header dispatch; acceptance accumulation; STATUS/priority/complexity regex extraction. 🟢

## Dependências

- None beyond string parsing (consumed by `tasks` providers + `spec`/`devin`). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Dual-format support (inline + header) in one pass | `task-parser.ts:89` | 🟢 |
| Acceptance-ratio status with explicit override | `:118-124` | 🟢 |

## Estado Interno

`currentGroup`, `currentTask`, acceptance accumulator (during the pass). 🟢

## Observabilidade

None (pure function). 🟢

## Riscos e Lacunas

- 🟡 The phase-header denylist is heuristic; an unusual summary heading might be miscategorized.
