# spec-explorer-tree (use-case)

> Use-case under `providers`. The Specs sidebar tree view.
> Source: `spec-explorer-provider.ts`, `flowcharts/providers.md` §3.

## Visão Geral

A `TreeDataProvider` for the Specs view: 4 root groups (Current / Review / Archived / Changes), spec → requirements/design/tasks/checklist children with task-progress icons, grouped by review-flow status, refreshed (2 s debounce) on spec-file or review-flow changes. 🟢

## Responsabilidades

- Build the 4 root groups; filter unified specs by review-flow status. 🟢
- Expand a spec node to its files (per SDD system) with task-status icons. 🟢
- List active change requests under "Changes". 🟢
- Refresh on `**/specs/**/*.md` changes + review-flow state changes (2 s debounce). 🟢

## Regras de Negócio

- Grouping from review-flow status: `current/reopened`⇒Current, `review`⇒Review, `archived`⇒Archived; no status ⇒ Current. 🟢 `spec-explorer-provider.ts:304-329`
- Refresh debounced 2 s. 🟢 `spec-explorer-provider.ts:38,63-76`
- Per-file status icon derived via `task-parser`. 🟢 `flowcharts/providers.md` §3

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Root groups | Must | Current / Review / Archived / Changes |
| RF-02 | Status filtering | Must | specs filtered into groups by review-flow status (none⇒Current) |
| RF-03 | Spec expansion | Must | speckit → requirements/design/tasks/checklist; openspec layout |
| RF-04 | Task icons | Should | per-file status icon from task-parser |
| RF-05 | Debounced refresh | Must | spec-file or review-flow change → refresh after 2 s |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Responsividade | 2 s debounce prevents refresh storms on rapid edits | `spec-explorer-provider.ts:38` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado specs em vários estados de review-flow
Quando a árvore expande a raiz
Então aparecem 4 grupos e os specs caem no grupo correto pelo status (RF-02)

Dado uma edição em specs/NNN/spec.md
Quando ocorre
Então a árvore atualiza após 2s (RF-05)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Groups + filtering + expansion + refresh (RF-01–RF-03, RF-05) | Must | The specs view |
| Task icons (RF-04) | Should | Visual progress |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `spec-explorer-provider.ts` | `getChildren` (268), grouping (304-329), watcher/debounce (38,63-76) | 🟢 |
