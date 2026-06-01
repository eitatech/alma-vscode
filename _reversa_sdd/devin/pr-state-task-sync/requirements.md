# pr-state-task-sync (use-case)

> Use-case under `devin`. PR-state change → `tasks.md` checkbox update.
> Source: `spec-status-updater.ts`, `pr-review-integration.ts`, `flowcharts/devin.md` §6.

## Visão Geral

When polling detects a PR transition to `merged`, the corresponding spec task checkbox in `tasks.md` is marked complete via an idempotent single write. 🟢

## Responsabilidades

- React to a `PrStateChangeEvent`. 🟢
- On `merged`: locate the `- [ ] TXXX` line for the spec task and rewrite it to `- [x]`. 🟢
- Persist `tasks.md` only if the content changed. 🟢
- On other states: record the new PR state only. 🟢

## Regras de Negócio

- **R-CD-12** A PR open→merged emits an event → marks the `tasks.md` checkbox (idempotent single write). 🟢 `devin-polling-service.ts:397`; `spec-status-updater.ts:91,140`
- Checkbox mutation regex `^(- \[)( )(\] <id>\b)` → `[x]` (idempotent). 🟢 `spec-status-updater.ts:140`
- PR review actions: `merged`/`closed` → `view` only; else review/approve/request-changes/merge (all currently open the browser). 🟡 `pr-review-integration.ts:35,106`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | React to PR-state change | Must | A `PrStateChangeEvent` is consumed |
| RF-02 | Mark task on merge | Must | `merged` → `markTaskAsCompleted(content, specTaskId)` rewrites the checkbox |
| RF-03 | Idempotent write | Must | Re-processing a merge does not double-write or corrupt the file |
| RF-04 | Conditional persist | Should | `workspace.fs.writeFile` only when content changed |
| RF-05 | Non-merge states | Should | record new PR state without touching `tasks.md` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Confiabilidade | Idempotent regex mutation guarantees safe re-runs | `spec-status-updater.ts:140` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um PR que passa de open para merged para a task T001
Quando o poll detecta a mudança
Então a linha "- [ ] T001" em tasks.md vira "- [x] T001" (escrita única, idempotente)

Dado um PR que passa para closed
Quando o poll detecta a mudança
Então apenas o estado do PR é registrado, sem alterar tasks.md
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Merge → checkbox (RF-01–RF-03) | Must | Closes the loop between Devin and the spec |
| Conditional persist + non-merge (RF-04, RF-05) | Should | Correctness/efficiency |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `spec-status-updater.ts` | `markTaskAsCompleted` (140), `updateSpecTaskStatusOnMerge` (91) | 🟢 |
| `devin-polling-service.ts` | PR-state change emit (397) | 🟢 |
| `pr-review-integration.ts` | PR actions (35,106) | 🟡 |
