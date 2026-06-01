# User Story — Delegate a spec task to a cloud agent

> Global cross-cutting flow (`doc_level=completo`). Confidence: 🟢 unless noted.

## História

**Como** desenvolvedor,
**eu quero** despachar uma tarefa de spec para um agente de nuvem (Devin ou GitHub Copilot coding agent),
**para que** o trabalho seja feito remotamente e o PR resultante atualize automaticamente meu `tasks.md`.

## Pré-condições

- Um cloud provider ativo + credenciado. 🟢
- Repositório git pushável (Devin exige árvore limpa). 🟢

## Fluxo (cross-module)

1. Usuário aciona "Dispatch Task" numa tarefa do board/spec. → `commands/cloud-dispatch`
2. Provider ativo + credenciais garantidos; duplicatas bloqueadas. → `commands/cloud-dispatch` (R-CD-13)
3. Sessão criada via o provider (referential prompt Devin / issue GitHub) e persistida `PENDING`. → `cloud-agents/create-session`
4. Polling unificado atualiza status, normaliza estado terminal, e capta merges de PR na janela de graça. → `cloud-agents/polling-and-normalization`
5. Em merge de PR, o checkbox `- [ ] TXXX` em `tasks.md` é marcado. → `devin/pr-state-task-sync` 🔴 (ownership Devin vs cloud-agents — ver `cloud-agents/questions.md`)
6. A sessão aparece no dashboard MAESTRO. → `orchestration/aggregate-snapshot`, `webview-orchestration/orchestration-lanes`

## Critérios de Aceitação

```gherkin
Dado um provider de nuvem ativo e credenciado
Quando despacho uma tarefa de spec
Então uma sessão PENDING é criada e o polling acompanha o status

Dado uma sessão já ativa para o mesmo spec-task
Quando despacho de novo
Então recebo "Open Session / Cancel" em vez de re-despachar (R-CD-13)
```

## Units envolvidas

`commands/cloud-dispatch`, `cloud-agents/{create-session,polling-and-normalization}`, `devin/{initiate-task,polling-cycle,pr-state-task-sync}` (caminho Devin), `tasks/*`, `orchestration/aggregate-snapshot`, `webview-orchestration/orchestration-lanes`.

> 🔴 A propriedade do polling Devin (devin vs cloud-agents) precisa de validação — ver `cloud-agents/questions.md` Q1.
