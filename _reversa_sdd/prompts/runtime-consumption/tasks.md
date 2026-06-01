# runtime-consumption, Tarefas de Implementação

## Pré-requisitos

- [ ] `prompts/target` barrel; `handlebars` (in services); `PromptLoader`

## Tarefas

- [ ] T-01, Ensure the barrel exposes `{frontmatter, content}` per prompt
  - Origem no legado: `target/index.ts`
  - Critério de pronto: each prompt importable with frontmatter (incl. required vars) + content
  - Confiança: 🟢

- [ ] T-02, (Loader, services) compile + validate + render
  - Origem no legado: `services/prompt-loader.ts:157,166-202`
  - Critério de pronto: missing required var → validation error; else rendered string
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Missing required var → validation error (RF-03)
- [ ] TT-02, Valid vars → rendered template (RF-04)

## Ordem Sugerida

1. T-01 → T-02 (T-02 belongs to `services`).

## Lacunas Pendentes (🔴)

- 🔴 Workspace-prompt loading governed by the loader (see `services`).
