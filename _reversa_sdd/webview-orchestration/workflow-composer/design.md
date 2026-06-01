# workflow-composer, Design Técnico

> HOW the composer works. Source: `features/workflow-composer/index.tsx`, `utils/mapper.ts`, `flowcharts/webview-orchestration.md` §3.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `WorkflowComposerFeature` | `()` | JSX | `:22` |
| `mapHooksToGraph` | `(hooks)` | `{nodes, edges}` | `:168` |
| `WorkflowGraph` | props | JSX | ReactFlow + Background + Controls — `:25` |

## Fluxo Principal (§3)

1. mount → `postMessage hooks/ready + hooks/list` (dual-keyed). 🟢
2. `hooks/sync | hooks.sync` → `setHooks(payload.hooks)` → `mapHooksToGraph` → `setNodes`/`setEdges`. 🟢
3. ReactFlow renders custom node types (Source/Condition/Schedule/Action). 🟢
4. `onNodeClick` with `data.hookId` → `setSelectedHookId` → side-panel `HookForm`. 🟢
5. `HookForm` submit: `selectedHookId` set → `hooks/update`; new → `hooks/create`. Graph refreshes on next `hooks/sync`. 🟢

## mapHooksToGraph layout

per hook: lane `y = hookIndex*150*3` → `processEvents` (source node per event, x=100) → `processConditions` (x+=300, chain from prev ids) → `processSchedule` (skip if immediate, else x+=300) → action node at final x; `connectEdges` fan-in from prev ids. 🟢

## Dependências

- `webview-shared` bridge; `webview-hooks-view` (`Hook` types + `HookForm`); `@xyflow/react`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Deterministic per-hook lane layout | `mapper.ts:131` | 🟢 |
| Schedule node omitted for immediate | `mapper.ts:99` | 🟢 |
| Reuse hooks-view HookForm (cross-module) | `workflow-composer/index.tsx` | 🟡 |

## Estado Interno

`hooks`, `nodes`, `edges`, `selectedHookId`. 🟢

## Observabilidade

None beyond the graph. 🟡

## Riscos e Lacunas

- 🟡 Cross-module coupling to `webview-hooks-view` (shared `HookForm`/types).
