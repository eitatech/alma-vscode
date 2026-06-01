# create-spec, Design Técnico

> HOW spec creation works. Source: `create-spec-input-controller.ts` (517), `spec-submission-strategy.ts` (71), `flowcharts/spec.md` §5.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `CreateSpecInputController.open` | `()` | — | open panel + init — `:125` |
| `SpecSubmissionStrategyFactory` | `(mode)` | strategy | `spec-submission-strategy.ts:62` |
| strategy `.submit` | `(description, imageUris)` | success/error | OpenSpec/SpecKit (14/49) |

## Webview message protocol (`types.ts`)

- **Extension→webview** `CreateSpecExtensionMessage`: init, submit success/error, confirm-close, focus, import-markdown result, attach-images result. 🟢
- **Webview→extension** `CreateSpecWebviewMessage`: submit `{description, imageUris}`, autosave, close-attempt, import-markdown request, attach-images request, cancel, ready. 🟢
- Draft: `CreateSpecDraftState { formData: { description }, lastUpdated }`. 🟢

## Fluxo Principal (§5)

1. `open` → render webview + init draft. 🟢
2. On message:
   - `autosave` → persist draft. 🟢
   - `import-markdown:request` → read `.md` → result. 🟢
   - `attach-images:request` → pick images → capped data URLs. 🟢
   - `submit` → `SpecSubmissionStrategyFactory(mode)`:
     - **OpenSpec** → read `openspec-proposal.prompt.md` + `sendPromptToChat` (STOP for approval). 🟢
     - **SpecKit** → SpecKit submission strategy. 🟢
3. Return `submit:success` / `submit:error` to the webview. 🟢

## Fluxos Alternativos

- **Missing OpenSpec prompt file:** submit error. 🟢
- **Close with unsaved draft:** confirm-close. 🟢

## Dependências

- `spec-manager` (active system), `utils/chat-prompt-runner` (sendPromptToChat), VS Code webview + `workspace.fs`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Strategy pattern for OpenSpec vs SpecKit submission | `spec-submission-strategy.ts:62` | 🟢 |
| Submission delegates to Copilot Chat (no direct file write) | `spec-submission-strategy.ts:20-44` | 🟢 |

## Estado Interno

`CreateSpecDraftState` persisted between sessions; the panel controller holds the webview. 🟢

## Observabilidade

Submit success/error reported to webview + logged. 🟡

## Riscos e Lacunas

- 🟡 Image data-URL cap value not enumerated here — confirm in `create-spec-input-controller.ts`.
