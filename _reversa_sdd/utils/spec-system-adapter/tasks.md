# spec-system-adapter, Tarefas de Implementação

## Pré-requisitos

- [ ] `ConfigManager`; `vscode.workspace`/`window`; `node:fs`/`path`

## Tarefas

- [ ] T-01, Implement `initialize` resolution
  - Origem no legado: `spec-kit-adapter.ts:83,93-144`
  - Critério de pronto: pref/auto/QuickPick; paths per system (R-SP-9)
  - Confiança: 🟢

- [ ] T-02, Implement feature-file enumeration + numbering
  - Origem no legado: `spec-kit-adapter.ts:317,364-394`; `spec-kit-utilities.ts:80,124`
  - Critério de pronto: known map + extra discovery; dir regex; next = max+1 (R-SP-10)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Both systems → QuickPick + persist (R-SP-9)
- [ ] TT-02, Cancel QuickPick → SpecKit default, not persisted (R-SP-9)
- [ ] TT-03, Unknown file → `extra:` entry (R-SP-10)

## Ordem Sugerida

1. T-01 → T-02.

## Lacunas Pendentes (🔴)

None.
