# welcome-install (use-case)

> Use-case under `providers`. The Welcome screen's dependency install dispatch + host-prereq gating.
> Source: `welcome-screen-provider.ts`, `flowcharts/providers.md` §5.

## Visão Geral

Detects dependencies (Copilot Chat/CLI, SpecKit, OpenSpec, Devin/Gemini CLI), and on install dispatches the appropriate action: open the marketplace, or copy the install command to the clipboard + offer "Open Terminal", with the GatomIA-CLI install gated on per-IDE-host prerequisites plus ≥1 spec system. After a terminal install it re-probes after 5 s. 🟢

## Responsabilidades

- Dispatch install per dependency type. 🟢
- For copilot-chat → open Extensions marketplace; others → clipboard + Open Terminal. 🟢
- Gate gatomia-cli on host prerequisites + ≥1 spec system. 🟢
- Re-probe dependencies ~5 s after a terminal install. 🟢

## Regras de Negócio

- GatomIA-CLI install gated: windsurf⇒Devin CLI; antigravity⇒Gemini CLI; else Copilot Chat+CLI; **plus** ≥1 spec system. 🟢 `welcome-screen-provider.ts:83-116,355-366`
- Install copies the command to clipboard + offers "Open Terminal"; post-install re-probe after 5 s (`POST_INSTALL_REPROBE_DELAY_MS=5000`). 🟢 `welcome-screen-provider.ts:309-399,81`
- copilot-chat install opens the marketplace (`@id:github.copilot-chat`). 🟢 `flowcharts/providers.md` §5
- 6 editable config keys exposed by the welcome screen. 🟢 `welcome-screen-provider.ts:71-78`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Dispatch by dependency | Must | copilot-chat → marketplace; speckit/openspec/copilot-cli/devin-cli → clipboard + terminal |
| RF-02 | gatomia-cli prereq gate | Must | prereqs unmet → warn with host message; met → clipboard + terminal |
| RF-03 | Post-install re-probe | Should | ~5 s after terminal install, re-probe dependencies |
| RF-04 | Editable config | Should | 6 config keys editable from the screen |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Usabilidade | Host-aware prerequisites guide the correct CLI per editor fork | `welcome-screen-provider.ts:83-116` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado o host windsurf sem Devin CLI
Quando o usuário instala gatomia-cli
Então um aviso de pré-requisito de host é exibido (RF-02)

Dado uma dependência speckit
Quando o usuário a instala
Então o comando é copiado para o clipboard e "Open Terminal" é oferecido (RF-01)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Dispatch + prereq gate (RF-01, RF-02) | Must | Onboarding correctness |
| Re-probe + config (RF-03, RF-04) | Should | UX polish |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `welcome-screen-provider.ts` | `installDependency` (294), prereq gate (83-116,355-366), config keys (71-78) | 🟢 |
