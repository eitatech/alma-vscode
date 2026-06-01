# hook-load-migration, Tarefas de Implementação

## Pré-requisitos

- [ ] `Hook` + normalized model types defined (see `../tasks.md` T-01)
- [ ] `isValidHook` validator available

## Tarefas

- [ ] T-01, Implement `migrateHook` (timing default, legacy→events, field rename)
  - Origem no legado: `hook-manager.ts:389-425`
  - Critério de pronto: timing→after; trigger→events+schedule; MCP agentId→modelId (R-HK-8)
  - Confiança: 🟢

- [ ] T-02, Implement `loadHooks` (migrate + validate + filter)
  - Origem no legado: `hook-manager.ts:355`
  - Critério de pronto: invalid hooks logged + skipped; `this.hooks` = valid migrated set
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Legacy trigger without timing → after + normalized events (R-HK-8)
- [ ] TT-02, MCP agentId renamed to modelId (R-HK-8)
- [ ] TT-03, Invalid-after-migration hook skipped

## Ordem Sugerida

1. T-01 → T-02.

## Lacunas Pendentes (🔴)

None. 🟡 confirm whether migration is written back to storage.
