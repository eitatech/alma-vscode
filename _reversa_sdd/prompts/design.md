# prompts (module), Design Técnico

> Module-level `design.md`. Source: `src/prompts/` (+ `target/`). Confidence: 🟢 unless noted.

## Interface

| Artifact | Shape |
|----------|-------|
| Source `*.prompt.md` | `--- name/description/version/variables ---` frontmatter + Handlebars `{{var}}` body |
| `target/<name>.ts` | `export const frontmatter = {...}`; `export const content = "<escaped>"`; `export default { frontmatter, content }` |
| `target/index.ts` | `export { example, specKitSpecify, specKitPlan, specKitTasks }` |

## Built-in prompts

| Prompt | Required var | Purpose |
|--------|--------------|---------|
| `example` | `name` | Loader demo (`Hello {{name}}!`) |
| `spec-kit-specify` | `context` | Spec doc (Overview/Scenarios/Constraints/Data Model/API/Security; omits Status) |
| `spec-kit-plan` | `spec` | Implementation plan (Proposed Changes + Verification Plan) |
| `spec-kit-tasks` | `plan` | Dependency-ordered task checklist |

## Fluxo Principal (visão de módulo)

1. **Build** — `build-prompts` scans sources, gray-matter splits frontmatter+body, emits `target/<name>.ts` + barrel. 🟢 (→ `prompt-build-pipeline/`)
2. **Runtime** — `PromptLoader` loads the built-in, compiles Handlebars, validates required vars, renders. 🟢 (→ `runtime-consumption/`)
3. **Chain** — `context → specify → spec → plan → planDoc → tasks → checklist`. 🟢

## State machines / data flow (3)

See `flowcharts/prompts.md`: build pipeline (§1), runtime consumption (§2), SpecKit chain (§3).

## Dependências

- Consumed by `services/prompt-loader.ts`. Build step `scripts/build-prompts` (esbuild pipeline). 🟢
- External (build): `gray-matter`; (loader downstream): `handlebars`. Runtime: none. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Compile markdown prompts → plain TS data at build time | `flowcharts/prompts.md` §1 | 🟢 |
| Frontmatter declares required variables for loader validation | `target/*.ts` frontmatter | 🟢 |
| SpecKit chain encoded as 3 separable prompts | `flowcharts/prompts.md` §3 | 🟢 |

## Estado Interno

None (static assets + generated data). 🟢

## Observabilidade

None. 🟢

## Riscos e Lacunas

- 🔴 Whether additional prompts load at runtime from `gatomia.prompts.path` (vs only these 4) is governed by `PromptLoader` (analyzed under `services`). Confirm there, not here.
