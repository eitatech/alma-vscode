# create-project-docs (use-case)

> Use-case under `steering`. Create the project governance doc per the active SDD system.
> Source: `steering-manager.ts`, `constitution-manager.ts`, `flowcharts/steering.md` §1.

## Visão Geral

Creates the project's governance document: a SpecKit **constitution** (via the `/speckit.constitution` chat prompt) or an OpenSpec **`AGENTS.md`** (written file), detecting the active system and prompting the user to choose when none is detected. 🟢

## Responsabilidades

- Require an open workspace. 🟢
- Detect the active SDD system; if none, QuickPick SpecKit/OpenSpec and persist. 🟢
- SpecKit → confirm overwrite (if `constitution.md` exists) → input directives → `/speckit.constitution`. 🟢
- OpenSpec → confirm overwrite (if `AGENTS.md` exists) → write default `AGENTS.md` + open. 🟢

## Regras de Negócio

- No SDD system ⇒ QuickPick; choice persisted to settings + adapter re-init. 🟢 `steering-manager.ts:115-151`
- SpecKit constitution via chat; OpenSpec `AGENTS.md` as a file. 🟢 `steering-manager.ts:153-233`
- Overwrite is confirmed for existing docs. 🟢 `flowcharts/steering.md` §1

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Workspace gate | Must | no workspace → error |
| RF-02 | System detection + choice | Must | none detected → QuickPick + persist + re-init |
| RF-03 | SpecKit constitution | Must | overwrite confirm → input directives → `/speckit.constitution` chat |
| RF-04 | OpenSpec AGENTS.md | Must | overwrite confirm → write default `AGENTS.md` + open |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Existing docs are not overwritten without confirmation | `flowcharts/steering.md` §1 | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um workspace com .specify/ presente
Quando createProjectDocumentation roda
Então o fluxo SpecKit pede diretivas e envia /speckit.constitution ao chat

Dado um workspace com openspec/ presente e AGENTS.md inexistente
Quando createProjectDocumentation roda
Então um AGENTS.md padrão é escrito e aberto

Dado nenhum sistema detectado
Quando createProjectDocumentation roda
Então o usuário escolhe o sistema e a escolha é persistida
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| All (RF-01–RF-04) | Must | Bootstrapping project governance |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `steering-manager.ts` | `createProjectDocumentation` (98), `createConstitutionRequest` (353), system pick (115-151) | 🟢 |
| `constitution-manager.ts` | `ensureConstitutionExists` (17), `createDefaultConstitution` (44) | 🟢 |
