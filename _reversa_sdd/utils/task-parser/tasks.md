# task-parser, Tarefas de Implementação

## Pré-requisitos

- [ ] `TaskGroup` shape (consumed by `tasks` providers)

## Tarefas

- [ ] T-01, Implement single-pass parser with `finalizeTask`
  - Origem no legado: `task-parser.ts:89`
  - Critério de pronto: group/inline/header dispatch; acceptance accumulation
  - Confiança: 🟢

- [ ] T-02, Implement status derivation + metadata extraction
  - Origem no legado: `task-parser.ts:118-124,151-168`
  - Critério de pronto: ratio status + `**STATUS**` override; priority/complexity regex; denylist
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, 2/3 acceptance → in-progress (RF-04)
- [ ] TT-02, `- [x] T###` → completed (RF-02)
- [ ] TT-03, `**STATUS**` overrides ratio (RF-04)

## Ordem Sugerida

1. T-01 → T-02.

## Lacunas Pendentes (🔴)

None.
