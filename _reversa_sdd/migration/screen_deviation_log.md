---
schemaVersion: 1
generatedAt: 2026-06-07T20:38:00Z
reversa:
  version: "1.2.34"
kind: screen_deviation_log
producedBy: screen-translator
mode: append-only
hash: "sha256:112a16674f4c4f77a7769b7c67530d29a0294a76408a29ad665ef533cc68defc"
---

# Screen Deviation Log

> Every divergence between the legacy and the generated spec in `target_screens.md`. Append-only. **Pending deviations block the handoff to the Inspector.** Approved deviations propagate to `parity_specs.md § Exceptions`.

## Convenções
- **ID**: `DEV-NNN`. **Type**: `tecnica` | `modernizacao` | `plataforma` | `correcao`. **Approval**: `pendente` | `aprovado` | `rejeitado`.

## Resumo
- **Total**: 6
- **Pendentes**: 0
- **Aprovadas**: 6 (batch-approved by Italo at 2026-06-07T20:38:00Z)
- **Rejeitadas**: 0

## Entradas

### DEV-001
| Campo | Valor |
|---|---|
| Tela afetada | all 14 screens |
| Tipo | `modernizacao` |
| Descrição | The source->target pair `vscode-extension-ui -> compose` is not in the v1 adapter master table. Specs are emitted in the `composable` (Compose Kotlin) format as a new pair rather than the `raw-prose` fallback. |
| Motivo | Graphical->graphical modernization; `composable` gives the coding agent actionable specs. User confirmed the pair extension at the Phase-1 gate. |
| Origem no legado | whole UI (`ui/` + `src/providers`) |
| Implicação para parity tests | parity is behavioral (events/transitions/content/states), not byte/pixel — Inspector builds semantic parity. |
| Aprovação | `aprovado` (por Italo, 2026-06-07T20:38:00Z) |
| Propaga para `parity_specs.md § Exceções` | sim |

### DEV-002
| Campo | Valor |
|---|---|
| Tela afetada | all 14 screens |
| Tipo | `tecnica` |
| Descrição | `_reversa_sdd/design-system/` was absent (EC-17). Base palette/typography/spacing come from the Jewel/IntelliJ theme; only semantic tokens (status/badge/hook colors) are derived in `design-system/tokens-derived.md`. |
| Motivo | Modernized mode adopts the target theme; porting the legacy Tailwind palette literally is neither needed nor desirable. |
| Origem no legado | Tailwind + VS Code theming (`ui/`) |
| Implicação para parity tests | colors are not parity-checked; semantic meaning (e.g., failed=red) is, via `tokens-derived.md`. |
| Aprovação | `aprovado` (por Italo, 2026-06-07T20:38:00Z) |
| Propaga para `parity_specs.md § Exceções` | sim |

### DEV-003
| Campo | Valor |
|---|---|
| Tela afetada | Specs/Actions/Steering/Repo Wiki/Running Agents/Cloud Agents/Hooks Explorer/Quick Access + Agent Chat tree (9 tree views) |
| Tipo | `plataforma` |
| Descrição | VS Code `TreeDataProvider` views become Jewel `LazyTree`/`LazyColumn` content in IntelliJ tool windows; context menu items become `AnAction`s. No VS Code TreeView API exists on JetBrains. |
| Motivo | Platform replacement; the tree semantics (nodes, icons, badges, context actions) are preserved, the host API changes. |
| Origem no legado | `src/providers/*-provider.ts` |
| Implicação para parity tests | parity on node content/structure/actions, not on VS Code-specific rendering. |
| Aprovação | `aprovado` (por Italo, 2026-06-07T20:38:00Z) |
| Propaga para `parity_specs.md § Exceções` | sim |

### DEV-004
| Campo | Valor |
|---|---|
| Tela afetada | Orchestration (MAESTRO board) |
| Tipo | `modernizacao` |
| Descrição | The React Flow workflow composer and the Kanban board are rebuilt as **native Compose** (graph canvas + Kanban). No `@xyflow/react` equivalent; the interaction is re-expressed natively. |
| Motivo | Paradigm Option 1 (no JCEF); this is the AMB-002 heavy-UI rebuild and the program's top effort risk (RISK-001). |
| Origem no legado | `ui/src/features/orchestration` + `workflow-composer` + `components/kanban` |
| Implicação para parity tests | behavioral parity on lanes/cards/graph semantics; pixel/interaction differences expected and accepted. |
| Aprovação | `aprovado` (por Italo, 2026-06-07T20:38:00Z) |
| Propaga para `parity_specs.md § Exceções` | sim |

### DEV-005
| Campo | Valor |
|---|---|
| Tela afetada | Welcome to GatomIA |
| Tipo | `modernizacao` |
| Descrição | The 5-tab webview (Setup/Features/Configuration/Status/Learn) becomes a Jewel `TabRow` in an editor tab. |
| Motivo | Native tab component; same tabs, same content, native host. |
| Origem no legado | `ui/src/features/welcome` |
| Implicação para parity tests | parity on tab set + per-tab content, not on webview rendering. |
| Aprovação | `aprovado` (por Italo, 2026-06-07T20:38:00Z) |
| Propaga para `parity_specs.md § Exceções` | sim |

### DEV-006
| Campo | Valor |
|---|---|
| Tela afetada | Document Preview |
| Tipo | `plataforma` |
| Descrição | Markdown + Mermaid rendering moves from the webview stack (`markdown-it` + `markdown-it-mermaid` + `mermaid` in Chromium) to a JVM-side markdown/mermaid renderer (no browser). |
| Motivo | No webview/JCEF under Option 1; rendering engine necessarily differs. |
| Origem no legado | `src/panels/document-preview-panel.ts` + `ui/src/features/preview` |
| Implicação para parity tests | parity on rendered structure/content (headings, code blocks, diagram presence), not byte/pixel of the rendered HTML. |
| Aprovação | `aprovado` (por Italo, 2026-06-07T20:38:00Z) |
| Propaga para `parity_specs.md § Exceções` | sim |

## Telas com mais de uma deviation
| Tela | IDs |
|---|---|
| all screens | DEV-001, DEV-002 |
| 9 tree views | + DEV-003 |
| Orchestration | + DEV-004 |
| Welcome | + DEV-005 |
| Document Preview | + DEV-006 |

## Notas
- All 6 deviations are **structural consequences of the transformational paradigm decision** (no bridge/webview, native Compose) and the modernized mode — none are arbitrary. They are expected to be approved as a batch.
- For a future v2 adapter, `vscode-extension-ui -> compose` should be added to the master table (DEV-001) with these patterns codified (tree->LazyTree, webview panel->editor/tool-window, React Flow->native graph).
