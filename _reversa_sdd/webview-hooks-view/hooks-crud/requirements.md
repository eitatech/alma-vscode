# hooks-crud (use-case)

> Use-case under `webview-hooks-view`. The hook list CRUD lifecycle over the dual-keyed protocol.
> Source: `features/hooks-view/index.tsx`, `flowcharts/webview-hooks-view.md` §1–§2.

## Visão Geral

On mount, requests the hook list; on `hooks/sync` it sets the list and prunes execution statuses. The list supports toggle/edit/delete; the form creates/updates. All messages carry both `type` and `command` (dual-keyed). The form is not reset on sync. 🟢

## Responsabilidades

- Post `hooks/ready` + `hooks/list`; handle `hooks/sync`, `execution-status`, `show-logs`, `error`. 🟢
- List actions: toggle / delete / edit. 🟢
- Form submit: update (editing) or create (omit host-assigned fields). 🟢
- Read messages via `type ?? command`, `payload ?? data`. 🟢

## Regras de Negócio

- Dual-keyed: send `command = type.replace(/\//g,'.')`. 🟢 `index.tsx:30`
- Form not reset on `hooks/sync`. 🟢 `index.tsx:68`
- Create omits `id`/`createdAt`/`modifiedAt`/`executionCount`. 🟢 `types.ts:467`
- `execution-status` merges per `hookId` with fresh `updatedAt`. 🟢 `index.tsx:103`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Init + sync | Must | ready+list → `hooks/sync` → setHooks + prune statuses |
| RF-02 | List actions | Must | toggle → `hooks/toggle`; delete → `hooks/delete`; edit → form |
| RF-03 | Create/update | Must | editing → `hooks/update`; new → `hooks/create` (host-assigned omitted) |
| RF-04 | Status + logs + error | Should | exec-status merge; logs panel; error formatting |
| RF-05 | Dual-keyed read | Must | `type ?? command`, `payload ?? data` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Robustez | Form preserved across sync (no edit race) | `index.tsx:68` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado o usuário edita um hook e salva
Quando submete
Então hooks/update é enviado com id + updates (RF-03)

Dado um hooks/sync chega enquanto o form está aberto
Quando processado
Então a lista atualiza mas o form NÃO é resetado (RF-01)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Init + actions + create/update + dual-key (RF-01–RF-03, RF-05) | Must | Hook management |
| Status/logs/error (RF-04) | Should | Observability |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `features/hooks-view/index.tsx` | `HooksView` (14), `sendMessage` (29-30,54), sync (68), exec-status (103) | 🟢 |
