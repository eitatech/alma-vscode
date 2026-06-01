# resolve-and-dispatch, Design Técnico

> HOW resolution + dispatch work. Source: `task-service.ts` (72), `flowcharts/tasks.md` §1.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `TaskService.getTasksForSpec` | `(specId)` | `Promise<NormalizedTask[]>` | `:23` |
| `TaskService.getTasksFromFile` | `(specId, filePath)` | `Promise<NormalizedTask[]>` | `:38` |

## Fluxo Principal (§1)

1. `getTasksForSpec(specId)` → `SpecSystemAdapter.getSpecFiles(specId)` → tasks path. 🟢
2. No path → return empty. 🟢
3. `getTasksFromFile(specId, path)` → find provider where `canHandle(path)`. 🟢
4. No provider → single `isUnsupported` placeholder. 🟢
5. `provider.getTasks` → `parseTasksFromFile` (utils): throws → "Failed to parse" placeholder; empty → empty; groups → `normalizeGroups`. 🟢

## Dependências

- `utils/spec-kit-adapter` (path resolution), `utils/task-parser` (parse), the registered providers. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| First-match provider dispatch | `task-service.ts:38` | 🟢 |
| Placeholder/empty degradation (never throw to the caller) | `task-service.ts:44-58` | 🟢 |

## Estado Interno

None (uses the service's provider registry). 🟢

## Observabilidade

Placeholders are visible in the board; failures surfaced there. 🟡

## Riscos e Lacunas

None. 🟢
