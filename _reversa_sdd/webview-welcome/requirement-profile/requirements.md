# requirement-profile (use-case)

> Use-case under `webview-welcome`. Host-aware dependency requirement computation (pure).
> Source: `requirements.ts`, `flowcharts/webview-welcome.md` §4.

## Visão Geral

`computeRequirementProfile(ideHost, deps)` classifies the IDE host, derives required/optional/hidden dependency lists, computes the missing list (excluding spec systems, then conditionally adding `speckit`), and sorts missing by install-order weight. Pure logic, mirrored from the extension copy (parity-tested). 🟢

## Responsabilidades

- Classify host → required/hidden sets. 🟢
- Compute `specSystemReady` (speckit OR openspec). 🟢
- Compute `missing` (required not installed, excl. spec systems; add `speckit` if not ready). 🟢
- Sort `missing` by `INSTALL_ORDER`. 🟢

## Regras de Negócio

- windsurf → required `devin-cli`+speckit+openspec+gatomia-cli; hidden copilot-chat/gemini-cli. 🟢 `requirements.ts:48`
- antigravity → required `gemini-cli`+…; hidden copilot-chat/devin-cli. 🟢
- other → required copilot-chat+copilot-cli+…; hidden devin-cli/gemini-cli. 🟢
- `specSystemReady = speckit.installed OR openspec.installed`; else push `speckit` to missing. 🟢 `requirements.ts:97,109`
- `missing` sorted by `INSTALL_ORDER` (copilot-chat 0 → CLIs 1 → spec systems 2 → gatomia-cli 3). 🟢 `requirements.ts:77,113`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Host classification | Must | required/optional/hidden per host |
| RF-02 | specSystemReady | Must | speckit OR openspec installed |
| RF-03 | Missing computation | Must | required (excl. spec) not installed; add speckit if not ready |
| RF-04 | Install-order sort | Must | missing sorted by INSTALL_ORDER |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Pureza | Pure function (testable; mirrored + parity-tested) | `requirements.ts:89` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado ideHost windsurf com devin-cli não instalado
Quando computeRequirementProfile roda
Então devin-cli ∈ missing e copilot-chat ∈ hidden (RF-01, RF-03)

Dado nem speckit nem openspec instalados
Quando o profile é computado
Então specSystemReady=false e speckit ∈ missing (RF-02, RF-03)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| All (RF-01–RF-04) | Must | Drives the Setup section + onboarding |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `requirements.ts` | `computeRequirementProfile` (89), `isAcpHost` (22), `getRequired` (48), `getHidden` (67), INSTALL_ORDER (77) | 🟢 |

> ⚠️ Mirror of `src/services/welcome/requirements.ts` — keep in sync (parity test).
