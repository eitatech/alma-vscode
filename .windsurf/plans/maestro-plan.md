# Plano de Implementação: Maestro Board no GatomIA VS Code

## 1. Objetivo

Portar o **Maestro Board** do plugin JetBrains para a extensão VS Code, replicando o comportamento e a aparência do painel de **Welcome** já existente (`gatomia.welcomeScreen`) e seguindo o mockup fornecido em `assets/mockup/gatomia_maestro_vscode.jpeg`.

O Maestro Board deve ser um painel webview independente, acessível por comando, com:

- Três abas: **Board**, **Composer** e **List**.
- Board estilo Kanban com as colunas: `DRAFT`, `TO DO`, `IN PROGRESS`, `IN REVIEW`, `BLOCKED`, `READY`, `DONE`.
- Filtro por spec e agrupamento por spec.
- Cards de tarefa com ações de execução local (ACP) e execução em nuvem.
- Lista de sessões ativas e histórico.

## 2. Contexto e Referências

### 2.1 Implementação JetBrains (fonte)

- `gatomia-jetbrains/src/main/kotlin/dev/gatomia/orchestration/ui/MaestroToolWindow.kt` — UI completa em Compose.
- `gatomia-jetbrains/src/main/kotlin/dev/gatomia/orchestration/ui/MaestroData.kt` — leitura de tasks e sessões.
- `gatomia-jetbrains/src/main/kotlin/dev/gatomia/orchestration/domain/BoardProjection.kt` — regra de coluna Kanban.
- `gatomia-jetbrains/src/main/resources/META-INF/plugin.xml` — registro do tool window `GatomIA: Maestro`.

### 2.2 Implementação VS Code Welcome Screen (modelo)

- `gatomia-vscode/src/panels/welcome-screen-panel.ts` — lifecycle do webview panel.
- `gatomia-vscode/src/providers/welcome-screen-provider.ts` — agregação de estado.
- `gatomia-vscode/src/types/welcome.ts` — contratos de mensagens.
- `gatomia-vscode/ui/src/features/welcome/welcome-screen.tsx` — componente React.
- `gatomia-vscode/ui/src/features/welcome/welcome.css` — estilos.
- `gatomia-vscode/src/extension.ts` — registro de comando `gatomia.showWelcome`.

### 2.3 Domínio e dados relevantes no VS Code

- `gatomia-vscode/src/utils/spec-kit-adapter.ts` — listagem de specs (`listSpecs`).
- `gatomia-vscode/src/utils/task-parser.ts` — parse de `tasks.md`.
- `gatomia-vscode/src/features/spec/review-flow/state.ts` — estado de review das specs (`getSpecState`, `updateSpecStatus`, `onReviewFlowStateChange`).
- `gatomia-vscode/src/features/spec/review-flow/types.ts` — `SpecStatus` (`current`, `review`, `reopened`, `archived`).
- `gatomia-vscode/src/features/cloud-agents/agent-session-storage.ts` — sessões de cloud (`getAll`, `getActive`, `findActiveBySpecTaskId`).
- `gatomia-vscode/src/features/cloud-agents/types.ts` — `AgentSession`, `AgentTask`, `SessionStatus`.
- `gatomia-vscode/src/services/acp/acp-session-manager.ts` — sessões ACP.
- `gatomia-vscode/src/features/devin/devin-session-manager.ts` — inicia tasks no Devin.
- `gatomia-vscode/src/providers/spec-explorer-provider.ts` — pattern de leitura de specs e tasks.

## 3. Requisitos Funcionais

### 3.1 Painel

- **RF-1**: Comando `gatomia.showMaestro` (título "Show Maestro Board") deve abrir um webview panel com `viewType = "gatomia.maestro"`.
- **RF-2**: O painel deve usar a mesma factory de webview da Welcome screen (`WebviewPanel` com `localResourceRoots`, `enableScripts`, CSP, etc.).
- **RF-3**: Título da aba: `Maestro` (ou `GatomIA: Maestro`).
- **RF-4**: Ícone no título: usar `assets/icons/gatomia.svg` via `vscode.Uri.joinPath`.
- **RF-5**: Reutilizar a infraestrutura de build do webview (Vite) e o ponto de entrada `ui/src/main.tsx` com rota/condicional para Maestro.

### 3.2 Board (Kanban)

