# User Story — Run a local agent in an isolated worktree

> Global cross-cutting flow (`doc_level=completo`). Confidence: 🟢 unless noted.

## História

**Como** desenvolvedor usando um IDE fork compatível com ACP (Windsurf/Antigravity),
**eu quero** iniciar um agente de codificação local em um git worktree isolado e conversar com ele,
**para que** o agente edite código em um branch dedicado sem tocar minha árvore de trabalho, com cada escrita aprovada por mim.

## Pré-condições

- IDE host elegível para ACP + workspace não-remoto (R-HK-9, R-X-5). 🟢
- Repositório git limpo. 🟢

## Fluxo (cross-module)

1. Usuário abre "New Agent Chat" → QuickPick por tier seleciona o agente. → `commands/start-new-session`, `webview-agent-chat/inputbar-composer-gating`
2. Cap de concorrência é checado; sessão criada com `executionTarget=worktree`. → `commands/start-new-session`, `agent-chat/start-and-run-session`
3. Worktree é criado (`git worktree add -b`). → `agent-chat/worktree-lifecycle`
4. `AcpClient` spawna o CLI e dirige a sessão via JSON-RPC; o turno transmite mensagens/tools. → `services/acp-client-lifecycle`, `agent-chat/start-and-run-session`
5. Toda `writeTextFile` do agente é bufferizada para Accept/Reject. → `services/permission-and-write-approval`, `webview-agent-chat` (pending-changes bar)
6. Follow-ups respeitam o limite de um enfileirado; ao encerrar, o worktree sujo exige confirmação dupla. → `agent-chat/start-and-run-session`, `agent-chat/worktree-lifecycle`, `commands/worktree-cleanup`

## Critérios de Aceitação

```gherkin
Dado um repositório git limpo em um host ACP elegível
Quando inicio um agente com execution target worktree e envio um prompt
Então um worktree é criado, o agente roda nele, e cada escrita pede minha aprovação

Dado um worktree com mudanças não commitadas
Quando tento limpá-lo
Então a remoção exige confirmação destrutiva em duas etapas (R-AC-9)
```

## Units envolvidas

`agent-chat/{start-and-run-session,worktree-lifecycle}`, `services/{acp-client-lifecycle,permission-and-write-approval}`, `commands/{start-new-session,worktree-cleanup}`, `providers/agent-chat-sidebar-binding` (ou `panels/agent-chat-panel-lifecycle`), `webview-agent-chat/*`.
