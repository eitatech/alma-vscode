# resolve-and-dispatch (use-case)

> Use-case under `tasks`. Resolve a spec's tasks file and dispatch to the matching provider.
> Source: `task-service.ts`, `flowcharts/tasks.md` §1.

## Visão Geral

Resolves the `tasks.md` path for a spec via the spec adapter, then dispatches to the first provider that can handle the path, returning normalized tasks — with graceful placeholders when no provider matches or parsing fails. 🟢

## Responsabilidades

- `getTasksForSpec(specId)`: resolve the tasks path via `SpecSystemAdapter.getSpecFiles`; missing → empty. 🟢
- `getTasksFromFile(specId, filePath)`: find a `canHandle` provider; none → placeholder; else `getTasks`. 🟢
- Surface parse failures as a placeholder task. 🟢

## Regras de Negócio

- `getTasksForSpec` resolves via the adapter; missing tasks path → empty list. 🟢 `task-service.ts:23-33`
- No matching provider ⇒ single `isUnsupported` placeholder. 🟢 `task-service.ts:44-58`
- Parse failure ⇒ single "Failed to parse" placeholder. 🟢 `speckit-task-provider.ts:27-42`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Resolve path | Must | path resolved via adapter; missing → empty list |
| RF-02 | Dispatch to provider | Must | first `canHandle` provider handles the file |
| RF-03 | Unsupported fallback | Must | no provider → single `isUnsupported` placeholder |
| RF-04 | Parse-failure fallback | Must | parse throw → single placeholder, no exception |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Resiliência | All failure modes degrade to a placeholder/empty, never throw | `task-service.ts:44-58` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um spec com tasks.md resolvível em specs/
Quando getTasksForSpec é chamado
Então o SpecKit provider processa e retorna NormalizedTask[]

Dado um filePath sem provider correspondente
Quando getTasksFromFile é chamado
Então retorna uma única task isUnsupported (sem exceção)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| All (RF-01–RF-04) | Must | The dispatch entry point |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `task-service.ts` | `getTasksForSpec` (23), `getTasksFromFile` (38) | 🟢 |