- **RF-6**: Carregar todas as specs do workspace via `SpecSystemAdapter.listSpecs()`.
- **RF-7**: Para cada spec, localizar `tasks.md` e parsear com `parseTasksFromFile`.
- **RF-8**: Mapear status de spec (`current`, `review`, `reopened`, `archived`) para `BoardSpecStatus`.
- **RF-9**: Aplicar `BoardProjection.columnFor()` (portar `BoardProjection.kt` para TypeScript) para posicionar cada task em uma coluna.
- **RF-10**: Colunas: `DRAFT`, `TO DO`, `IN PROGRESS`, `IN REVIEW`, `BLOCKED`, `READY`, `DONE`.
- **RF-11**: Exibir contador de cards por coluna.
- **RF-12**: Permitir scroll horizontal entre colunas.
- **RF-13**: Cards devem mostrar: `id`, `title`, `phase` (como chip), `spec` (cor/identificação), status da sessão (subtítulo).
- **RF-14**: Cards em `TO DO` devem ter ícones de ação: executar local (ACP) e executar em nuvem.
- **RF-15**: Cards em `IN PROGRESS` e `BLOCKED` devem mostrar detalhes da sessão (agente, provider, status, id).
- **RF-16**: Clicar no id/task deve abrir a URL externa da sessão (Devin/GitHub) se houver.
- **RF-17**: Coluna `DRAFT` deve ter botão `+` para criar nova tarefa livre (prompt livre).

### 3.3 Composer

- **RF-18**: Aba Composer lista apenas tasks aprovadas (`current`/`reopened`) e não concluídas.
- **RF-19**: Cada item oferece ações de execução local e em nuvem.
- **RF-20**: Botão "New task" para criar tarefa livre.

### 3.4 List

- **RF-21**: Aba List mostra todas as sessões (ACP + cloud) com título, subtítulo, status e spec vinculada.
- **RF-22**: Agrupamento por spec quando `groupBySpec` estiver ativo.
- **RF-23**: Sessões sem task vinculada aparecem em "Free-form sessions".

### 3.5 Filtros

- **RF-24**: Barra de filtros com chips: "All Specs" + uma chip por spec + "Group by Spec".
- **RF-25**: Filtro de spec afeta Board, Composer e List.
- **RF-26**: Botão de refresh manual e auto-refresh a cada 2.5s ( dentro do webview `setInterval` ou via extensão).

### 3.6 Ações de execução

- **RF-27**: Executar local: reutilizar `acp-session-manager` ou `agent-chat` para abrir/enviar prompt.
- **RF-28**: Executar em nuvem: reutilizar `devin-session-manager.startTask` ou `cloud-agent-provider`.
- **RF-29**: Ao iniciar, vincular session à task via `taskKey` (portar `TaskPrompt.key()` e `TaskPrompt.text()` para TypeScript).
- **RF-30**: Se nenhum provider/agente configurado, abrir configurações (`gatomia.settings.open`).

### 3.7 Correções e Devedores Técnicos

- **RF-31**: `BoardProjection` não existe em VS Code: precisa ser criado em `src/features/maestro/`.
- **RF-32**: `TaskPrompt` não existe em VS Code: precisa ser portado.
- **RF-33**: `MaestroData` não existe em VS Code: precisa ser criado como provider/service.
- **RF-34**: A integração ACP local vs cloud precisa ser mapeada para os serviços existentes (`acp-session-manager`, `devin-session-manager`, `cloud-agent-provider`).
- **RF-35**: A regra `specHasOpenBlocker` deve considerar `changeRequests` com `status !== "addressed"` e `archivalBlocker === true`.

## 4. Arquitetura Proposta

```text
gatomia-vscode/
├── src/
│   ├── panels/
│   │   └── maestro-panel.ts              # WebviewPanel lifecycle
│   ├── providers/
│   │   └── maestro-provider.ts           # Agregação de dados (MaestroData)
│   ├── features/maestro/
│   │   ├── board-projection.ts           # Port de BoardProjection
│   │   ├── task-prompt.ts                # Port de TaskPrompt
│   │   ├── types.ts                      # MaestroTask, RunningCard
│   │   └── session-aggregator.ts         # Coleta sessões ACP + cloud
│   ├── types/maestro.ts                  # Mensagens webview ↔ extensão
│   └── extension.ts                      # Registra comando showMaestro
├── ui/src/
│   ├── features/maestro/
│   │   ├── maestro-screen.tsx            # Componente principal
│   │   ├── stores/
│   │   │   └── maestro-store.ts          # Estado e message handling
│   │   ├── components/
│   │   │   ├── kanban-board.tsx
│   │   │   ├── kanban-column.tsx
│   │   │   ├── task-card.tsx
│   │   │   ├── composer.tsx
│   │   │   ├── session-list.tsx
│   │   │   ├── session-row.tsx
│   │   │   ├── filter-bar.tsx
│   │   │   └── tab-button.tsx
│   │   └── maestro.css
│   └── main.tsx                          # Roteamento para Maestro
└── docs/
    └── MAESTRO_PLAN.md
```

