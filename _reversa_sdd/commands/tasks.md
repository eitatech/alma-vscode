# commands (module), Tarefas de Implementação

## Pré-requisitos

- [ ] `agent-chat`, `cloud-agents`, `devin` services + `services/ACP_NOT_SUPPORTED`
- [ ] `package.json` `contributes.commands` / `menus` (see `questions.md`)

## Tarefas

- [ ] T-01, Implement registration + arg coercion
  - Origem no legado: `agent-chat-commands.ts:684-718`; `cloud-agent-commands.ts:131-143`
  - Critério de pronto: `register*Commands` returns Disposables; tree-item args coerced to ids
  - Confiança: 🟢

- [ ] T-02, Implement Agent Chat handlers
  - Origem no legado: `agent-chat-commands.ts:207,234,284,409,462,487,584`
  - Critério de pronto: start (attachPanel SoT), open (hydrate+reuse), change mode/model/target, cleanup (R-AC-8/9/11)
  - Confiança: 🟢

- [ ] T-03, Implement new-session QuickPick
  - Origem no legado: `agent-chat-new-session.ts:127,183`
  - Critério de pronto: tier buckets; install-required opens URL; else task prompt → startNew
  - Confiança: 🟢

- [ ] T-04, Implement Cloud Agent handlers
  - Origem no legado: `cloud-agent-commands.ts:319,347,416`
  - Critério de pronto: provider gate; dup guard; retry(≤2 recoverable); polling autostart (R-CD-13)
  - Confiança: 🟢

- [ ] T-05, Implement Devin commands
  - Origem no legado: `devin-commands.ts:165,239-249,281`
  - Critério de pronto: start (git+confirm), configure (cog_→orgId), cancel, batch (R-CD-1/11)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Cap at limit → prompt decision before start (RF-02)
- [ ] TT-02, Duplicate dispatch → Open/Cancel warning (R-CD-13)
- [ ] TT-03, Dirty worktree cleanup → warning then confirm (R-AC-9)
- [ ] TT-04, Execution-target change while running → rejected (RF-04)

## Ordem Sugerida

1. T-01 → T-02 → T-03 (agent chat) → T-04 (cloud) → T-05 (devin).

## Lacunas Pendentes (🔴)

- 🔴 Wire `package.json` contributions (see `questions.md`).
