# change-model (use-case)

> Use-case under `commands`. Change model (ACP set_model + fallback), plus mode and execution-target changes.
> Source: `agent-chat-commands.ts`, `flowcharts/commands.md` §3.

## Visão Geral

Changes a session's model via the experimental ACP `session/set_model`, falling back to a local record + store update on `ACP_NOT_SUPPORTED`. Also covers mode changes (recorded in transcript first, effective next turn) and execution-target changes (rejected once a turn has run). 🟢

## Responsabilidades

- `changeModel`: try `set_model`; `ACP_NOT_SUPPORTED` → fallback (`recordModelChange` + `updateSession`); other errors re-thrown. 🟢
- `changeMode`: record in transcript before the store patch (effective next turn). 🟢
- `changeExecutionTarget`: reject when `lifecycleState === 'running'` (immutable after turn). 🟢

## Regras de Negócio

- `changeModel` prefers `session/set_model`; only `ACP_NOT_SUPPORTED` triggers fallback. 🟢 `agent-chat-commands.ts:545-551`
- **R-AC-8** Mode change recorded in transcript **before** the store patch; effective next turn. 🟢 `agent-chat-commands.ts:475-484`
- Execution-target change rejected when `running` (immutable after first turn). 🟢 `agent-chat-commands.ts:594-596`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Model via set_model | Must | acp + manager → `setSessionModel`; success → manager fires models-changed |
| RF-02 | Model fallback | Must | `ACP_NOT_SUPPORTED` → `recordModelChange` + `updateSession`; other errors re-thrown |
| RF-03 | No-op guard | Should | session not found / model unchanged → return |
| RF-04 | Mode change timing | Must | recorded in transcript before patch; next turn (R-AC-8) |
| RF-05 | Target immutability | Must | reject change when running |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Robustez | Only `ACP_NOT_SUPPORTED` downgrades; other errors surface | `agent-chat-commands.ts:545-551` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma sessão ACP cujo agente não suporta set_model
Quando changeModel é chamado
Então ACP_NOT_SUPPORTED dispara o fallback (recordModelChange + updateSession) (RF-02)

Dado uma sessão em running
Quando changeExecutionTarget é chamado
Então a mudança é rejeitada (target imutável) (RF-05)

Dado uma mudança de modo
Quando aplicada
Então é registrada no transcript antes do patch e vale no próximo turno (R-AC-8)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Model set+fallback, mode timing, target immutability (RF-01, RF-02, RF-04, RF-05) | Must | Correct session reconfiguration |
| No-op guard (RF-03) | Should | Avoids spurious updates |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `agent-chat-commands.ts` | `handleChangeModel` (487), `tryAcpSetModel` (528,545-551), `handleChangeMode` (462,475-484), `handleChangeExecutionTarget` (584,594-596) | 🟢 |
