# create-project-docs, Tarefas de Implementação

## Pré-requisitos

- [ ] `spec-kit-adapter` system detection + `chat-prompt-runner` available
- [ ] `workspace.fs` write access

## Tarefas

- [ ] T-01, Implement workspace gate + system detection + QuickPick
  - Origem no legado: `steering-manager.ts:98,115-151`
  - Critério de pronto: no workspace → error; none detected → QuickPick + persist + re-init
  - Confiança: 🟢

- [ ] T-02, Implement SpecKit constitution path (chat)
  - Origem no legado: `steering-manager.ts:353`; `constitution-manager.ts:17`
  - Critério de pronto: overwrite confirm → directives → `/speckit.constitution`
  - Confiança: 🟢

- [ ] T-03, Implement OpenSpec AGENTS.md path (file)
  - Origem no legado: `steering-manager.ts:153-233`
  - Critério de pronto: overwrite confirm → write default `AGENTS.md` + open
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, SpecKit flow sends the constitution prompt (RF-03)
- [ ] TT-02, OpenSpec flow writes AGENTS.md (RF-04)
- [ ] TT-03, No-system → QuickPick + persist (RF-02)

## Ordem Sugerida

1. T-01 → (T-02 ∥ T-03).

## Lacunas Pendentes (🔴)

- 🔴 Constitution validation (see `../questions.md`).
