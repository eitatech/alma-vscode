# spec-explorer-tree, Tarefas de Implementação

## Pré-requisitos

- [ ] `spec` review-flow state + `SpecManager`; `utils/spec-kit-adapter` + `task-parser`
- [ ] `vscode.TreeDataProvider` + `FileSystemWatcher`

## Tarefas

- [ ] T-01, Implement `getChildren` (root groups → specs → files)
  - Origem no legado: `spec-explorer-provider.ts:268,304-329`
  - Critério de pronto: 4 groups; specs filtered by review-flow status (none⇒Current)
  - Confiança: 🟢

- [ ] T-02, Implement spec expansion + per-file task icons
  - Origem no legado: `flowcharts/providers.md` §3
  - Critério de pronto: speckit/openspec file layouts; status icons via task-parser
  - Confiança: 🟢

- [ ] T-03, Implement debounced refresh
  - Origem no legado: `spec-explorer-provider.ts:38,63-76`
  - Critério de pronto: spec-file + review-flow changes → refresh after 2 s
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Specs grouped by status (RF-02)
- [ ] TT-02, Spec node expands to files with icons (RF-03, RF-04)
- [ ] TT-03, Edit triggers 2 s debounced refresh (RF-05)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
