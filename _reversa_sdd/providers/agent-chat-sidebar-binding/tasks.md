# agent-chat-sidebar-binding, Tarefas de Implementação

## Pré-requisitos

- [ ] `agent-chat` registry/store/runner/model-discovery available
- [ ] `utils/get-webview-content`; the `webview-agent-chat` SPA

## Tarefas

- [ ] T-01, Implement `resolveWebviewView` + message router
  - Origem no legado: `agent-chat-view-provider.ts:230,425`
  - Critério de pronto: HTML set; initial pushes; control + default routing
  - Confiança: 🟢

- [ ] T-02, Implement `bindSession` (single binding, dual focus)
  - Origem no legado: `agent-chat-view-provider.ts:556,297-331`
  - Critério de pronto: prior binding disposed; one alive; dual `.focus` (R-AC-11)
  - Confiança: 🟢

- [ ] T-03, Implement `SidebarSessionBinding` submit + delta
  - Origem no legado: `agent-chat-view-provider.ts:980,1111,1264`
  - Critério de pronto: read-only/terminal rejection; append-only deltas; lifecycle/model push (R-AC-3)
  - Confiança: 🟢

- [ ] T-04, Implement permission-default config sync
  - Origem no legado: `agent-chat-view-provider.ts:534-550`
  - Critério de pronto: Global config write + listener rebroadcast
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Rebinding disposes prior (R-AC-11)
- [ ] TT-02, Cloud/terminal submit rejected (R-AC-3)
- [ ] TT-03, Only fresh transcript messages posted (delta)
- [ ] TT-04, Permission default rebroadcasts on config change

## Ordem Sugerida

1. T-01 → T-02 → T-03 → T-04.

## Lacunas Pendentes (🔴)

None.
