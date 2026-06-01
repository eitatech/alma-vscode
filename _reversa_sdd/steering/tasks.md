# steering (module), Tarefas de Implementação

## Pré-requisitos

- [ ] `utils` chat-prompt-runner + spec-kit-adapter; `services` PromptLoader
- [ ] `vscode` configuration API + `workspace.fs` + `node:os`

## Tarefas

- [ ] T-01, Define types + settings keys
  - Origem no legado: `types.ts`; `global-resource-access-consent.ts:12-16`
  - Critério de pronto: consent enums + `CreateSteeringFormData` + setting keys defined
  - Confiança: 🟢

- [ ] T-02, Implement `instruction-rules` helpers
  - Origem no legado: `instruction-rules.ts:38,74,98-109`
  - Critério de pronto: kebab normalize/validate; template; project/user dir URIs; existence assert (R-SP-11)
  - Confiança: 🟢

- [ ] T-03, Implement the consent gate + persistence fallback
  - Origem no legado: `global-resource-access-consent.ts:145,162-226,235`
  - Critério de pronto: effective resolution; modal on `ask`; 4-tier persistence; session dismissal
  - Confiança: 🟢

- [ ] T-04, Implement `SteeringManager` doc creation
  - Origem no legado: `steering-manager.ts:50,98,235,297,353`
  - Critério de pronto: global config; project docs by system; instruction rules; constitution via chat
  - Confiança: 🟢

- [ ] T-05, Implement `ConstitutionManager` (path/ensure/open/create; validate)
  - Origem no legado: `constitution-manager.ts:17,22,44,74`
  - Critério de pronto: ensure/open/create work; **decide** on `validateConstitution` (stub today, see `questions.md`)
  - Confiança: 🟢 / 🔴 (validate)

## Tarefas de Teste

- [ ] TT-01, Instruction-rule name normalized + overwrite refused (R-SP-11)
- [ ] TT-02, No-system → QuickPick + persist + re-init
- [ ] TT-03, Consent `ask` shows modal; choice persists override
- [ ] TT-04, Persistence fallback reaches workspaceState when configs fail

## Ordem Sugerida

1. T-01 → T-02 → T-03 → T-04 → T-05.

## Lacunas Pendentes (🔴)

- 🔴 Decide whether `validateConstitution` should perform real validation (see `questions.md`).
