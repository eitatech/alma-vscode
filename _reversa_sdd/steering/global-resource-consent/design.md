# global-resource-consent, Design Técnico

> HOW the consent gate works. Source: `global-resource-access-consent.ts` (293), `flowcharts/steering.md` §2–§4.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `getEffectiveGlobalResourceAccess` | `()` | `EffectiveAccess` | `:145` |
| `isGlobalResourceAccessAllowed` | `()` | `boolean` | `:156` |
| `ensureGlobalResourceAccessConsent` | `(context, out?)` | `Promise<boolean>` | modal gate — `:235` |
| `setWorkspaceGlobalResourceAccess` | `(value)` | — | fallback persist — `:162` |

## Fluxo Principal (§2)

1. `getEffectiveGlobalResourceAccess`. 🟢
2. `allow` → return true; `deny` → return false. 🟢
3. `ask`:
   - dismissed this session? → return false. 🟢
   - else modal **Allow / Deny / Open Settings**:
     - Allow → `setWorkspaceGlobalResourceAccess('allow')` → true. 🟢
     - Deny → `setWorkspaceGlobalResourceAccess('deny')` → false. 🟢
     - Open Settings → open settings UI → false. 🟢
     - dismissed → set session flag → false. 🟢

## Effective resolution (§3)

`workspace override` (`allow`/`deny`) wins; `inherit` → `global default` (`ask`/`allow`/`deny`). Workspace override read: setting → `workspaceState` fallback → `inherit`. 🟢

## Persistence fallback (§4)

`setWorkspaceGlobalResourceAccess`: Workspace config → (fail) Global config → (fail) `.vscode/settings.json` write → (fail) `workspaceState` fallback key. 🟢

## Dependências

- `vscode` configuration API, `workspace.fs` (settings.json write), `workspaceState`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Default `ask` (privacy-first) | `:145` | 🟢 (ADR-0013) |
| 4-tier persistence to survive restricted scopes | `:162-226` | 🟢 |
| Session-scoped dismissal flag (no nagging) | `:23,248` | 🟢 |

## Estado Interno

A module/session `dismissed` flag + persisted access setting. 🟢

## Observabilidade

`lastDecision` persisted to `workspaceState`. 🟢

## Riscos e Lacunas

- 🟡 `out?` parameter on `ensureGlobalResourceAccessConsent` (an output collector) — confirm its exact use.
