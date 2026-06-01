# webview-orchestration (module)

> Module-level `requirements.md`. Bounded context: **Orchestration (MAESTRO)** / presentation.
> Source: `ui/src/features/{orchestration,workflow-composer}/`, `ui/src/components/{workflow,workflow-graph,kanban,devin,cloud-agents}/`, `ui/src/stores/{devin-store,cloud-agent-store}.ts` (~3,200 LOC, ~30 files).
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`webview-orchestration` is the agent-orchestration / monitoring webview. Two **mounted** pages: `orchestration` (buckets active/recent local + cloud sessions into lanes) and `workflow-composer` (a React Flow editor mapping hooks into an event→condition→schedule→action graph). ⚠️ It is also a **prototype graveyard**: the Kanban board and legacy Devin/Cloud-Agent progress views are built but **not reachable** via `page-registry.tsx`. 🟢

## Responsabilidades

- Orchestration page: `ready` handshake → ingest `snapshot` → 4-bucket lanes → degraded empty-state → session actions. 🟢
- Composer: load hooks → `mapHooksToGraph` → React Flow → side-panel `HookForm`. 🟢
- (Unmounted) Kanban grouping + Devin/Cloud progress views + their stores. 🟢/🔴

## Regras de Negócio

- Orchestration buckets: `active`/`waiting`/`completed`/`failed`; sessions arrive pre-bucketed from the host snapshot. 🟢 `orchestration/index.tsx:60,106`
- Empty-state copy is a first-match decision tree over `degradedReasons` + provider availability. 🟢 `orchestration/index.tsx:112`
- Composer dual-keyed: `command = type.replace(/\//g,'.')`; read `type ?? command`, `payload ?? data`. 🟢 `workflow-composer/index.tsx:31,42`
- `mapHooksToGraph`: lane `y = hookIndex*150*3`; columns step `x += 300`; schedule node skipped when `immediate`. 🟢 `mapper.ts:131,139,99`
- Composer **not** auto-closed on submit; `hooks/sync` refreshes the graph. 🟢 `workflow-composer/index.tsx:87`
- Kanban: 6 fixed `ExecutionState` columns; card mocks timestamps/ownership when absent. 🟢 `kanban-board.tsx:23`
- 🔴 `KanbanBoard` has no importer (unmounted). 🔴 (grep: no consumers)
- 🔴 Panels request pages `devin-progress`/`cloud-agent-progress` **absent from `page-registry.tsx`** → "Unknown page". 🔴 `page-registry.tsx:52`
- ⚠️ `kanban-board.tsx` imports `NormalizedTask`/`ExecutionState` from `src/features/tasks/task-model` (compile-time coupling). 🔴

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Orchestration lanes | Must | ready → snapshot → 4 bucket lanes; session actions posted |
| RF-02 | Degraded empty-state | Must | first-match decision tree over degradedReasons/providers |
| RF-03 | Workflow composer | Must | hooks → graph; node click → HookForm; create/update |
| RF-04 | Graph mapping | Should | deterministic layout; immediate skips schedule node |
| RF-05 | (Unmounted) Kanban + progress | Won't (live) | logic exists but is not registered (see questions.md) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Resiliência | Snapshot fallback to EMPTY_SNAPSHOT; degraded messaging | `orchestration/index.tsx:60,112` | 🟢 |
| Determinismo | Graph layout is deterministic | `mapper.ts:131` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um snapshot com sessões em vários buckets
Quando a página renderiza
Então 4 lanes (active/waiting/completed/failed) são exibidas com contagens (RF-01)

Dado nenhuma sessão e degradedReasons de provider indisponível
Quando o empty-state é computado
Então "Cloud orchestration temporarily unavailable" com "Open Agent Chat" é mostrado (RF-02)

Dado hooks carregados no composer
Quando mapHooksToGraph roda
Então uma cadeia event→condition→(schedule)→action é renderizada (RF-03, RF-04)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Lanes + empty-state + composer (RF-01–RF-04) | Must | The live surfaces |
| Unmounted prototypes (RF-05) | Won't (until wired) | Dead/parked code (see questions.md) |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `features/orchestration/index.tsx` | `OrchestrationFeature` (79) | 🟢 |
| `features/workflow-composer/index.tsx` | `WorkflowComposerFeature` (22) | 🟢 |
| `features/workflow-composer/utils/mapper.ts` | `mapHooksToGraph` (168) | 🟢 |
| `components/workflow-graph/*` | `WorkflowGraph` (25) + node types | 🟢 |
| `components/kanban/*` | `KanbanBoard` (13) | 🟢 (unmounted) |
| `components/{devin,cloud-agents}/*` + stores | progress views | 🟢 (unmounted) |

> See `questions.md` for the 🔴 unmounted prototypes + missing-page-registry gap.
