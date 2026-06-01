# unmounted-prototypes (use-case)

> Use-case under `webview-orchestration`. Documents the built-but-unreachable Kanban board + legacy progress views. 🔴
> Source: `components/kanban/*`, `components/{devin,cloud-agents}/*`, `stores/{devin,cloud-agent}-store.ts`, `flowcharts/webview-orchestration.md` §4–§5.

## Visão Geral

This use-case captures **dead/parked** UI: the Kanban board (groups tasks by `execution.state` into 6 columns) and the legacy Devin / Cloud-Agent progress views (+ their stores). The Kanban board has no importer, and the progress pages (`devin-progress`, `cloud-agent-progress`) are **absent from `page-registry.tsx`** — panels requesting them render "Unknown page". 🔴

> Documented for fidelity and to inform the reimplementation decision (keep + wire, or remove). Not a live behavior.

## Responsabilidades (as built)

- Kanban: group `NormalizedTask[]` by `execution.state` into 6 columns; card shows title/priority/source/role/times/deps/error/intent; click → host. 🟢
- DevinProgressView + `devinStore` (singleton + `useSyncExternalStore`). 🟢
- CloudAgentProgressView + `createCloudAgentStore` (factory subscribe/notify). 🟢

## Regras de Negócio

- Kanban: 6 fixed `ExecutionState` columns (queued/ready/running/blocked/completed/failed); card mocks timestamps/ownership when absent. 🟢 `kanban-board.tsx:23`; `kanban-card.tsx:13`
- 🔴 `KanbanBoard` has **no importer** in `ui/src`/`src` — unmounted. 🔴
- 🔴 Panels request pages `devin-progress`/`cloud-agent-progress` **absent from `page-registry.tsx`** → "Unknown page". 🔴 `page-registry.tsx:52`
- ⚠️ `kanban-board.tsx` imports `NormalizedTask`/`ExecutionState` from `src/features/tasks/task-model` (R-X-6 violation). 🔴
- Lineage: Devin (spec 001) → Cloud-Agent (spec 016) → orchestration page (spec 018-era). 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Kanban grouping (as built) | Won't (live) | filters tasks by `execution.state` into 6 columns |
| RF-02 | Progress views (as built) | Won't (live) | render session status from the legacy stores |
| RF-03 | Wiring decision | Must | EITHER register the pages + importer, OR remove as dead code (see `questions.md`) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Dívida técnica | Built code with no live entry point bloats the bundle | `flowcharts/webview-orchestration.md` §4 | 🔴 |

## Critérios de Aceitação

```gherkin
Dado um painel que solicita a página "devin-progress"
Quando a SPA tenta renderizá-la
Então "Unknown page" é exibido (página ausente do registry) (RF-03 — a resolver)

Dado tasks com vários execution.state
Quando KanbanBoard agrupa (se montado)
Então elas caem nas 6 colunas fixas (RF-01)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Wiring decision (RF-03) | Must | Resolve dead code before reimplementation |
| Kanban/progress behavior (RF-01, RF-02) | Won't (live) | Parked until wired |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `components/kanban/{kanban-board,kanban-column,kanban-card}.tsx` | grouping (unmounted) | 🟢 |
| `components/devin/*` + `stores/devin-store.ts` | legacy Devin progress | 🟢 |
| `components/cloud-agents/*` + `stores/cloud-agent-store.ts` | cloud progress | 🟢 |
| `page-registry.tsx:52` | missing page entries | 🔴 |

> See `../questions.md`.
