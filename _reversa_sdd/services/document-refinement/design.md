# document-refinement, Design Técnico

> HOW refinement works. Source: `refinement-gateway.ts` (150), `document-preview-service.ts` (500), `flowcharts/services.md` §6.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `RefinementGateway.submitRequest` | `(payload)` | `{status}` | `:105` |
| `DocumentPreviewService.loadDocument` | `(uri)` | `DocumentArtifact` | `:80` |

## Fluxo Principal (§6)

1. `submitRequest(payload)` → map `documentType` → SpecKit command. 🟢
2. `actionType`:
   - `update` → build update prompt with changed dependencies. 🟢
   - `refine` → build refine prompt with `issueType` + `description`. 🟢
3. `sendPromptToChat(prompt, specId=documentId)` → ok → `status:success`; throw → `status:error`. 🟢

## Document loading

`loadDocument` parses markdown by `##` headings into `PreviewSection`s (fallback any `#`); non-md files mapped to a syntax language. `document-dependency-tracker` flags outdated downstream docs (`OutdatedDocumentInfo`). 🟢

## Type → command map

| documentType | command |
|--------------|---------|
| spec | `/speckit.specify` |
| plan | `/speckit.plan` |
| task | `/speckit.tasks` |
| (default) | `/speckit.clarify` |

## Dependências

- `utils/chat-prompt-runner` (`sendPromptToChat`), `document-dependency-tracker`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Refinement is prompt-driven (delegates to chat, not direct edits) | `refinement-gateway.ts:105` | 🟢 |
| Section parsing by `##` heading | `document-preview-service.ts` | 🟢 |

## Estado Interno

`DocumentArtifact` cache + dependency versions (in the tracker). 🟢

## Observabilidade

Refinement status (success/error) returned to the caller. 🟡

## Riscos e Lacunas

None notable. 🟢
