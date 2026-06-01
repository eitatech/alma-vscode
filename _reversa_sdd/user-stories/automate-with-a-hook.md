# User Story — Automate a workflow with a hook

> Global cross-cutting flow (`doc_level=completo`). Confidence: 🟢 unless noted.

## História

**Como** desenvolvedor,
**eu quero** criar um hook que dispara uma ação (git/github/mcp/acp/custom/agent) quando uma operação SDD termina,
**para que** tarefas repetitivas sejam automatizadas com segurança (com guardas de ciclo e timeout).

## Fluxo (cross-module)

1. Usuário cria o hook no painel de hooks (form roteado por action type; template `$variable`). → `webview-hooks-view/{hooks-crud,action-form-routing}`, `providers/hooks-panel-crud`
2. Hook persistido + validado (sync/async), migrado se legado. → `hooks/hook-load-migration`, `hook-manager`
3. Uma operação SDD termina → watcher detecta (parse + 2 s debounce) → dispara trigger. → `hooks/execute-hook-on-operation` (R-HK-7), `spec`/`utils` (completion)
4. Hooks correspondentes (agent+op+timing) executam em ordem `createdAt`; `before`+`waitForCompletion` bloqueia. → `hooks/trigger-matching-and-blocking` (R-HK-1, R-HK-2)
5. Pipeline: availability → conditions → schedule → dispatch da ação → log (FIFO 100). → `hooks/execute-hook-on-operation`
6. Guarda de cadeia evita ciclos e profundidade > 10. → `hooks/execution-chain-guard` (R-HK-3)

## Critérios de Aceitação

```gherkin
Dado um hook habilitado para (speckit, specify, after) com ação git commit
Quando specs/NNN/spec.md é gravado e validado
Então após 2s o hook executa e registra um log

Dado um hook que dispararia a si mesmo
Quando a cadeia o reentra
Então CircularDependencyError interrompe a cadeia (R-HK-3)
```

## Units envolvidas

`hooks/{execute-hook-on-operation,trigger-matching-and-blocking,execution-chain-guard,hook-load-migration}`, `providers/hooks-panel-crud`, `webview-hooks-view/{hooks-crud,mcp-discovery-grouping,action-form-routing}`, `utils/mcp-discovery` (ações MCP), `services/acp-client-lifecycle` (ações ACP).

> 🔴 `validateVariables` é stub — gating de variáveis por trigger não é aplicado (ver `hooks/questions.md`).
