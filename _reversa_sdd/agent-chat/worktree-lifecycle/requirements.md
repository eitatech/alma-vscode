# worktree-lifecycle (use-case)

> Use-case under `agent-chat`. Git worktree isolation for sessions whose execution target is `worktree`.
> Source: `agent-worktree-service.ts`, `flowcharts/agent-chat.md` §5.

## Visão Geral

Creates and tears down an isolated git worktree (a dedicated branch in a separate directory) so an agent's edits do not touch the user's working tree. The worktree progresses through a status machine and can only be destroyed with an explicit two-step confirmation when it holds dirty or unpushed changes. 🟢

## Responsabilidades

- Resolve the repo root, verify git availability and HEAD, then create a worktree on a new branch. 🟢
- Seed the worktree (e.g. `.gitignore`) and return a `WorktreeHandle`. 🟢
- Inspect a worktree for uncommitted/unpushed changes. 🟢
- Clean up a worktree, requiring `confirmedDestructive` when changes would be lost. 🟢
- Track worktree status (`created → in-use → cleaned | abandoned`). 🟢

## Regras de Negócio

- **R-AC-9** A worktree with dirty or unpushed state can only be cleaned with `confirmedDestructive` (two-step confirmation). 🟢 `agent-worktree-service.ts:322`
- A worktree directory deleted out-of-band becomes `abandoned`. 🟢 `flowcharts/agent-chat.md` §5

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Create an isolated worktree | Must | `create()` resolves root, verifies git/HEAD, runs `git worktree add -b <branch>`, returns a `WorktreeHandle{status:'created'}` |
| RF-02 | Seed the worktree | Should | A `.gitignore` (or equivalent seed) is present after creation |
| RF-03 | Inspect for changes | Must | `inspect()` reports dirty/unpushed status used to gate cleanup |
| RF-04 | Guarded cleanup | Must | `cleanup()` with dirty/unpushed state requires `confirmedDestructive`; otherwise it warns and aborts (R-AC-9) |
| RF-05 | Status transitions | Must | `created → in-use` on attach; `→ cleaned` on cleanup; `→ abandoned` if directory vanished |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Destructive cleanup of unsaved work requires explicit confirmation | `agent-worktree-service.ts:322` | 🟢 |
| Confiabilidade | Pre-flight verification of git + HEAD before creating a worktree | `agent-worktree-service.ts:151` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um repositório git válido com HEAD resolvido
Quando uma sessão com executionTarget worktree é iniciada
Então um worktree é criado em um branch dedicado e retorna status 'created'

Dado um worktree com mudanças não commitadas
Quando cleanup() é chamado sem confirmedDestructive
Então a limpeza é abortada com um aviso (R-AC-9)

Dado um worktree cujo diretório foi removido fora do fluxo
Quando o serviço o inspeciona
Então o status passa a 'abandoned'
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Create + status machine (RF-01, RF-05) | Must | Required for worktree execution target |
| Guarded cleanup (RF-03, RF-04) | Must | Prevents data loss |
| Seed (RF-02) | Should | Quality-of-life; not strictly required |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `agent-worktree-service.ts` | `create` (151), `inspect` (269), `cleanup` (318/322) | 🟢 |
| `types.ts` | `WorktreeHandle` (151) | 🟢 |
