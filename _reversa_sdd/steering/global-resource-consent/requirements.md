# global-resource-consent (use-case)

> Use-case under `steering`. Privacy gate for reading home-directory Copilot resources.
> Source: `global-resource-access-consent.ts`, `flowcharts/steering.md` §2–§4.

## Visão Geral

A 3-state (ask/allow/deny) consent system controlling whether the extension may read global (home-dir) Copilot resources for a given workspace. Effective access resolves workspace override over global default; on `ask`, a modal prompts Allow/Deny/Open-Settings; decisions persist through a multi-tier fallback chain. 🟢

## Responsabilidades

- Resolve effective access (`workspace override` else `global default`). 🟢
- On `allow` → proceed; `deny` → block; `ask` → modal (unless dismissed this session). 🟢
- Persist a workspace override via the fallback chain. 🟢
- Suppress re-prompts for the rest of the session on dismissal. 🟢

## Regras de Negócio

- Effective: workspace override (allow/deny) wins over global default (`ask`/`allow`/`deny`, default `ask`). 🟢 `global-resource-access-consent.ts:145-160`
- Persistence fallback: workspace config → global config → `.vscode/settings.json` → `workspaceState`. 🟢 `:162-226`
- Dismissing the modal suppresses re-prompts that session. 🟢 `:23,248,284`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Effective resolution | Must | override allow/deny wins; else global default; `inherit` → default |
| RF-02 | allow/deny short-circuit | Must | allow → true; deny → false (no modal) |
| RF-03 | ask modal | Must | `ask` + not dismissed → Allow/Deny/Open-Settings modal |
| RF-04 | Persist override | Must | Allow/Deny persists a workspace override |
| RF-05 | Session dismissal | Should | dismissal sets a flag; no re-prompt that session → returns false |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Privacidade | Default `ask` means no silent global reads | `global-resource-access-consent.ts:145` | 🟢 |
| Confiabilidade | 4-tier persistence survives restricted config scopes | `:162-226` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado acesso efetivo 'allow'
Quando ensureGlobalResourceAccessConsent roda
Então retorna true sem modal (RF-02)

Dado acesso efetivo 'ask' e não dispensado
Quando o gate roda
Então um modal Allow/Deny/Open-Settings é exibido; Allow persiste override e retorna true (RF-03, RF-04)

Dado que o usuário dispensou o modal nesta sessão
Quando o gate roda de novo
Então nenhum modal aparece e retorna false (RF-05)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Resolution + short-circuit + modal + persist (RF-01–RF-04) | Must | Privacy control |
| Session dismissal (RF-05) | Should | UX (avoid nagging) |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `global-resource-access-consent.ts` | `getEffectiveGlobalResourceAccess` (145), `ensureGlobalResourceAccessConsent` (235), `setWorkspaceGlobalResourceAccess` (162) | 🟢 |
