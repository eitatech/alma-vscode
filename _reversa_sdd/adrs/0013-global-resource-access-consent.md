# ADR-0013: Global resource access consent gate (privacy)

- **Status:** Accepted (retroactive)
- **Confidence:** 🟢

## Context
To shape agent behavior, the extension can read **home-directory** Copilot resources (`~/.github/copilot-instructions.md`, `~/.github/instructions/*`). Reading files outside the workspace is privacy-sensitive and should not happen silently per workspace (spec `012-steering-instructions-rules`).

## Decision
Gate global-resource reads behind a **three-state consent system**: a global default (`ask`/`allow`/`deny`, default `ask`) plus a per-workspace override (`inherit`/`allow`/`deny`). Effective access = workspace override (if allow/deny) else global default. On `ask`, show a modal (Allow / Deny / Open Settings); dismissing suppresses re-prompts for the session. Persistence uses a fallback chain: workspace config → global config → `.vscode/settings.json` → `workspaceState`.

## Evidence
- `steering/global-resource-access-consent.ts` (293 LOC); `permissions.md` §3.
- `EffectiveAccess`/`GlobalAccessDefault`/`WorkspaceAccessOverride` enums (data-dictionary.md).

## Consequences
- Explicit, per-workspace privacy control over reading the user's home directory.
- Adds resolution + multi-tier persistence complexity.
- 🔴 Whether **every** home-dir read routes through this gate (no bypasses) needs verification (`permissions.md` §10.2).
