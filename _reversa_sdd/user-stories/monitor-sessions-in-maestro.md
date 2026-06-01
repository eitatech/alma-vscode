# User Story — Monitor all agent sessions in the MAESTRO dashboard

> Global cross-cutting flow (`doc_level=completo`). Confidence: 🟢 unless noted.

## História

**Como** desenvolvedor rodando vários agentes,
**eu quero** um dashboard unificado que agrega sessões locais (ACP) e de nuvem em lanes por estado,
**para que** eu acompanhe tudo num só lugar e abra a superfície original de cada sessão.

## Fluxo (cross-module)

1. A view de orquestração monta e faz handshake `orchestration/ready`. → `webview-orchestration/orchestration-lanes`, `providers/*` (orchestration-view-provider)
2. O read-model agrega agent-chat + cloud (registry vence store), agrupa em buckets, e degrada com `degradedReasons` quando falta wiring. → `orchestration/aggregate-snapshot` (R-OR-1, R-OR-2)
3. O snapshot é enviado; a UI renderiza 4 lanes (active/waiting/completed/failed) ou um empty-state apropriado. → `webview-orchestration/orchestration-lanes`
4. Ações de card abrem a sessão / superfície original / URL externa. → `webview-orchestration/orchestration-lanes`
5. (Opcional) O loop autônomo pode mapear tarefas Kanban a sessões spawnadas. → `orchestration/autonomous-task-loop` 🔴 (protótipo — ver `orchestration/questions.md`)

## Critérios de Aceitação

```gherkin
Dado sessões locais e de nuvem ativas
Quando o dashboard recebe o snapshot
Então elas aparecem agrupadas nas 4 lanes ordenadas por recência (R-OR-1)

Dado o storage de cloud indisponível
Quando o snapshot é montado
Então um empty-state degradado explica o motivo, sem erro (R-OR-2)
```

## Units envolvidas

`orchestration/{aggregate-snapshot,autonomous-task-loop,claim-task}`, `webview-orchestration/{orchestration-lanes,workflow-composer}`, `agent-chat/*` + `cloud-agents/*` (fontes), `tasks/*` (loop).

> 🔴 O loop autônomo constrói uma `AgentChatSession` não-canônica e checa um estado inexistente — ver `orchestration/questions.md`. As páginas de progresso Kanban/Devin/Cloud estão desmontadas — ver `webview-orchestration/questions.md`.