## 5. Contratos de Mensagens

### Extensão → Webview

```ts
export interface MaestroStateMessage {
  type: "maestro/state";
  tasks: MaestroTaskDto[];
  sessions: RunningCardDto[];
  specs: { id: string; title: string }[];
  activeSpec: string | null;
  groupBySpec: boolean;
  activeTab: "board" | "composer" | "list";
}

export interface MaestroErrorMessage {
  type: "maestro/error";
  code: string;
  message: string;
}
```

### Webview → Extensão

```ts
export interface MaestroReadyMessage {
  type: "maestro/ready";
}

export interface MaestroRefreshMessage {
  type: "maestro/refresh";
}

export interface MaestroStartTaskMessage {
  type: "maestro/start-task";
  taskKey: string;
  cloud: boolean;
  prompt: string;
}

export interface MaestroNewFreeformTaskMessage {
  type: "maestro/new-freeform-task";
  prompt: string;
  cloud: boolean;
}

export interface MaestroFilterSpecMessage {
  type: "maestro/filter-spec";
  specId: string | null;
}

export interface MaestroToggleGroupMessage {
  type: "maestro/toggle-group";
}

export interface MaestroSwitchTabMessage {
  type: "maestro/switch-tab";
  tab: "board" | "composer" | "list";
}

export interface MaestroOpenExternalMessage {
  type: "maestro/open-external";
  url: string;
}
```

## 6. Tarefas de Implementação

| # | Tarefa | Critério de Aceitação | Prioridade |
|---|--------|----------------------|------------|
| 1 | Criar `src/features/maestro/types.ts` | Tipos `MaestroTask`, `RunningCard`, `BoardColumn`, `BoardSpecStatus` definidos | Alta |
| 2 | Portar `BoardProjection.kt` → `src/features/maestro/board-projection.ts` | Testes unitários cobrindo todas as combinações de status | Alta |
| 3 | Portar `TaskPrompt` → `src/features/maestro/task-prompt.ts` | `key()` e `text()` consistentes com JetBrains | Alta |
| 4 | Criar `src/features/maestro/session-aggregator.ts` | Retorna sessões ACP + cloud unificadas no formato `RunningCard` | Alta |
| 5 | Criar `src/providers/maestro-provider.ts` | Carrega specs, tasks.md e sessões; expõe `getState()` | Alta |
| 6 | Criar `src/panels/maestro-panel.ts` | Webview panel com lifecycle, CSP, scripts e message handlers | Alta |
| 7 | Criar `src/types/maestro.ts` | Mensagens extensão ↔ webview tipadas | Alta |
| 8 | Registrar `gatomia.showMaestro` em `src/extension.ts` | Comando abre o painel e painel é singleton | Alta |
| 9 | Atualizar `package.json` | Comando e ícone registrados; nenhum comando conflitante | Alta |
| 10 | Criar `ui/src/features/maestro/stores/maestro-store.ts` | Estado com tabs, filtros, loading, error | Alta |
| 11 | Criar `ui/src/features/maestro/maestro-screen.tsx` | Renderiza tabs Board/Composer/List | Alta |
| 12 | Criar `ui/src/features/maestro/components/kanban-board.tsx` | Colunas horizontais, scroll, contadores | Alta |
| 13 | Criar `ui/src/features/maestro/components/task-card.tsx` | Exibe id, title, phase, sessão, ações | Alta |
| 14 | Criar `ui/src/features/maestro/components/composer.tsx` | Lista de tasks pendentes com ações | Média |
| 15 | Criar `ui/src/features/maestro/components/session-list.tsx` | Lista de sessões com agrupamento | Média |
| 16 | Criar `ui/src/features/maestro/components/filter-bar.tsx` | Chips de spec e toggle group-by-spec | Média |
| 17 | Criar `ui/src/features/maestro/maestro.css` | Estilo coeso com `welcome.css`, tema VS Code | Alta |
| 18 | Integrar `main.tsx` | Renderiza `MaestroScreen` quando `viewType === gatomia.maestro` | Alta |
| 19 | Implementar handlers de execução | Local inicia ACP; Cloud inicia Devin/cloud provider | Alta |
| 20 | Adicionar auto-refresh | Recarrega estado a cada 2.5s ou via eventos | Média |
| 21 | Testes unitários | Cobertura para `board-projection.ts`, `task-prompt.ts`, `session-aggregator.ts` | Alta |
| 22 | Testes de integração | Painel carrega, mensagens trocam, ações executam | Média |
| 23 | `npm run check` e `npm test` | Passar lint, format e testes | Alta |

