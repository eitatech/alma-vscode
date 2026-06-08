# Derived Design Tokens

> Created by the Screen Translator (migration) because `_reversa_sdd/design-system/tokens.md` was absent (EC-17).
> **Append-only.** This file never modifies a canonical `tokens.md` (none exists).
> Context: modernized mode -> the target adopts the **Jewel / IntelliJ theme** as the base palette/typography/spacing. Only **semantic** tokens that carry meaning in the legacy UI are derived here and mapped to IntelliJ theme keys. Base colors/spacing/typography are intentionally NOT ported from Tailwind — they come from the IDE theme.

## Mapping principle
- Base surface/text/border/spacing/typography -> **IntelliJ/Jewel theme defaults** (no derived token; use platform).
- Semantic status/badge colors -> derived tokens below, mapped to `JBColor` / Jewel semantic keys so they adapt to light/dark themes.

## Derived semantic tokens

| Token | Meaning (legacy) | Legacy source | Target mapping (Jewel/IntelliJ) | Deviation |
|---|---|---|---|---|
| `status.active` | Running session / active lane | orchestration bucket "active" (R-OR-1), Running Agents | `JBColor` green (theme `*.foreground` success) | DEV-002 |
| `status.waiting` | Waiting / blocked lane | orchestration bucket "waiting" | `JBColor` amber/orange (warning) | DEV-002 |
| `status.completed` | Completed session | orchestration bucket "completed" | `JBColor` neutral/blue (info) | DEV-002 |
| `status.failed` | Failed session | orchestration bucket "failed" | `JBColor` red (error) | DEV-002 |
| `badge.gitModified` | Git "M" badge on steering items | Steering view (M badges) | IntelliJ VCS modified color (`FileStatus.MODIFIED`) | DEV-002 |
| `badge.prOpen` | Open PR indicator | Cloud Agents (open PR) | `JBColor` amber | DEV-002 |
| `badge.prMerged` | Merged PR indicator | Cloud Agents (merged) | `JBColor` purple/blue (merged) | DEV-002 |
| `hook.actionType` | Hook action-type grouping color | Hooks view (grouped by action type) | Jewel chip/tag default + icon per type | DEV-002 |

## Notes
- These are **semantic** mappings, not literal hex ports — exact hues come from the active IntelliJ theme via `JBColor`, so light/dark adapt automatically (a modernization improvement over the webview's fixed Tailwind palette).
- If the maintainer later runs `reversa-design-system` on the legacy, this file can be reconciled with the extracted `tokens.md`; until then it is the minimal token source for `target_screens.md`.
