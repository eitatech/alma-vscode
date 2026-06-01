# task-parser (use-case)

> Use-case under `utils`. Dual-format `tasks.md` parser → `TaskGroup[]`.
> Source: `task-parser.ts`, `flowcharts/utils.md` §2.

## Visão Geral

Parses `tasks.md` in a single pass into `TaskGroup[]`, handling both inline `- [x] T### ...` tasks and header-style `### T1.1: Title` tasks, deriving status from acceptance-criteria ratio (overridable by an explicit `**STATUS**` marker), and extracting priority/complexity. 🟢

## Responsabilidades

- Detect phase-group headers (excluding a denylist) and start groups. 🟢
- Parse inline tasks (`- [x] T###` checked ⇒ completed). 🟢
- Parse header tasks; accumulate acceptance-criteria checkboxes. 🟢
- Finalize each task: status from ratio or `**STATUS**`; extract priority/complexity. 🟢

## Regras de Negócio

- Status: all acceptance ✓ ⇒ completed; some ⇒ in-progress; none ⇒ not-started; `**STATUS**` overrides. 🟢 `task-parser.ts:118-124,151-168`
- Inline `- [x] T###` checked ⇒ completed. 🟢 `flowcharts/utils.md` §2
- Phase headers in a denylist (summary/meta) are excluded. 🟢 `task-parser.ts:151-168`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Group detection | Must | non-denylist phase headers start new groups |
| RF-02 | Inline tasks | Must | `- [x] T###` → completed; `- [ ]` → derived |
| RF-03 | Header tasks | Must | `### T1.1: Title` → task; acceptance criteria collected |
| RF-04 | Status finalize | Must | ratio-based + `**STATUS**` override |
| RF-05 | Metadata | Should | priority/complexity extracted via regex |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Single-pass parse with a `finalizeTask` closure | `task-parser.ts:89` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma task header com 2 de 3 critérios marcados
Quando finalizada
Então o status é in-progress (a menos que **STATUS** sobreponha)

Dado uma linha inline "- [x] T012 ..."
Quando parseada
Então a task é completed
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Detect + parse + finalize (RF-01–RF-04) | Must | Feeds the Kanban + loop via `tasks` module |
| Metadata (RF-05) | Should | Enriches the board |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `task-parser.ts` | `parseTasksContent` (89), finalize (118-124), denylist (151-168) | 🟢 |
