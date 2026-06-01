# execute-hook-on-operation, Tarefas de Implementação

## Pré-requisitos

- [ ] `hooks` types + manager + trigger registry implemented (see `../tasks.md`)
- [ ] The 6 action executors + MCP services available

## Tarefas

- [ ] T-01, Implement completion detection → fire trigger
  - Origem no legado: `command-completion-detector.ts:27-72,92`
  - Critério de pronto: watcher pattern match + parse-validate + 2 s debounce → `fireTrigger` (R-HK-7)
  - Confiança: 🟢

- [ ] T-02, Implement the single-hook pipeline
  - Origem no legado: `hook-executor.ts:~245`; `flowcharts/hooks.md` §2
  - Critério de pronto: enabled → availability → conditions → schedule → dispatch → log
  - Confiança: 🟢

- [ ] T-03, Implement availability pre-checks (MCP/custom) with prompts
  - Origem no legado: `hook-executor.ts`; `flowcharts/hooks.md` §2
  - Critério de pronto: invalid MCP → "Update Hook"; unavailable agent → Retry/Update
  - Confiança: 🟢

- [ ] T-04, Implement template expansion + action dispatch
  - Origem no legado: `hook-executor.ts:1196`; `actions/*.ts`
  - Critério de pronto: args expanded; correct executor per type; ACP lifecycle states
  - Confiança: 🟢

- [ ] T-05, Implement execution-log recording (FIFO 100)
  - Origem no legado: `hook-executor.ts:1259-1265`
  - Critério de pronto: log with status + context snapshot; oldest dropped past 100
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Watched file fires after 2 s debounce (R-HK-7)
- [ ] TT-02, Disabled / unmet-conditions → skipped (RF-02)
- [ ] TT-03, MCP-invalid prompts "Update Hook" (RF-03)
- [ ] TT-04, Action timeout records `timeout` status (R-HK-4)

## Ordem Sugerida

1. T-01 → T-02 → T-03 → T-04 → T-05.

## Lacunas Pendentes (🔴)

None blocking. 🟡 template availability gating (see `../questions.md`).
