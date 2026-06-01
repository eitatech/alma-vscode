# resource-hot-reload (use-case)

> Use-case under `agents`. Cache + incremental hot-reload of agent resources.
> Source: `resource-cache.ts`, `file-watcher.ts`, `flowcharts/agents.md` §2.

## Visão Geral

Loads an agent's prompts/skills/instructions into in-memory maps for O(1) lookup, watches the resources directory, and incrementally reloads only the files that changed (debounced), evicting deleted files. 🟢

## Responsabilidades

- Load the three resource types in parallel (recursive nested dirs). 🟢
- Watch the resources directory for create/change/delete. 🟢
- Debounce changes (500ms) and flush a batch of pending reloads. 🟢
- Per changed file: update (read) or evict (missing) from the right map. 🟢

## Regras de Negócio

- Resource path must be `<dir>/<type>/<name>`. 🟢 `resource-cache.ts:216`
- Deleted files are evicted on reload. 🟢 `resource-cache.ts:229`
- File watcher debounces **500ms** before flushing. 🟢 `file-watcher.ts:21`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Parallel initial load | Should | `load()` populates prompts/skills/instructions maps from recursive scan |
| RF-02 | O(1) lookup | Should | `get(type, name)` is a Map lookup |
| RF-03 | Debounced incremental reload | Should | Changes collected and flushed after 500ms; only affected entries updated |
| RF-04 | Eviction of deleted files | Should | A missing file is removed from its map on reload |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Parallel load + Map lookup + debounce avoid repeated full scans | `resource-cache.ts:43,264`; `file-watcher.ts:21` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um diretório de recursos com prompts/skills/instructions
Quando o cache carrega
Então os três tipos são lidos em paralelo e ficam disponíveis por get(type, name)

Dado um arquivo de recurso alterado
Quando a mudança ocorre
Então após 500ms apenas a entrada afetada é recarregada

Dado um arquivo de recurso removido
Quando o reload ocorre
Então a entrada correspondente é removida do map
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Load + lookup (RF-01, RF-02) | Should | Needed to serve resources, but a cold read could substitute |
| Hot-reload + eviction (RF-03, RF-04) | Could | DX optimization; correctness without it via reload-on-demand |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `resource-cache.ts` | `load` (43), `reload` (167), `get` (264), path rule (216), eviction (229) | 🟢 |
| `file-watcher.ts` | debounce (21), `onFileChange` (44) | 🟢 |
