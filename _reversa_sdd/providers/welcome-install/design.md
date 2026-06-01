# welcome-install, Design Técnico

> HOW install dispatch works. Source: `welcome-screen-provider.ts` (1399), `flowcharts/providers.md` §5.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `WelcomeScreenProvider.installDependency` | `(dep)` | `Promise<void>` | `:294` |

## Fluxo Principal (§5)

1. `installDependency(dep)` branches:
   - **copilot-chat** → open Extensions marketplace `@id:github.copilot-chat`. 🟢
   - **speckit / openspec / copilot-cli / devin-cli** → copy install command to clipboard → info message + "Open Terminal". 🟢
   - **gatomia-cli** → prereqs met? no → warn (host prereq message); yes → clipboard + terminal. 🟢
2. After a terminal install → re-probe dependencies after 5 s (`POST_INSTALL_REPROBE_DELAY_MS=5000`). 🟢

## Host prerequisites

| Host | Required |
|------|----------|
| windsurf | Devin CLI |
| antigravity | Gemini CLI |
| else | Copilot Chat + CLI |

Plus ≥1 spec system (SpecKit/OpenSpec). 🟢 `:83-116`

## Dependências

- `services` (`DependencyChecker`, `SystemDiagnostics`), `utils/ide-host-detector`, `vscode.env.clipboard` + terminal API. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Clipboard + Open-Terminal handoff (no silent install) | `:309-399` | 🟢 |
| Host-aware prerequisite gating for the CLI | `:83-116` | 🟢 |

## Estado Interno

Detected dependency states; re-probe timer. 🟢

## Observabilidade

Install actions surfaced via notifications; re-probe updates the screen. 🟡

## Riscos e Lacunas

- 🟡 The exact re-probe wiring (only on terminal flow vs every copy) is partly confirmed here; cross-check `panels/welcome-screen-panel` (see `../questions.md`).
