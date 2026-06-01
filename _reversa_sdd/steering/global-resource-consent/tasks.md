# global-resource-consent, Tarefas de Implementação

## Pré-requisitos

- [ ] `vscode` configuration API + `workspace.fs` + `workspaceState`
- [ ] Consent enums + setting keys defined (see `../tasks.md` T-01)

## Tarefas

- [ ] T-01, Implement effective-access resolution
  - Origem no legado: `global-resource-access-consent.ts:145-160`
  - Critério de pronto: override wins; `inherit` → global default
  - Confiança: 🟢

- [ ] T-02, Implement the consent modal gate
  - Origem no legado: `global-resource-access-consent.ts:235`
  - Critério de pronto: allow/deny short-circuit; `ask` → modal; session dismissal suppresses re-prompt
  - Confiança: 🟢

- [ ] T-03, Implement persistence fallback chain
  - Origem no legado: `global-resource-access-consent.ts:162-226`
  - Critério de pronto: workspace → global → settings.json → workspaceState
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, allow/deny short-circuit, no modal (RF-02)
- [ ] TT-02, ask shows modal; Allow persists override + true (RF-03, RF-04)
- [ ] TT-03, Dismissal suppresses re-prompt that session (RF-05)
- [ ] TT-04, Fallback reaches workspaceState when configs fail

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None. 🟡 confirm `out?` collector use.
