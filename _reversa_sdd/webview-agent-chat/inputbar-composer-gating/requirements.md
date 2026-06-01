# inputbar-composer-gating (use-case)

> Use-case under `webview-agent-chat`. Follow-up InputBar enablement + empty-state composer submit gating.
> Source: `input-bar.tsx`, `new-session-composer.tsx`, `flowcharts/webview-agent-chat.md` §4–§5.

## Visão Geral

Governs when the user can send: the follow-up `InputBar` is disabled by a precedence (readOnly → !acceptsFollowUp → terminal) and the Send button needs a non-empty value; the empty-state `NewSessionComposer` requires a provider + non-empty prompt, resetting model/thinking/role on provider switch. 🟢

## Responsabilidades

- InputBar: compute disabled reason by precedence; gate Send on non-empty trimmed value; Enter submits / Shift+Enter newline; busy → Stop. 🟢
- ModelChip: dynamic `<select>` if models, else loading/static/hidden. 🟢
- Composer: default to first enabled provider; `canSubmit` = providerId + non-empty prompt; provider switch resets model/thinking/role (keeps agent file), re-probes. 🟢

## Regras de Negócio

- InputBar disabled precedence: `readOnly` → `!acceptsFollowUp` → `terminal`. 🟢 `input-bar.tsx:121,259`
- Enter submits; Shift+Enter newline; submit needs non-empty trimmed value. 🟢 `input-bar.tsx:130,153`
- ModelChip: dynamic select if `availableModels` non-empty → loading label → static `modelLabel` → hidden. 🟢 `input-bar.tsx:300-386`
- Composer default = first enabled; `canSubmit` = providerId AND non-empty prompt; Cmd/Ctrl+Enter submits. 🟢 `new-session-composer.tsx:92,233,425`
- Provider switch resets model/thinking/role, keeps agent file, re-probes models. 🟢 `new-session-composer.tsx:129,195`
- Provider label suffixes: "(via npx)", "(install required)". 🟢 `new-session-composer.tsx:456`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | InputBar disabled precedence | Must | readOnly → !acceptsFollowUp → terminal disabled reason |
| RF-02 | Send gating | Must | non-empty trimmed value required; busy → Stop (onCancel) |
| RF-03 | Enter semantics | Must | Enter submits; Shift+Enter newline |
| RF-04 | ModelChip render | Should | dynamic/loading/static/hidden per state |
| RF-05 | Composer canSubmit | Must | providerId + non-empty prompt |
| RF-06 | Provider switch reset | Must | reset model/thinking/role; keep agent file; re-probe |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Usabilidade | Clear disabled reasons + keyboard submit | `input-bar.tsx:259` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma sessão read-only
Quando o InputBar renderiza
Então fica desabilitado com "read-only cloud session" (RF-01)

Dado um provider trocado no composer
Quando a troca ocorre
Então model/thinking/role resetam, o agent file é mantido e os modelos são re-sondados (RF-06)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| InputBar gating + composer gating (RF-01–RF-03, RF-05, RF-06) | Must | Prevents invalid sends |
| ModelChip (RF-04) | Should | Picker UX |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `input-bar.tsx` | `InputBar` (94), `resolveDisabledReason` (259), `ModelChip` (300-386) | 🟢 |
| `new-session-composer.tsx` | `NewSessionComposer` (83,92,129,195,233) | 🟢 |
