# spec-system-adapter, Design Técnico

> HOW the facade works. Source: `spec-kit-adapter.ts` (618), `spec-kit-utilities.ts` (357), `flowcharts/utils.md` §1.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `SpecSystemAdapter.initialize` | `()` | `Promise<void>` | `:83` |
| `SpecSystemAdapter.getSpecFiles` / `getSpecKitFeatureFiles` | `(specId)` | file map | `:317` |
| `parseSpecKitDirectoryName` | `(name)` | `{number, slug} \| null` | `spec-kit-utilities.ts:80` |
| `discoverSpecKitFeatures` | `(root)` | sorted features | `:124` |

## Fluxo Principal (§1)

1. workspace folder? no → throw. 🟢
2. load settings via `ConfigManager`. 🟢
3. `settings.specSystem` set & != auto & valid? → system = preference. 🟢
4. else `detectAvailableSpecSystems`: `>1` → QuickPick → chosen → save; not chosen → SpecKit default (not persisted). `1 or 0` → `detectActiveSpecSystem`. 🟢
5. system → paths: SpecKit (`specs/`, `.specify/templates`) / OpenSpec (`openspec`, `prompts`). 🟢

## Feature files

`getSpecKitFeatureFiles`: ordered `KNOWN_SPEC_FILES`/`KNOWN_SPEC_FOLDERS` map + DFS discovery of unknown markdown subfolders → `extra:`/`extra-folder:` entries. 🟢

## Dependências

- `ConfigManager` (settings), `vscode.workspace`/`window` (QuickPick), `node:fs`/`path`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Singleton unified facade (ADR-0004) | `spec-kit-adapter.ts:83` | 🟢 |
| Known-file map + extra-file discovery (surfaces extension-generated docs) | `:364-394` | 🟢 |

## Estado Interno

The resolved system, specsPath, promptsPath (singleton). 🟢

## Observabilidade

System choice persisted to settings. 🟡

## Riscos e Lacunas

- 🟡 Cancel-the-QuickPick defaults to SpecKit without persisting — a re-init will prompt again.
