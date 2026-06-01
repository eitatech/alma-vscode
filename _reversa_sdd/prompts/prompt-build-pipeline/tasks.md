# prompt-build-pipeline, Tarefas de Implementação

## Pré-requisitos

- [ ] `gray-matter`; esbuild/`scripts` build wiring (`npm run build-prompts`)

## Tarefas

- [ ] T-01, Implement scan + gray-matter split
  - Origem no legado: `flowcharts/prompts.md` §1
  - Critério de pronto: all sources discovered; frontmatter/body split
  - Confiança: 🟢

- [ ] T-02, Implement emit + barrel regen
  - Origem no legado: `src/prompts/target/*.ts`, `index.ts`
  - Critério de pronto: frontmatter + escaped content + default + banner; barrel camelCased
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Source compiles to valid target module (RF-03)
- [ ] TT-02, Barrel includes all names (RF-04)

## Ordem Sugerida

1. T-01 → T-02.

## Lacunas Pendentes (🔴)

None.
