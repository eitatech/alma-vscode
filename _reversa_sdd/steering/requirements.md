# steering (module)

> Module-level `requirements.md`. Bounded context: **Spec Lifecycle** (AI-behavior governance).
> Source: `src/features/steering/` (~905 LOC, 5 files). Complexity: medium.
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`steering` manages the AI **steering** documents that shape agent behavior: the project **constitution** (SpecKit) / **AGENTS.md** (OpenSpec), the global Copilot config (`~/.github/copilot-instructions.md`), and project/user **instruction rules** (`*.instructions.md`). It also owns a privacy-sensitive **consent gate** controlling whether the extension may read home-directory Copilot resources for a given workspace. Document creation typically delegates to Copilot Chat (e.g. `/speckit.constitution`). 🟢

## Responsabilidades

- Create the global Copilot config (overwrite-confirmed). 🟢
- Create project documentation: SpecKit constitution (via chat) or OpenSpec `AGENTS.md` (file). 🟢
- Detect the active SDD system; prompt to choose when none. 🟢
- Create project/user instruction rules with kebab-case names, refusing to overwrite. 🟢
- Gate reads of global resources behind a 3-state consent (ask/allow/deny) with persistence fallback. 🟢

## Regras de Negócio

- Global config written to `~/.github/copilot-instructions.md` (overwrite-confirmed). 🟢 `steering-manager.ts:50-92`
- Project docs: SpecKit → `/speckit.constitution <directives>` chat; OpenSpec → write `openspec/AGENTS.md`. 🟢 `steering-manager.ts:153-233`
- No SDD system detected ⇒ user picks SpecKit/OpenSpec; persisted to settings + adapter re-init. 🟢 `steering-manager.ts:115-151`
- **R-SP-11** Instruction-rule name must normalize to lowercase kebab-case (else rejected); file is `<name>.instructions.md` with `applyTo:'**'` frontmatter; refuses to overwrite. 🟢 `instruction-rules.ts:38-76`; `steering-manager.ts:259-273`
- Effective global-resource access: workspace override (allow/deny) wins over global default (`ask`/`allow`/`deny`, default `ask`). 🟢 `global-resource-access-consent.ts:145-160`
- Consent persistence fallback chain: workspace config → global config → `.vscode/settings.json` → `workspaceState`. 🟢 `global-resource-access-consent.ts:162-226`
- Dismissing the consent prompt suppresses re-prompts for the rest of the session. 🟢 `global-resource-access-consent.ts:23,248,284`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Create global config | Should | writes `~/.github/copilot-instructions.md` with overwrite confirmation |
| RF-02 | Create project docs by system | Must | SpecKit → chat constitution; OpenSpec → `AGENTS.md`; no system → QuickPick + persist |
| RF-03 | Create instruction rule | Must | kebab-case validated; `<name>.instructions.md` written; existing file refused (R-SP-11) |
| RF-04 | Consent gate | Must | effective access resolved; `ask` → modal Allow/Deny/Open-Settings; persists override |
| RF-05 | Persistence fallback | Should | override persisted through the 4-tier fallback chain |
| RF-06 | Session dismissal | Should | dismissing the prompt suppresses re-prompts that session |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança/Privacidade | Reading home-dir Copilot resources is consent-gated per workspace | `global-resource-access-consent.ts:235` | 🟢 (ADR-0013) |
| Confiabilidade | Multi-tier persistence fallback survives restricted config targets | `global-resource-access-consent.ts:162-226` | 🟢 |
| Segurança | Instruction-rule creation refuses to overwrite existing files | `instruction-rules.ts:98-109` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado nenhum sistema SDD detectado
Quando createProjectDocumentation roda
Então o usuário escolhe SpecKit/OpenSpec, a escolha é persistida e o adapter reinicializa

Dado um nome de instruction rule "My Rule!"
Quando normalizado
Então vira "my-rule" e o arquivo my-rule.instructions.md é criado (R-SP-11)

Dado acesso efetivo 'ask' e não dispensado nesta sessão
Quando ensureGlobalResourceAccessConsent roda
Então um modal Allow/Deny/Open-Settings é exibido e a escolha persiste como override
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Project docs + instruction rules + consent (RF-02, RF-03, RF-04) | Must | Core governance + privacy control |
| Global config + fallback + dismissal (RF-01, RF-05, RF-06) | Should | Convenience + robustness |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `steering-manager.ts` | `createUserConfiguration` (50), `createProjectDocumentation` (98), `createProjectInstructionRule`/`createUserInstructionRule` (235/297), `createConstitutionRequest` (353) | 🟢 |
| `global-resource-access-consent.ts` | `getEffectiveGlobalResourceAccess` (145), `ensureGlobalResourceAccessConsent` (235), `setWorkspaceGlobalResourceAccess` (162) | 🟢 |
| `instruction-rules.ts` | `normalizeInstructionRuleName` (38), `buildInstructionRuleTemplate` (74) | 🟢 |
| `constitution-manager.ts` | `ensureConstitutionExists` (17), `validateConstitution` (74) | 🟢 / 🔴 stub |

> See `questions.md` for the 🔴 `validateConstitution` stub.
