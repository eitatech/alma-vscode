# create-spec (use-case)

> Use-case under `spec`. Webview-driven spec creation → submission to Copilot Chat via the right SDD strategy.
> Source: `create-spec-input-controller.ts`, `spec-submission-strategy.ts`, `flowcharts/spec.md` §5.

## Visão Geral

Opens the create-spec webview panel, supports draft autosave / markdown import / image attach, and on submit selects the OpenSpec or SpecKit submission strategy to read the prompt template and send it to Copilot Chat. 🟢

## Responsabilidades

- Open the panel and initialize a draft. 🟢
- Persist draft autosave; import a `.md` file; attach images (capped data URLs). 🟢
- On submit, pick the strategy by active system and submit; report success/error to the webview. 🟢
- For OpenSpec: read `openspec-proposal.prompt.md` and send to chat (prompt STOPs for user approval). 🟢

## Regras de Negócio

- **R-SP-9** Active system: explicit `gatomia.specSystem` wins; else auto-detect; both present + no preference → prompt + persist. 🟢 `spec-manager.ts:130`
- **R-SP-12** OpenSpec submission requires `.github/prompts/openspec-proposal.prompt.md`; prompt instructs STOP for approval. 🟢 `spec-submission-strategy.ts:20-44`
- Attached images are capped (data URLs). 🟢 `flowcharts/spec.md` §5

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Open + init draft | Must | panel renders; draft initialized |
| RF-02 | Autosave / import / attach | Should | autosave persists; `.md` import returns content; images attached as capped data URLs |
| RF-03 | Strategy submit | Must | submit picks OpenSpec/SpecKit strategy, sends the prompt to chat |
| RF-04 | OpenSpec prompt gate | Must | missing `openspec-proposal.prompt.md` → error; present → STOP-for-approval prompt sent (R-SP-12) |
| RF-05 | Result feedback | Must | submit:success / submit:error returned to the webview |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Usabilidade | Draft autosave + close-attempt confirmation prevent data loss | `create-spec-input-controller.ts` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado o sistema ativo OpenSpec e o arquivo openspec-proposal.prompt.md presente
Quando o usuário submete a descrição
Então o prompt é lido e enviado ao chat com instrução de STOP para aprovação (R-SP-12)

Dado o sistema SpecKit ativo
Quando o usuário submete
Então a estratégia SpecKit é usada e o resultado é reportado ao webview

Dado uma tentativa de fechar com rascunho não salvo
Quando o usuário fecha o painel
Então uma confirmação é solicitada
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Open + submit + feedback (RF-01, RF-03, RF-04, RF-05) | Must | The create path |
| Autosave/import/attach (RF-02) | Should | UX quality |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `create-spec-input-controller.ts` | `open` (125), draft/import/attach/submit protocol | 🟢 |
| `spec-submission-strategy.ts` | `SpecSubmissionStrategyFactory` (62), OpenSpec/SpecKit (14,49) | 🟢 |
| `types.ts` | `CreateSpec*` webview message protocol | 🟢 |
