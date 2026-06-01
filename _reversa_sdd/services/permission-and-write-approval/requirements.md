# permission-and-write-approval (use-case)

> Use-case under `services`. ACP `requestPermission` resolution + buffered `writeTextFile` approval.
> Source: `acp/acp-client.ts`, `flowcharts/services.md` §3–§4.

## Visão Geral

Implements two safety gates in the ACP `Client` handler: permission resolution (mode + remembered `allow_always`/`reject_always` per `ToolKind`, else prompt) and buffered file-write approval (enqueue a `PendingWrite` for user Accept/Reject when `bufferFileWrites`). 🟢

## Responsabilidades

- Resolve `requestPermission` by `permissionDefault` (allow/deny short-circuit; ask → remembered/prompt). 🟢
- Persist an "always" decision per `ToolKind` for the client lifetime. 🟢
- Buffer `writeTextFile` when `bufferFileWrites`; else direct write. 🟢
- On Accept → write + resolve RPC; on Reject → reject RPC (agent sees failure). 🟢

## Regras de Negócio

- `requestPermission` honors mode + remembers `allow_always`/`reject_always` per `ToolKind`. 🟢 `acp-client.ts:316,1510`
- `writeTextFile` buffered when `bufferFileWrites` (else direct); rejection surfaced to agent. 🟢 `acp-client.ts:942-960`
- Remembered-permission memo re-resolves the live `optionId` (ids rotate per request). 🟢 `acp-client.ts:1446`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | allow/deny short-circuit | Must | `allow` → allow optionId; `deny` → null/reject (no prompt) |
| RF-02 | ask + remembered | Must | `ask` → remembered allow_always/reject_always → resolve; else prompt |
| RF-03 | Persist "always" | Should | choosing an "always" option remembers it per ToolKind |
| RF-04 | Live optionId re-resolution | Must | the remembered decision re-resolves the current request's optionId |
| RF-05 | Buffered write | Must | `bufferFileWrites` → PendingWrite enqueued; Accept→write; Reject→reject RPC |
| RF-06 | Direct write | Should | `!bufferFileWrites` → direct `fs.writeFile` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | No agent file write applied without approval (when buffering) | `acp-client.ts:942` | 🟢 (ADR-0009) |

## Critérios de Aceitação

```gherkin
Dado permissionDefault = ask e uma decisão lembrada allow_always para o ToolKind
Quando requestPermission chega
Então o optionId de allow atual é re-resolvido e retornado sem prompt (RF-02, RF-04)

Dado bufferFileWrites ativo
Quando o agente chama writeTextFile
Então um PendingWrite é enfileirado; Accept grava e resolve a RPC, Reject rejeita (RF-05)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Permission + buffered write (RF-01–RF-05) | Must | Safety boundary for agent actions |
| Direct write (RF-06) | Should | Non-buffered mode |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `acp/acp-client.ts` | `buildClientHandler` (888), `resolvePermission` (1510), remember (1446), writeTextFile (942-960) | 🟢 |
| `agent-chat/pending-writes-store` | the PendingWrite buffer (consumed) | 🟢 |
