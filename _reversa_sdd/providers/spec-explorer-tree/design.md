# spec-explorer-tree, Design Técnico

> HOW the specs tree works. Source: `spec-explorer-provider.ts` (1235), `flowcharts/providers.md` §3.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `SpecExplorerProvider.getChildren` | `(element?)` | `SpecItem[]` | tree expansion — `:268` |
| `SpecExplorerProvider.refresh` | `()` | void | fires `onDidChangeTreeData` |

## Fluxo Principal (§3)

1. No workspace/specManager → empty. 🟢
2. root → 4 groups: Current / Review / Archived / Changes. 🟢
3. group-current → unified specs where state ∈ {none, current, reopened}. 🟢
4. group-review → state == review; group-archived → state == archived. 🟢
5. group-changes → `getActiveChangeRequests` → change-request items. 🟢
6. spec node → by system: speckit → `adapter.getSpecFiles` (requirements/design/tasks/checklist); openspec → openspec layout → per-file status icon via `task-parser`. 🟢

## Refresh (2 s debounce)

`FileSystemWatcher('**/specs/**/*.md')` + `onReviewFlowStateChange` → debounced `refresh` → `onDidChangeTreeData`. 🟢 `:38,63-76`

## Dependências

- `spec` (review-flow `getSpecState`, `SpecManager`), `utils/spec-kit-adapter`, `utils/task-parser`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Grouping mirrors the review-flow FSM buckets | `:304-329` | 🟢 |
| Debounced refresh from two event sources | `:63-76` | 🟢 |

## Estado Interno

A debounce timer; the `onDidChangeTreeData` emitter. 🟢

## Observabilidade

Tree refresh is the visible signal. 🟡

## Riscos e Lacunas

None notable. 🟢
