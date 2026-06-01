# requirement-profile, Design Técnico

> HOW the profile is computed. Source: `requirements.ts`, `flowcharts/webview-welcome.md` §4.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `computeRequirementProfile` | `(ideHost, deps)` | `{required, optional, hidden, specSystemReady, missing}` | `:89` |
| `isAcpHost` / `getRequired` / `getHidden` | host branching | bool / list | `:22/48/67` |

## Fluxo Principal (§4)

1. host branch:
   - windsurf → required `[devin-cli, speckit, openspec, gatomia-cli]`; hidden `[copilot-chat, gemini-cli]`.
   - antigravity → required `[gemini-cli, speckit, openspec, gatomia-cli]`; hidden `[copilot-chat, devin-cli]`.
   - other → required `[copilot-chat, copilot-cli, speckit, openspec, gatomia-cli]`; hidden `[devin-cli, gemini-cli]`. 🟢
2. `specSystemReady = speckit.installed OR openspec.installed`. 🟢
3. `missing = required (excl. speckit/openspec) not installed`. 🟢
4. `!specSystemReady` → push `speckit` to missing. 🟢
5. sort `missing` by `INSTALL_ORDER` weight. 🟢
6. return profile. 🟢

## Algorithm

Host classification → required/hidden lists → missing computation → install-order sort. Pure. 🟢

## Dependências

- None (pure). Mirrors `src/services/welcome/requirements.ts`. 🟡

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Spec systems excluded from missing, then `speckit` conditionally added | `requirements.ts:97,109` | 🟢 |
| INSTALL_ORDER weighting for a sensible install sequence | `requirements.ts:77` | 🟢 |

## Estado Interno

None (pure). 🟢

## Observabilidade

None. 🟢

## Riscos e Lacunas

- 🟡 Mirror of the extension copy — a parity test guards drift; keep both identical.
