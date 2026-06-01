# runtime-consumption (use-case)

> Use-case under `prompts`. How compiled prompts are loaded + rendered at runtime.
> Source: `services/prompt-loader.ts` (consumer), `target/index.ts`, `flowcharts/prompts.md` §2.

## Visão Geral

At runtime, `PromptLoader` loads a built-in prompt from `target/index.ts`, compiles its Handlebars `content`, validates that the variables required by its frontmatter are present, and renders the final prompt string. 🟢

> The loader itself lives in `services` (`runtime consumption` is documented there too); this use-case captures the contract the `prompts` registry must satisfy.

## Responsabilidades

- Expose each prompt as `{frontmatter, content}` via the barrel. 🟢
- Declare required variables in frontmatter for validation. 🟢
- (Loader, in services) compile + validate + render. 🟢

## Regras de Negócio

- Required `frontmatter.variables` must be present in the render vars, else validation error. 🟢 `flowcharts/prompts.md` §2; `prompt-loader.ts:166-202`
- SpecKit chain data flow: `context → specify → spec → plan → planDoc → tasks → checklist`. 🟢 `flowcharts/prompts.md` §3

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Load built-in | Must | `renderPrompt(name, vars)` loads from `target/index.ts` |
| RF-02 | Compile | Must | Handlebars compile of `content` |
| RF-03 | Validate vars | Must | missing required var → validation error |
| RF-04 | Render | Must | template rendered with vars → final string |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Confiabilidade | Variable validation before render prevents malformed prompts | `prompt-loader.ts:166-202` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado o prompt spec-kit-specify e vars sem `context`
Quando renderPrompt é chamado
Então uma validação de variável falha (RF-03)

Dado vars válidas
Quando renderPrompt é chamado
Então o template é renderizado com as vars (RF-04)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Load + compile + validate + render (RF-01–RF-04) | Must | The runtime contract |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/prompts/target/index.ts` | barrel registry | 🟢 |
| `services/prompt-loader.ts` | `renderPrompt` (157), validation (166-202) | 🟢 |
