# unmounted-prototypes, Design Técnico

> HOW the parked prototypes are built (for reference). Source: `components/{kanban,devin,cloud-agents}/*`, stores, `flowcharts/webview-orchestration.md` §4–§5.

## Reachability map (§4)

| Component | Reachable? | Note |
|-----------|------------|------|
| `orchestration` page | ✅ | live |
| `workflow-composer` page | ✅ | live |
| `KanbanBoard` | ❌ | no importer |
| `DevinProgressView` + `devinStore` | ❌ | page `devin-progress` not in registry |
| `CloudAgentProgressView` + `createCloudAgentStore` | ❌ | page `cloud-agent-progress` not in registry; "replaces Devin panel" |

Supersession: `DevinProgressView → CloudAgentProgressView → orchestration page`. 🟢

## Kanban grouping (§5)

`tasks.filter(t => t.execution?.state === column.state)` per fixed column (queued/ready/running/blocked/completed/failed). Card shows title, priority badge, `source.system`, `suggestedRole`, started/completed times, `dependsOn` blockers, errorMessage, intent. Click/Enter/Space → `onTaskClick`. 🟢

## Store patterns

- `devinStore`: singleton + `useSyncExternalStore`. 🟢
- `createCloudAgentStore`: factory subscribe/notify. 🟢
(Two distinct patterns — a consolidation candidate.)

## Dependências

- ⚠️ `kanban-board.tsx` imports from `src/features/tasks/task-model` (compile-time). 🔴
- `@xyflow/react` not used here. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Layered supersession left earlier prototypes in the tree | `cloud-agent-progress-panel.ts:5` | 🔴 (debt) |

## Estado Interno

Legacy stores hold session lists. 🟢

## Observabilidade

N/A (unmounted). 🟡

## Riscos e Lacunas

- 🔴 Dead code: no importer / missing page-registry entries. A reimplementation should either wire (register pages + importer) or drop these. See `../questions.md`.
- 🔴 `src/` import in `kanban-board.tsx` (R-X-6 violation).
