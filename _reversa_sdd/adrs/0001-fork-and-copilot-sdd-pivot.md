# ADR-0001: Fork from kiro-for-codex-ide and pivot to GitHub Copilot + SDD

- **Status:** Accepted (retroactive)
- **Date:** 2025-11-21 (fork day)
- **Confidence:** 🟢

## Context
The repository's first commit is *"Initial commit: clone from kiro-for-codex-ide"*. The upstream project targeted OpenAI **Codex**. gatomia needed an AI-agent integration aligned with the team's tooling (GitHub Copilot) and a spec-driven workflow.

## Decision
Fork `kiro-for-codex-ide` and, on the same day, **re-target the product to GitHub Copilot Chat/CLI and Spec-Driven Development** (OpenSpec, then SpecKit). Re-namespace the product as `gatomia` (`gatomia.*` config keys).

## Evidence
- `git log --reverse`: commits 2-8 on 2025-11-21 remove Codex artifacts, add OpenSpec prompts, and *"update prompt paths to align with GitHub Copilot conventions"*.
- Surviving lineage identifiers: dev bridge stub `openspec.chat/echoResult`, `window.specExplorerVscode`.
- `package.json` engine `^1.90.0`; Copilot Chat participant API used throughout `agents`/`services`.

## Consequences
- Inherited a mature VS Code-extension skeleton, accelerating delivery.
- Carries forward residual naming/coupling from the Codex era (cleanup debt).
- Locked the product to the VS Code + Copilot ecosystem (later broadened by ACP and cloud providers — see ADR-0006/0007).
