# prompt-build-pipeline (use-case)

> Use-case under `prompts`. Compile markdown prompt sources into TypeScript data modules.
> Source: `scripts/build-prompts`, `src/prompts/target/`, `flowcharts/prompts.md` §1.

## Visão Geral

The `build-prompts` step scans the prompt sources, splits frontmatter from the Handlebars body (gray-matter), emits one `target/<name>.ts` per source (frontmatter literal + JSON-escaped content + default), and regenerates the `target/index.ts` barrel. 🟢

## Responsabilidades

- Scan `src/prompts/*.prompt.md` and `*.md`. 🟢
- gray-matter split frontmatter + body. 🟢
- Emit `target/<name>.ts` with `frontmatter`, `content`, `default`, and a DO-NOT-EDIT banner. 🟢
- Regenerate the barrel `target/index.ts`. 🟢

## Regras de Negócio

- Generated files carry `DO NOT EDIT MANUALLY` + `Auto-generated from …` banner. 🟢 `flowcharts/prompts.md` §1
- `content` is JSON-escaped; frontmatter preserved verbatim. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Scan sources | Must | all `*.prompt.md`/`*.md` discovered |
| RF-02 | Frontmatter split | Must | gray-matter → frontmatter + body |
| RF-03 | Emit module | Must | `frontmatter` + escaped `content` + `default` + banner |
| RF-04 | Barrel regen | Must | `index.ts` re-exports camelCased names |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Determinismo | Build output is deterministic data (no runtime logic) | `target/*.ts` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado src/prompts/spec-kit-plan.prompt.md
Quando build-prompts roda
Então target/spec-kit-plan.ts é emitido com frontmatter + content escapado + default, e o barrel inclui specKitPlan
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Scan + split + emit + barrel (RF-01–RF-04) | Must | The compile step |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `scripts/build-prompts` | compiler | 🟡 (outside folder) |
| `src/prompts/target/<name>.ts` / `index.ts` | output | 🟢 |
