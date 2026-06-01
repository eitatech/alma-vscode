# User Story — Onboard and configure the workspace

> Global cross-cutting flow (`doc_level=completo`). Confidence: 🟢 unless noted.

## História

**Como** novo usuário,
**eu quero** uma tela de boas-vindas que detecta minhas dependências por host e me guia a instalá-las + criar a governança do projeto,
**para que** eu fique pronto para usar a extensão rapidamente.

## Fluxo (cross-module)

1. Welcome Screen monta (single-init) e pede estado ao host. → `webview-welcome/welcome-lifecycle`, `panels/*` (welcome panel)
2. Perfil de requisitos por host computado (required/optional/hidden/missing). → `webview-welcome/requirement-profile` (espelho de `services/welcome/requirements`)
3. Usuário instala dependências (clipboard + Open Terminal; gatomia-cli com gate de pré-requisito). → `webview-welcome/setup-actions`, `providers/welcome-install`
4. Usuário cria a governança: constitution (SpecKit, via chat) ou AGENTS.md (OpenSpec). → `steering/create-project-docs`
5. Acesso a recursos globais (home-dir) é consent-gated. → `steering/global-resource-consent`
6. Re-probe pós-instalação atualiza o status. → `providers/welcome-install`, `services/dependency-checker`

## Critérios de Aceitação

```gherkin
Dado o host windsurf
Quando a Welcome Screen computa o perfil
Então devin-cli é required e copilot-chat/gemini-cli ficam hidden

Dado nenhum sistema SDD detectado
Quando crio a documentação do projeto
Então escolho SpecKit/OpenSpec e a escolha é persistida
```

## Units envolvidas

`webview-welcome/{welcome-lifecycle,setup-actions,requirement-profile}`, `providers/welcome-install`, `services/dependency-checker` (+ welcome support), `steering/{create-project-docs,global-resource-consent,create-instruction-rule}`, `utils/cli-probe`.
