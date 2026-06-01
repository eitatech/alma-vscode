# provider-selection (use-case)

> Use-case under `tasks`. Path-based selection of the SDD task provider.
> Source: `*-task-provider.ts` `canHandle`, `flowcharts/tasks.md` §2.

## Visão Geral

Selects the task provider for a file path: `openspec/` → OpenSpec; `.specify`/`specs/` (not openspec) → SpecKit; nothing matches → unsupported placeholder. 🟢

## Responsabilidades

- `OpenSpecTaskProvider.canHandle`: path includes `openspec/`. 🟢
- `SpecKitTaskProvider.canHandle`: path includes `.specify`/`specs/` and not `openspec/`. 🟢
- First matching provider wins. 🟢

## Regras de Negócio

- **R-SP-13** Path-based selection: `openspec/` ⇒ OpenSpec; `.specify`/`specs/` (not openspec) ⇒ SpecKit. 🟢 `speckit-task-provider.ts:12-17`; `openspec-task-provider.ts:12-14`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | OpenSpec match | Must | path with `openspec/` → OpenSpec provider |
| RF-02 | SpecKit match | Must | path with `.specify`/`specs/` and not `openspec/` → SpecKit provider |
| RF-03 | No match | Must | neither → no provider (placeholder upstream) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Determinismo | Selection is a pure function of the path | `*-task-provider.ts:12` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado "openspec/changes/x/tasks.md"
Quando o provider é selecionado
Então o OpenSpecTaskProvider casa (R-SP-13)

Dado "specs/001-x/tasks.md"
Quando o provider é selecionado
Então o SpecKitTaskProvider casa (R-SP-13)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Selection (RF-01–RF-03) | Must | Routes parsing to the right system |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `speckit-task-provider.ts` | `canHandle` (12) | 🟢 |
| `openspec-task-provider.ts` | `canHandle` (12) | 🟢 |
