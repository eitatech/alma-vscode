# requirement-profile, Tarefas de Implementação

## Pré-requisitos

- [ ] `DependencyStatus` + `IdeHost` types; the extension mirror to keep in sync

## Tarefas

- [ ] T-01, Implement host classification (required/hidden)
  - Origem no legado: `requirements.ts:22,48,67`
  - Critério de pronto: per-host required/hidden lists
  - Confiança: 🟢

- [ ] T-02, Implement missing computation + sort
  - Origem no legado: `requirements.ts:89,97,109,77,113`
  - Critério de pronto: specSystemReady; missing (excl. spec, add speckit); INSTALL_ORDER sort
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, windsurf → devin-cli required, copilot-chat hidden (RF-01)
- [ ] TT-02, no spec system → speckit in missing (RF-03)
- [ ] TT-03, missing sorted by INSTALL_ORDER (RF-04)
- [ ] TT-04, parity with `src/services/welcome/requirements.ts`

## Ordem Sugerida

1. T-01 → T-02.

## Lacunas Pendentes (🔴)

None. 🟡 maintain parity with the extension copy.
