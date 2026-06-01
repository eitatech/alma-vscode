# document-refinement (use-case)

> Use-case under `services`. Map a document refine/update request to a SpecKit command + send to chat.
> Source: `refinement-gateway.ts`, `document-preview-service.ts`, `flowcharts/services.md` §6.

## Visão Geral

Maps a document's type to a SpecKit command, formats a refine or update prompt (with issue details or changed dependencies), and sends it to Copilot Chat, reporting success/error. Documents are loaded into a `DocumentArtifact` (section-parsed by `##`). 🟢

## Responsabilidades

- Map `documentType` → SpecKit command (default `/speckit.clarify`). 🟢
- Build a refine prompt (issueType + description) or update prompt (changed dependencies). 🟢
- `sendPromptToChat(prompt, specId=documentId)`; report status. 🟢
- Load md/code files into a `DocumentArtifact` (section parsing, language inference). 🟢

## Regras de Negócio

- Doc type → command: `spec→/speckit.specify`, `plan→/speckit.plan`, `task→/speckit.tasks`, …; default `/speckit.clarify`. 🟢 `refinement-gateway.ts:27-39`
- Markdown sectioning splits by `##` (fallback any `#`); non-md → syntax language. 🟢 `document-preview-service.ts`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Doc-type → command | Should | correct SpecKit command per type; default clarify |
| RF-02 | Build prompt | Should | update → changed-deps prompt; refine → issueType + description |
| RF-03 | Send + status | Should | `sendPromptToChat` → success/error status |
| RF-04 | Load artifact | Should | md → sections by `##`; code → language inference |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Robustez | Send failure mapped to an error status (no throw to caller) | `refinement-gateway.ts:105` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um documento do tipo plan com actionType refine
Quando submitRequest é chamado
Então o prompt /speckit.plan é formatado com issueType + description e enviado ao chat

Dado um arquivo markdown
Quando carregado
Então é dividido em PreviewSections por ## (RF-04)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Map + build + send (RF-01–RF-03) | Should | Document iteration aid |
| Load artifact (RF-04) | Should | Preview rendering input |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `refinement-gateway.ts` | `submitRequest` (105), type→cmd map (27-39) | 🟢 |
| `document-preview-service.ts` | `loadDocument` (80) | 🟢 |
| `document-dependency-tracker.ts` | outdated-downstream detection | 🟢 |
