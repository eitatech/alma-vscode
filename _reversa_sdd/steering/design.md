# steering (module), Design Técnico

> Module-level `design.md`. Source: `src/features/steering/`. Confidence: 🟢 unless noted.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `SteeringManager.createUserConfiguration` | `()` | `Promise<void>` | global config — `:50` |
| `SteeringManager.createProjectDocumentation` | `()` | `Promise<void>` | constitution / AGENTS.md — `:98` |
| `SteeringManager.createProjectInstructionRule` / `createUserInstructionRule` | `()` | `Promise<boolean>` | `:235/297` |
| `ConstitutionManager.ensureConstitutionExists` / `validateConstitution` | constitution ops | — / `boolean` (🔴 stub) | `:17/74` |
| `normalizeInstructionRuleName` / `buildInstructionRuleTemplate` | helpers | result / string | `instruction-rules.ts:38/74` |
| `getEffectiveGlobalResourceAccess` / `ensureGlobalResourceAccessConsent` | consent | access / `Promise<boolean>` | `global-resource-access-consent.ts:145/235` |
| `setWorkspaceGlobalResourceAccess` | persist override | — | `:162` |

## Tipos de domínio (catálogo)

| Tipo | Local | Forma |
|------|-------|-------|
| `GlobalAccessDefault` | consent.ts | `ask\|allow\|deny` (default `ask`) |
| `WorkspaceAccessOverride` | consent.ts | `inherit\|allow\|deny` |
| `EffectiveAccess` | consent.ts | `ask\|allow\|deny` |
| `CreateSteeringFormData` | `types.ts` | `{ summary, audience, keyPractices, antiPatterns }` |
| `NormalizeInstructionRuleNameResult` | `instruction-rules.ts:19` | `{ok:true, normalizedName} \| {ok:false, error}` |

Settings/state keys: `steering.globalResourceAccessDefault`, `steering.workspaceGlobalResourceAccess`, `workspaceState` fallbacks (`gatomia.steering.*`). 🟢

## Fluxo Principal (visão de módulo)

1. **Project docs** — detect SDD system → SpecKit (chat constitution) / OpenSpec (`AGENTS.md`); prompt to choose if none. 🟢 (→ `create-project-docs/`)
2. **Consent gate** — resolve effective access; on `ask`, modal Allow/Deny/Open-Settings; persist override via the fallback chain. 🟢 (→ `global-resource-consent/`)
3. **Instruction rules** — normalize name → kebab-case → write `<name>.instructions.md` (refuse overwrite). 🟢 (→ `create-instruction-rule/`)

## State machines (2)

See `flowcharts/steering.md`:
- **Consent** (§2-§3): effective `ask|allow|deny` = workspace override else global default; `ask` → modal.
- **Document creation** (§1): detect system → constitution(chat)/AGENTS.md(file).

## Dependências

- `providers` (`CopilotProvider`), `services` (`PromptLoader`), `utils` (`chat-prompt-runner`, `config-manager`, `spec-kit-adapter`), `constants`. 🟢
- External: `vscode` (`workspace.fs`, configuration API), `node:os` (`homedir`), `node:fs`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Consent-gated global resource access (privacy control) | `global-resource-access-consent.ts:235` | 🟢 (ADR-0013) |
| Multi-tier persistence fallback for the override | `:162-226` | 🟢 |
| Document creation delegates to Copilot Chat (constitution) | `steering-manager.ts:353` | 🟢 |

## Estado Interno

A session-scoped `dismissed` flag for the consent prompt; persisted access settings. 🟢

## Observabilidade

Consent decisions persisted (`lastDecision`); document creation surfaced to the user. 🟡

## Riscos e Lacunas

- 🔴 `ConstitutionManager.validateConstitution` (`:74-77`) is a placeholder stub that always returns `true` — no validation performed. See `questions.md`.
