# webview-welcome (module)

> Module-level `requirements.md`. Bounded context: **Presentation infra** (webview SPA).
> Source: `ui/src/features/welcome/` (~3,616 LOC, 10 files). Complexity: medium.
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`webview-welcome` is the onboarding Welcome Screen (page `welcome-screen`). Five tabbed sections — Setup (dependency detection + install actions), Features (quick-action cards), Configuration (editable settings), Status (versions/diagnostics), Learn (resource links + search). It detects the IDE host and computes a host-specific dependency requirement profile. The **only webview module that uses Zustand**. 🟢

## Responsabilidades

- Single-init handshake (`welcome/ready`); route `welcome/*` messages to the Zustand store. 🟢
- Render nav + the current section; loading/error UI. 🟢
- Compute the host-aware requirement profile (required/optional/hidden/missing). 🟢
- Fire setup/config/feature/learn actions to the host. 🟢

## Regras de Negócio

- Single-init guarded by `initializedRef` (StrictMode-safe); `welcome/ready` sent once. 🟢 `welcome-screen.tsx:98,117`
- Diagnostics keep newest 5 (`[new, ...old].slice(0,5)`). 🟢 `welcome-store.ts:135`
- `dontShowOnStartup` inverted for UI ("show on startup"). 🟢 `welcome-screen.tsx:131,274`
- Loading "taking longer" hint after 2 s. 🟢 `welcome-screen.tsx:88`
- Host-required deps: windsurf→`devin-cli`; antigravity→`gemini-cli`; else→`copilot-chat`+`copilot-cli` (+ speckit/openspec/gatomia-cli). 🟢 `requirements.ts:48`
- ACP hosts hide `copilot-chat`; copilot hosts hide `devin-cli`+`gemini-cli`. 🟢 `requirements.ts:67`
- `specSystemReady = speckit.installed OR openspec.installed`; else `speckit` added to missing. 🟢 `requirements.ts:97,109`
- `missing` sorted by `INSTALL_ORDER` (copilot-chat 0 → CLIs 1 → spec systems 2 → gatomia-cli 3). 🟢 `requirements.ts:77,113`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Single-init + ready | Must | `initializedRef` guards; `welcome/ready` once |
| RF-02 | Message routing | Must | `welcome/state`/`install-progress`/`diagnostic-added`/`error` handled |
| RF-03 | Section nav + render | Must | 5 sections; nav scroll + `navigate-section` |
| RF-04 | Setup actions | Must | install one/missing/prerequisite; refresh |
| RF-05 | Requirement profile | Must | host-aware required/optional/hidden/missing (sorted) |
| RF-06 | Config / features / learn | Should | update-config; execute-command; open-external/search |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Robustez | StrictMode-safe single init; ErrorBoundary class | `welcome-screen.tsx:29,98` | 🟢 |
| Manutenibilidade | `requirements.ts` mirrors the extension copy (parity test guards drift) | `requirements.ts` (mirror) | 🟡 |

## Critérios de Aceitação

```gherkin
Dado o host windsurf
Quando computeRequirementProfile roda
Então devin-cli é required e copilot-chat/gemini-cli são hidden (RF-05)

Dado speckit e openspec ambos não instalados
Quando o profile é computado
Então speckit é adicionado a missing (RF-05)

Dado o WelcomeScreen monta duas vezes (StrictMode)
Quando inicializa
Então welcome/ready é enviado uma única vez (RF-01)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Init + routing + nav + setup + profile (RF-01–RF-05) | Must | Onboarding |
| Config/features/learn (RF-06) | Should | Secondary tabs |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `welcome-screen.tsx` | `WelcomeScreen` (70), `ErrorBoundary` (29) | 🟢 |
| `stores/welcome-store.ts` | `useWelcomeStore` (75) | 🟢 |
| `requirements.ts` | `computeRequirementProfile` (89), `isAcpHost`/`getRequired`/`getHidden` (22/48/67) | 🟢 |
| `components/{setup,features,config,status,learning}-section.tsx` | tab panels | 🟢 |
