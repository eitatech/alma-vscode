# runtime-consumption, Design Técnico

> HOW prompts are rendered. Source: `services/prompt-loader.ts`, `target/index.ts`, `flowcharts/prompts.md` §2–§3.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `PromptLoader.renderPrompt` | `(name, vars)` | `string` | `services/prompt-loader.ts:157` |
| `target/index.ts` exports | `{ frontmatter, content }` per prompt | data | barrel |

## Fluxo Principal (§2)

1. `renderPrompt(name, vars)` → load built-in from `target/index.ts`. 🟢
2. `Handlebars.compile(content)`. 🟢
3. required `frontmatter.variables` present in `vars`? no → throw validation error. 🟢
4. render template with `vars` → final prompt string. 🟢

## SpecKit chain (§3)

`context → spec-kit-specify → spec → spec-kit-plan → planDoc → spec-kit-tasks → checklist`. 🟢

## Dependências

- `handlebars` (loader), the `prompts/target` registry. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Required-variable validation before render | `prompt-loader.ts:166-202` | 🟢 |
| Registry is the compiled barrel (no runtime markdown parse) | `target/index.ts` | 🟢 |

## Estado Interno

`PromptLoader` is a singleton (in services) caching compiled templates. 🟡

## Observabilidade

Validation errors surfaced to the caller. 🟡

## Riscos e Lacunas

- 🔴 Workspace-directory prompt loading (`gatomia.prompts.path`) is a loader concern (services) — confirm there.
