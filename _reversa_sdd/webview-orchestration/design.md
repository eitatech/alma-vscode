# webview-orchestration (module), Design Técnico

> Module-level `design.md`. Source: see requirements. Confidence: 🟢 unless noted.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `OrchestrationFeature` | `()` | JSX | snapshot subscriber + lanes — `orchestration/index.tsx:79` |
| `WorkflowComposerFeature` | `()` | JSX | hooks-graph editor — `workflow-composer/index.tsx:22` |
| `mapHooksToGraph` | `(hooks)` | `{nodes, edges}` | `mapper.ts:168` |
| `WorkflowGraph` | props | JSX | ReactFlow wrapper — `workflow-graph.tsx:25` |
| `KanbanBoard` | `(tasks)` | JSX | unmounted — `kanban-board.tsx:13` |
| `createCloudAgentStore` / `devinStore` | stores | store | two patterns — `:83/108` |

## Live vs dead

| Page | Registered? | Source |
|------|-------------|--------|
| `orchestration` | ✅ | host `orchestration-view-provider` |
| `workflow-composer` | ✅ | composer page |
| Kanban board | ❌ no importer | `components/kanban/*` |
| `devin-progress` page | ❌ not in registry | requested by `devin-progress-panel` |
| `cloud-agent-progress` page | ❌ not in registry | requested by `cloud-agent-progress-panel` |

## Fluxo Principal (visão de módulo)

1. **Orchestration** — ready → snapshot → buckets → lanes / empty-state. 🟢 (→ `orchestration-lanes/`)
2. **Composer** — hooks → graph → HookForm → create/update. 🟢 (→ `workflow-composer/`)
3. **Unmounted** — Kanban + progress views exist but are unreachable. 🔴 (→ `unmounted-prototypes/`)

## State machines

No FSM in live surfaces. Orchestration = snapshot→bucket projection; composer = React Flow change-event driven; legacy stores project session status. See `flowcharts/webview-orchestration.md` §1–§5. 🟢

## Dependências

- `webview-shared` (`@/bridge/vscode`, `components/ui/button`, `components/workflow`), `webview-hooks-view` (`Hook` types + `HookForm` in the composer). Crosses to extension `orchestration`/`tasks`/`cloud-agents`/`devin`. 🟢
- ⚠️ Compile-time: `kanban-board.tsx` imports from `src/features/tasks/task-model`. 🔴
- External: `@xyflow/react` (React Flow), `react`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Snapshot-driven bucket lanes (host pre-buckets) | `orchestration/index.tsx:60` | 🟢 |
| Deterministic hook→graph layout | `mapper.ts:131` | 🟢 |
| Two distinct store patterns (singleton vs factory) for legacy progress | `devin-store.ts:108`; `cloud-agent-store.ts:83` | 🟢 |
| ⚠️ Layered prototype graveyard (Devin → Cloud → orchestration) | `cloud-agent-progress-panel.ts:5` | 🔴 |

## Estado Interno

Orchestration: `snapshot`, `isLoading`. Composer: `hooks`, `nodes`, `edges`, `selectedHookId`. Legacy stores: session lists. 🟢

## Observabilidade

Degraded-mode empty-state messaging. 🟡

## Riscos e Lacunas

- 🔴 Unmounted Kanban (no importer) + `devin-progress`/`cloud-agent-progress` pages missing from `page-registry.tsx` (panels render "Unknown page"). See `questions.md`.
- 🔴 `kanban-board.tsx` imports from `src/` (R-X-6 violation).
