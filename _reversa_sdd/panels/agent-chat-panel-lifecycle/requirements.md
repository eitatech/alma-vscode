# agent-chat-panel-lifecycle (use-case)

> Use-case under `panels`. The per-session Agent Chat editor panel open/plumbing/dispose.
> Source: `agent-chat-panel.ts`, `flowcharts/panels.md` §2.

## Visão Geral

Opens (idempotently) the per-session Agent Chat editor panel, wires its `agent-chat/*` protocol, subscribes to the store manifest to push lifecycle + transcript deltas, and disposes exactly once. Registration is owned by the command handler, not the panel. 🟢

## Responsabilidades

- Idempotent `open` (reveal if already open; else create via host). 🟢
- Wire `onDidReceiveMessage` / `onDidDispose`; subscribe `store.onDidChangeManifest`. 🟢
- On `agent-chat/ready` → send session snapshot + transcript. 🟢
- On manifest change → post lifecycle-changed + flush transcript deltas. 🟢
- Fire `_onDidDispose` once, then dispose the emitter. 🟢

## Regras de Negócio

- **R-AC-11** Panel does **not** call `registry.attachPanel` (command handler is SoT). 🟢 `agent-chat-panel.ts:203-212`
- Transcript pushed as append-only deltas (diff by id). 🟢 `agent-chat-panel.ts:550-565`
- Panel created with `enableScripts + retainContextWhenHidden + localResourceRoots:[extensionUri]`. 🟢
- `readTranscript` reads via `transcriptKeyFor(id)` scoped memento. 🟢 `agent-chat-panel.ts:571-585`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Idempotent open | Must | already open → reveal Beside; else create + wire |
| RF-02 | Protocol plumbing | Must | ready→snapshot; input/submit→handler; cancel/retry→runner |
| RF-03 | Manifest-driven deltas | Must | lifecycle change → post; transcript diff → append fresh |
| RF-04 | One-shot dispose | Must | `_onDidDispose` fires once; emitter disposed |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Testabilidade | `AgentChatPanelHost` factory lets tests inject a fake panel | `agent-chat-panel.ts:89` | 🟢 |
| Performance | Append-only deltas + retainContextWhenHidden | `:550` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um painel já aberto para a sessão
Quando open() é chamado de novo
Então o painel é revelado (Beside), sem recriar nem registrar (R-AC-11)

Dado uma mudança de manifesto com lifecycle alterado
Quando o evento dispara
Então session/lifecycle-changed é postado e apenas mensagens novas são anexadas
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Open + protocol + deltas + dispose (RF-01–RF-04) | Must | The panel's whole lifecycle |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `agent-chat-panel.ts` | `createDefaultAgentChatPanelHost` (89), `open` (195), `flushTranscriptDeltas` (550), `readTranscript` (571) | 🟢 |
