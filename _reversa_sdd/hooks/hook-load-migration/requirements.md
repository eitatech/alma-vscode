# hook-load-migration (use-case)

> Use-case under `hooks`. In-place schema migration of stored hooks on load.
> Source: `hook-manager.ts`, `flowcharts/hooks.md` §5.

## Visão Geral

On load from `workspaceState`, each stored hook is migrated in place to the current schema: defaulting `timing`, converting the legacy `trigger` to the normalized `events[]` model, and renaming an MCP action's `agentId` to `modelId`. Invalid hooks are logged and skipped. 🟢

## Responsabilidades

- Default `timing="after"` when a `trigger` lacks it. 🟢
- Map a legacy `trigger` (no `events`) to `events: [agent-operation]` + `schedule: {immediate}`. 🟢
- Rename MCP `agentId` → `modelId` when `modelId` absent. 🟢
- Validate the migrated hook; keep valid ones, log + skip invalid. 🟢

## Regras de Negócio

- **R-HK-8** Migration on load: default `timing="after"`; legacy `trigger` → normalized `events[]` + `schedule:{immediate}`; MCP `agentId` → `modelId`. 🟢 `hook-manager.ts:389-425`
- Invalid hooks after migration are skipped (logged). 🟢 `flowcharts/hooks.md` §5

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Timing default | Must | `trigger` without `timing` → `after` |
| RF-02 | Legacy→normalized | Must | `trigger` without `events` → `events:[agent-operation]` + `schedule:{immediate}` |
| RF-03 | MCP field rename | Must | MCP action `agentId` (no `modelId`) → `modelId` |
| RF-04 | Validation gate | Must | migrated hook validated; invalid → log + skip |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Compatibilidade | Old persisted hooks remain loadable across schema changes | `hook-manager.ts:389` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um hook legado com `trigger` mas sem `timing`
Quando os hooks são carregados
Então o hook recebe timing='after' e events normalizados (R-HK-8)

Dado um hook MCP legado com agentId e sem modelId
Quando carregado
Então agentId é renomeado para modelId

Dado um hook que continua inválido após migração
Quando carregado
Então ele é logado e ignorado
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Migration + validation (RF-01–RF-04) | Must | Back-compat for persisted data |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `hook-manager.ts` | `loadHooks` (355), `migrateHook` (389-425), `isValidHook` | 🟢 |
