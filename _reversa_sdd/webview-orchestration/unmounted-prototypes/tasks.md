# unmounted-prototypes, Tarefas de Implementação

## Pré-requisitos

- [ ] 🔴 Decision from `../questions.md`: wire or remove

## Tarefas

- [ ] T-01, Decide fate (wire vs remove)
  - Origem no legado: `flowcharts/webview-orchestration.md` §4; `page-registry.tsx:52`
  - Critério de pronto: maintainer confirms whether Kanban + progress pages ship
  - Confiança: 🔴

- [ ] T-02 (if wire), Register pages + importer
  - Origem no legado: `page-registry.tsx`; `components/kanban/*`; `components/{devin,cloud-agents}/*`
  - Critério de pronto: `devin-progress`/`cloud-agent-progress` pages registered; Kanban imported; replace `src/` import with a contract mirror (R-X-6)
  - Confiança: 🔴

- [ ] T-02 (if remove), Delete dead code
  - Critério de pronto: Kanban + legacy progress views/stores removed; panels updated to not request missing pages
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01 (if wire), Page renders instead of "Unknown page"
- [ ] TT-02 (if wire), Kanban groups tasks into 6 columns

## Ordem Sugerida

1. T-01 (decision) → T-02 (the chosen branch).

## Lacunas Pendentes (🔴)

- 🔴 Wire-or-remove decision + R-X-6 fix for `kanban-board.tsx` (see `../questions.md`).
