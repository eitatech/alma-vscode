# welcome-install, Tarefas de Implementação

## Pré-requisitos

- [ ] `services/dependency-checker` + `utils/ide-host-detector`
- [ ] `vscode.env.clipboard` + terminal API

## Tarefas

- [ ] T-01, Implement `installDependency` dispatch
  - Origem no legado: `welcome-screen-provider.ts:294`
  - Critério de pronto: copilot-chat → marketplace; others → clipboard + terminal
  - Confiança: 🟢

- [ ] T-02, Implement gatomia-cli prereq gate
  - Origem no legado: `welcome-screen-provider.ts:83-116,355-366`
  - Critério de pronto: host prereq + ≥1 spec system enforced
  - Confiança: 🟢

- [ ] T-03, Implement post-install re-probe (5 s)
  - Origem no legado: `welcome-screen-provider.ts:81,309-399`
  - Critério de pronto: re-probe ~5 s after terminal install
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, copilot-chat opens marketplace (RF-01)
- [ ] TT-02, gatomia-cli prereq unmet → warning (RF-02)
- [ ] TT-03, Re-probe fires after terminal install (RF-03)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None. 🟡 confirm re-probe wiring with `panels`.
