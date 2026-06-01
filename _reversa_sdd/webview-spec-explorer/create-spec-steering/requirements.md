# create-spec-steering (use-case)

> Use-case under `webview-spec-explorer`. The create-spec + create-steering autosaving authoring forms.
> Source: `features/create-spec-view/index.tsx`, `features/create-steering-view/index.tsx`, `flowcharts/webview-spec-explorer.md` §3.

## Visão Geral

Two authoring forms with the same lifecycle: hydrate a persisted draft, autosave (600 ms debounce) to `vscode.setState` + a host `*/autosave` message, validate the required field on submit, and guard against losing unsaved changes on close. 🟢

## Responsabilidades

- Read the persisted draft (`vscode.getState`); post `create-*/ready`; hydrate from host `init`. 🟢
- Debounced autosave (600 ms) gated by a last-persisted equality check. 🟢
- Submit: require the key field (spec: description; steering: summary); post `create-*/submit`. 🟢
- Dirty close guard: `create-*/close-attempt(hasDirtyChanges)` → honor host `confirm-close`. 🟢

## Regras de Negócio

- create-spec: description required; markdown import confirms overwrite when text present; `beforeunload` guard. 🟢 `create-spec-view/index.tsx:104,305,140,285`
- create-steering: summary required (other 3 optional); `areFormsEqual` dirty check. 🟢 `create-steering-view/index.tsx:155,38`
- Autosave: 600 ms debounce → `vscode.setState` + `*/autosave`, gated by `lastPersistedRef`. 🟢 `create-spec-view/index.tsx:140`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Hydrate draft | Must | `getState` draft + host `init` hydrate the form |
| RF-02 | Debounced autosave | Must | 600 ms → `setState` + `*/autosave`; skipped when unchanged |
| RF-03 | Required validation | Must | spec→description; steering→summary; else field error + focus |
| RF-04 | Submit + result | Must | `*/submit`; success clears; error shows banner |
| RF-05 | Dirty close guard | Must | dirty → `close-attempt(true)`; host `confirm-close` honored |
| RF-06 | Import / attach (spec) | Should | markdown import overwrite confirm; image attachments |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Usabilidade | Autosave + close guard prevent data loss | `create-spec-view/index.tsx:140,285` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma descrição editada
Quando 600ms passam sem nova edição
Então o draft é persistido (setState + autosave) (RF-02)

Dado create-steering sem summary
Quando submit é acionado
Então um field error aparece e o foco vai para summary (RF-03)

Dado mudanças não salvas no fechamento
Quando o usuário fecha
Então close-attempt(true) é postado e o confirm-close do host é honrado (RF-05)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Hydrate+autosave+validate+submit+guard (RF-01–RF-05) | Must | Authoring correctness |
| Import/attach (RF-06) | Should | create-spec convenience |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `features/create-spec-view/index.tsx` | `CreateSpecView` (55), `persistDraft` (71), import/attach (305) | 🟢 |
| `features/create-steering-view/index.tsx` | `CreateSteeringView` (78), `validateForm` (152), `areFormsEqual` (38) | 🟢 |