## 7. Decisões de Design

### 7.1 Board vs Tool Window

O VS Code não possui equivalente direto a Tool Window do IntelliJ. A solução é **WebviewPanel**, igual à Welcome screen. Isso permite React, tema automático e mensagens bidirecionais.

### 7.2 Localização de Sessões

- **Cloud**: `AgentSessionStorage.getAll()` (chave `gatomia.cloudAgent.sessions`) contém sessões Devin/ACP providers.
- **ACP local**: `acp-session-manager.ts` mantém sessões ativas; se necessário, estender para expor `getActiveSessions()`.

### 7.3 Integração com SpecSystem

Usar `SpecSystemAdapter` já existente. Para OpenSpec, `tasks.md` fica em `openspec/specs/<id>/tasks.md`; para SpecKit, em `specs/<id>/tasks.md`. O `task-parser.ts` já cobre ambos.

### 7.4 Auto-Review

Antes de carregar tasks, chamar `updatePendingSummary` / `evaluateAutoReviewTransitions` para garantir que specs com todas as tasks concluídas avancem para `review`. Equivalente a `SpecActions.reconcileAutoReview` do JetBrains.

### 7.5 Estado Inicial

A `MaestroProvider` é stateless: carrega dados a cada request. O webview mantém o estado de UI (tab, filtro, groupBySpec). Isso simplifica e evita duplicação.

### 7.6 Cores e Layout

Reutilizar CSS variables do VS Code (`--vscode-*`) e paleta de acentos do JetBrains (`#4A88C7`, `#5FAD65`, `#D0A33A`, `#9A77C2`, `#49A39B`, `#CB6E6E`) para manter identidade visual.

## 8. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| `acp-session-manager` não expõe lista de sessões locais | Médio | Criar API temporária ou usar `agent-chat-session-store.ts` |
| Cloud providers podem não ter `taskKey` vinculado | Médio | Adaptar `devin-session-manager` para aceitar `taskKey` e `specTaskId` |
| `BoardProjection` precisa ser testada para não mover tasks erroneamente | Alto | Testes unitários exhaustivos antes de implementar UI |
| Performance com muitas specs/tasks | Médio | Virtualização LazyColumn no React; cache de 2.5s |
| `welcome.css` e `maestro.css` podem conflitar | Baixo | Escopar classes com prefixo `maestro-` |

## 9. Critérios de Aceitação (Definition of Done)

- [ ] `gatomia.showMaestro` abre o painel.
- [ ] Painel renderiza as 7 colunas com cards corretamente posicionados.
- [ ] Filtro e agrupamento por spec funcionam.
- [ ] Ações de execução local e em nuvem funcionam para tasks em `TO DO`.
- [ ] Aba List exibe sessões corretamente.
- [ ] Aba Composer exibe tasks aprovadas pendentes.
- [ ] Auto-refresh reflete mudanças sem recarregar manualmente.
- [ ] Todos os testes passam.
- [ ] `npm run check` passa.
- [ ] Documentação `docs/MAESTRO_PLAN.md` e `.windsurf/plans/maestro-plan.md` estão sincronizadas.

## 10. Próximos Passos

1. Revisar e aprovar este plano.
2. Após aprovação, iniciar a implementação pela camada de domínio (`board-projection.ts`, `task-prompt.ts`).
3. Em seguida, provider e panel.
4. Por fim, UI React e testes.

---

**Mockup de referência**: `assets/mockup/gatomia_maestro_vscode.jpeg`
**Implementação de referência (JetBrains)**: `gatomia-jetbrains/src/main/kotlin/dev/gatomia/orchestration/ui/MaestroToolWindow.kt`
