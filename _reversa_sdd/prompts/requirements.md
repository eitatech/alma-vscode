# prompts (module)

> Module-level `requirements.md`. Bounded context: **Presentation infra** (build-time assets).
> Source: `src/prompts/` (+ generated `target/`) (~93 LOC compiled + 4 markdown sources). Complexity: low.
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`prompts` is the **built-in prompt-template library**: markdown source prompts (YAML frontmatter + Handlebars body) plus their **compiled TypeScript output** (`target/`). A build step (`npm run build-prompts`) reads each `*.prompt.md`/`*.md`, parses frontmatter, and emits `target/<name>.ts` (exporting `frontmatter`, `content`, and a default). `target/index.ts` re-exports each prompt under a camelCased name. These compiled modules are loaded by `services/prompt-loader.ts`. The four prompts implement the SpecKit chain (specify → plan → tasks) plus a demo `example`. 🟢

## Responsabilidades

- Author prompts as `*.prompt.md` with frontmatter (`name/description/version/variables`) + Handlebars body. 🟢
- Compile each source → `target/<name>.ts` (data module, `DO NOT EDIT MANUALLY`). 🟢
- Regenerate the `target/index.ts` barrel. 🟢
- Provide the compiled registry consumed by `PromptLoader` at runtime. 🟢

## Regras de Negócio

- Build emits `frontmatter` literal + JSON-escaped `content` + `default {frontmatter, content}`; banner `DO NOT EDIT MANUALLY`. 🟢 `flowcharts/prompts.md` §1
- Frontmatter uses `variables.<name>.{required, description}` (+ optional `id`), preserved verbatim. 🟡 `target/*.ts` banners
- The four built-ins: `example`(name), `spec-kit-specify`(context), `spec-kit-plan`(spec), `spec-kit-tasks`(plan). 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Compile sources | Must | each `*.md` → `target/<name>.ts` with frontmatter + content + default |
| RF-02 | Barrel regen | Must | `target/index.ts` re-exports all (camelCased) |
| RF-03 | Built-in set | Must | example, spec-kit-{specify,plan,tasks} present with required vars |
| RF-04 | Runtime data shape | Must | generated TS is plain data (no runtime deps) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Manutenibilidade | Generated files carry a DO-NOT-EDIT banner | `flowcharts/prompts.md` §1 | 🟢 |
| Build/runtime split | `gray-matter`/`handlebars` are build/loader-only; generated TS has no runtime deps | code-analysis | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um spec-kit-specify.prompt.md com frontmatter + body
Quando build-prompts roda
Então target/spec-kit-specify.ts é emitido com frontmatter + content escapado + default, e o barrel é regenerado

Dado um prompt sem a variável requerida em runtime
Quando PromptLoader.renderPrompt é chamado
Então uma validação falha (regra do loader, em services)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Compile + barrel + built-ins (RF-01–RF-03) | Must | The prompt registry |
| Data shape (RF-04) | Must | Runtime correctness |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/prompts/*.prompt.md` / `example.md` | source templates | 🟢 |
| `src/prompts/target/<name>.ts` | generated data modules | 🟢 |
| `src/prompts/target/index.ts` | barrel | 🟢 |
| `scripts/build-prompts` | compiler (outside this folder) | 🟡 |
