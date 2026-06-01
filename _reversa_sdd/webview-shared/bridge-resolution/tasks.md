# bridge-resolution, Tarefas de Implementação

## Pré-requisitos

- [ ] Host injects `window.acquireVsCodeApi` (or dev environment)

## Tarefas

- [ ] T-01, Implement bridge resolution + dev fallback
  - Origem no legado: `bridge/vscode.ts:18,47`
  - Critério de pronto: resolve once; real channel if present; echo stub otherwise
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Real channel used when acquireVsCodeApi present (RF-02)
- [ ] TT-02, Dev echo installed otherwise (RF-03)

## Ordem Sugerida

1. T-01.

## Lacunas Pendentes (🔴)

None. 🟡 ensure no second `acquireVsCodeApi()` call co-mounts (spec-explorer drift).
