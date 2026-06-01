# interactive-form (use-case)

> Use-case under `webview-preview`. Embedded interactive forms with validation + submit (FormStore FSM).
> Source: `components/forms/*`, `features/preview/stores/form-store.ts`, `api/form-bridge.ts`, `flowcharts/webview-preview.md` §4.

## Visão Geral

Embedded document forms managed by a `FormStore` FSM: initialize fields → track dirty → validate (required/option/length/pattern) → submit via a request/response bridge (rejecting on 0 dirty or in read-only mode). 🟢

## Responsabilidades

- Initialize fields (documentId, sessionId, fields, readOnly). 🟢
- Track dirty + validate per field; `validateAll` before submit. 🟢
- `prepareSubmission` gate; submit via `submitForm`; mark submitted / re-enable on reject. 🟢
- Block updates + submission in read-only mode. 🟢

## Regras de Negócio

- Field validation: required, dropdown/multiselect option membership, `minLength`/`maxLength`/`pattern`. 🟢 `form-store.ts:177,197,228`
- `prepareSubmission` requires documentId+sessionId, non-read-only, `validateAll` pass, ≥1 dirty. 🟢 `form-store.ts:355`
- Read-only (`permissions.canEditForms === false`) blocks updateField + submission. 🟢 `form-store.ts:133`
- `submitForm` rejects immediately when no fields changed; 10 s timeout. 🟢 `form-bridge.ts:79`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Init fields | Must | `initializeFields` → `initialized` |
| RF-02 | Dirty + validate | Must | updateField (editable, !readOnly) → dirty; per-field validation |
| RF-03 | Submit gate | Must | `prepareSubmission` requires ids + !readOnly + validateAll + ≥1 dirty |
| RF-04 | Submit round-trip | Must | `submitForm` → submitted; reject → re-enable; 0-dirty rejects |
| RF-05 | Read-only block | Must | readOnly blocks updateField + submission |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Integridade | Submit gated by full validation + dirty check | `form-store.ts:355` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um form sem campos alterados
Quando submitForm é chamado
Então rejeita imediatamente (RF-04)

Dado readOnly = true
Quando updateField é chamado
Então a atualização é bloqueada (RF-05)

Dado um campo com pattern inválido
Quando validateAll roda
Então o submit é bloqueado com validationErrors (RF-03)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| All (RF-01–RF-05) | Must | Form correctness + safety |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `features/preview/stores/form-store.ts` | `validateField` (174), `validateAll` (293), `prepareSubmission` (345), readOnly (133) | 🟢 |
| `api/form-bridge.ts` | `submitForm` (76) | 🟢 |
| `components/forms/preview-form-container.tsx` | `PreviewFormContainer` (49) | 🟢 |
