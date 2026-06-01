# prompt-build-pipeline, Design Técnico

> HOW compilation works. Source: `scripts/build-prompts`, `flowcharts/prompts.md` §1.

## Fluxo Principal (§1)

1. `npm run build-prompts` → scan `src/prompts/*.prompt.md` and `*.md`. 🟢
2. gray-matter: split YAML frontmatter + Handlebars body. 🟢
3. emit `target/<name>.ts`:
   - `export const frontmatter = {...}` (verbatim). 🟢
   - `export const content = "<JSON-escaped body>"`. 🟢
   - `export default { frontmatter, content }`. 🟢
   - DO-NOT-EDIT banner. 🟢
4. regenerate `target/index.ts` barrel (camelCased re-exports). 🟢

## Dependências

- `gray-matter` (build only); esbuild/`scripts` pipeline. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Compile to plain TS data (no runtime parse) | `target/*.ts` | 🟢 |
| Banner marks generated files | `flowcharts/prompts.md` §1 | 🟢 |

## Estado Interno

None (build step). 🟢

## Observabilidade

Build logs. 🟡

## Riscos e Lacunas

- 🟡 The compiler source lives in `scripts/` (outside this module) — confirmed only via the generated banners.
