# provider-selection, Design Técnico

> HOW provider selection works. Source: `*-task-provider.ts` `canHandle`, `flowcharts/tasks.md` §2.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `OpenSpecTaskProvider.canHandle` | `(filePath)` | `boolean` | includes `openspec/` — `:12` |
| `SpecKitTaskProvider.canHandle` | `(filePath)` | `boolean` | includes `.specify`/`specs/`, not openspec — `:12` |

## Fluxo Principal (§2)

1. `filePath` includes `openspec/`? → OpenSpecTaskProvider. 🟢
2. else includes `.specify` or `specs/`? → SpecKitTaskProvider. 🟢
3. else → no provider (caller returns unsupported placeholder). 🟢

## Dependências

- The `TaskService` provider list (registration order matters for first-match). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| OpenSpec checked first (its path is the more specific signal) | `flowcharts/tasks.md` §2 | 🟢 |

## Estado Interno

None. 🟢

## Observabilidade

None (pure path test). 🟢

## Riscos e Lacunas

- 🟡 A path containing both `specs/` and `openspec/` would match OpenSpec first — confirm this ordering is intended.
