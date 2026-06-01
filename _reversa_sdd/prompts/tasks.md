# prompts (module), Tarefas de Implementação

## Pré-requisitos

- [ ] `gray-matter` (build), `handlebars` (loader, in `services`)
- [ ] An esbuild/`scripts` build step (`build-prompts`)

## Tarefas

- [ ] T-01, Author the 4 source prompts
  - Origem no legado: `src/prompts/*.prompt.md` / `example.md`
  - Critério de pronto: frontmatter (name/description/version/variables) + Handlebars body; required vars declared
  - Confiança: 🟢

- [ ] T-02, Implement the build-prompts compiler
  - Origem no legado: `scripts/build-prompts`; `flowcharts/prompts.md` §1
  - Critério de pronto: emit `target/<name>.ts` (frontmatter + escaped content + default) + DO-NOT-EDIT banner; regenerate barrel
  - Confiança: 🟢 (compiler in `scripts/`, 🟡 not in this folder)

## Tarefas de Teste

- [ ] TT-01, Each source compiles to a valid `target/<name>.ts`
- [ ] TT-02, Barrel re-exports all camelCased names
- [ ] TT-03, Generated module is plain data (no imports)

## Ordem Sugerida

1. T-01 (sources) → T-02 (compiler).

## Lacunas Pendentes (🔴)

- 🔴 Confirm runtime workspace-prompt loading under `services/prompt-loader` (`gatomia.prompts.path`).
