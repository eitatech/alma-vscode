# change-request-form, Design Técnico

> HOW the CR form works. Source: `change-request-form.tsx:44-127`, `flowcharts/webview-spec-explorer.md` §2.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `ChangeRequestForm` | props (activeChangeRequests, onSubmit) | JSX | `:47` |
| `normalizeTitle` | `(title)` | normalized | `:44` |

## Fluxo Principal (§2)

1. title changes → `title.trim` empty? → clear warning; else `normalizeTitle` (lowercase + trim + collapse whitespace) → scan `activeChangeRequests` (status != addressed) → match? → show duplicate warning; else clear. 🟢
2. Submit → title AND description AND severity present? no → set field errors, block; yes → `onSubmit(trimmed title/description, severity)`. 🟢

## Dependências

- The active CR list (from the store); `webview-shared` form primitives. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Client-side duplicate detection mirrors the backend guard (R-SP-8) | `change-request-form.tsx:44` | 🟢 |

## Estado Interno

title/description/severity + field errors + duplicate warning. 🟢

## Observabilidade

Inline field errors + duplicate warning. 🟡

## Riscos e Lacunas

- 🟡 Client and server both normalize titles — keep the normalization identical to avoid divergent dedup.
