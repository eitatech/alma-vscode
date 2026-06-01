# change-request-form (use-case)

> Use-case under `webview-spec-explorer`. The change-request input form with validation + duplicate detection.
> Source: `components/spec-explorer/change-request-form.tsx`, `flowcharts/webview-spec-explorer.md` §2.

## Visão Geral

A form that captures a change request (title/description/severity), live-detects duplicate titles against active (non-`addressed`) change requests via normalization, and blocks submit until all required fields are present. 🟢

## Responsabilidades

- On title change: normalize and scan active CRs for a duplicate; show/clear a warning. 🟢
- On submit: require title + description + severity; else set field errors + block. 🟢
- Emit `onSubmit` with trimmed title/description + severity. 🟢

## Regras de Negócio

- Duplicate detection: `normalizeTitle` (lowercase/trim/collapse-ws) vs status != `addressed`. 🟢 `change-request-form.tsx:44,104`
- Submit requires title AND description AND severity. 🟢 `change-request-form.tsx:72`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Live duplicate warning | Should | normalized title match among non-addressed → warning; empty → clear |
| RF-02 | Required validation | Must | missing title/description/severity → field errors, block submit |
| RF-03 | Submit | Must | trimmed title/description + severity emitted |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Consistência | Mirrors the extension-side duplicate guard (R-SP-8) | `change-request-form.tsx:44` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um CR ativo "Fix login"
Quando o usuário digita "  fix   login "
Então um aviso de duplicata é exibido (normalização) (RF-01)

Dado severity ausente
Quando submit é acionado
Então o submit é bloqueado com field errors (RF-02)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Validation + submit (RF-02, RF-03) | Must | Correct CR creation |
| Duplicate warning (RF-01) | Should | Mirrors backend dedup |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `components/spec-explorer/change-request-form.tsx` | `ChangeRequestForm` (47), `normalizeTitle` (44), validate (72,104) | 🟢 |
