# create-instruction-rule, Tarefas de Implementação

## Pré-requisitos

- [ ] `instruction-rules` helpers available (see `../tasks.md` T-02)
- [ ] `workspace.fs` + `node:os` access

## Tarefas

- [ ] T-01, Implement name normalization + validation
  - Origem no legado: `instruction-rules.ts:38`
  - Critério de pronto: kebab normalize; invalid → error result (R-SP-11)
  - Confiança: 🟢

- [ ] T-02, Implement dir resolution + assert-not-exists + write
  - Origem no legado: `instruction-rules.ts:74,98-109`; `steering-manager.ts:235,297`
  - Critério de pronto: project/user dir; refuse overwrite; write template + open
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, "My Rule!" → "my-rule" file (R-SP-11)
- [ ] TT-02, Existing file → error, no overwrite (R-SP-11)
- [ ] TT-03, Invalid name → error before FS access

## Ordem Sugerida

1. T-01 → T-02.

## Lacunas Pendentes (🔴)

None.
