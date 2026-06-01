# workflow-composer (use-case)

> Use-case under `webview-orchestration`. The React Flow editor mapping hooks to an event→condition→schedule→action graph.
> Source: `features/workflow-composer/index.tsx`, `utils/mapper.ts`, `components/workflow-graph/*`, `flowcharts/webview-orchestration.md` §3.

## Visão Geral

Loads hooks via the (dual-keyed) hooks bridge, maps each into a deterministic React Flow node/edge chain (source events → conditions → schedule → action), and opens a side-panel `HookForm` when a hook node is clicked to create/edit. 🟢

## Responsabilidades

- `hooks/ready` + `hooks/list` (dual-keyed); ingest `hooks/sync`. 🟢
- `mapHooksToGraph` → nodes/edges; render React Flow with 4 custom node types. 🟢
- Node click with `data.hookId` → open `HookForm`; submit → create/update. 🟢
- Refresh graph on `hooks/sync` (not auto-closed on submit). 🟢

## Regras de Negócio

- Dual-keyed: `command = type.replace(/\//g,'.')`; read `type ?? command`, `payload ?? data`. 🟢 `workflow-composer/index.tsx:31,42`
- Layout: lane `y = hookIndex*150*3`; columns `x += 300`; schedule node skipped when `immediate`. 🟢 `mapper.ts:131,139,99`
- Composer not auto-closed on submit; `hooks/sync` refreshes. 🟢 `workflow-composer/index.tsx:87`
- Reuses `webview-hooks-view` `Hook` types + `HookForm` (cross-module coupling). 🟡

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Load hooks | Must | ready+list → `hooks/sync` → setHooks |
| RF-02 | Map to graph | Must | `mapHooksToGraph` → nodes/edges; 4 node types rendered |
| RF-03 | Node click → form | Must | node with `hookId` → side-panel HookForm |
| RF-04 | Submit | Must | editing → `hooks/update`; new → `hooks/create`; graph refreshes on sync |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Determinismo | Deterministic node layout | `mapper.ts:131` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um hook com schedule immediate
Quando mapHooksToGraph roda
Então o nó de schedule é pulado e action conecta diretamente das conditions (RF-02)

Dado um nó de hook clicado
Quando data.hookId existe
Então o HookForm abre no painel lateral (RF-03)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Load + map + click + submit (RF-01–RF-04) | Must | The composer surface |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `features/workflow-composer/index.tsx` | `WorkflowComposerFeature` (22), submit (87) | 🟢 |
| `utils/mapper.ts` | `mapHooksToGraph` (168), layout (99,131,139) | 🟢 |
| `components/workflow-graph/*` | `WorkflowGraph` (25) + node types | 🟢 |
