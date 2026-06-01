# ADR-0011: Event-driven hooks automation engine with chain/cycle guards

- **Status:** Accepted (retroactive)
- **Confidence:** 🟢

## Context
Users want to automate the SDD workflow — e.g. "after `specify` completes, open a GitHub issue" or "before `plan`, run a validation". This requires a general trigger→action engine, not hard-coded automations (specs `002-hooks-module`, `005-mcp-hooks-integration`, `011-custom-agent-hooks`, `015-hooks-refactor`).

## Decision
Build a **hooks engine**: a `Hook` binds a **trigger** (event source: agent-operation / execution-flow / repository / file-change / manual) + optional **conditions** + **schedule** (immediate/delayed/cron) to one of six **actions** (`agent`, `git`, `github`, `mcp`, `custom`, `acp`). Completion is detected via **filesystem watchers** (parse-validate + 2 s debounce), not mere command dispatch. `$variable` templating injects trigger context. Safety guards: `MAX_CHAIN_DEPTH=10`, a circular-dependency `executedHooks` set, 30 s action timeout, MCP concurrency ≤5.

## Evidence
- `hooks/` (largest module, ~11k LOC): `hook-executor.ts`, `hook-manager.ts`, `actions/*`, `template-variable-*`, `services/command-completion-detector.ts`.
- Rules R-HK-1…R-HK-9; `state-machines.md` §16–§17.

## Consequences
- Powerful, composable automation across the SDD lifecycle.
- High surface area + duplication risk (two trigger-selectors, duplicated cli-options in the webview — Rule-of-Three flags).
- 🔴 `TemplateVariableParser.validateVariables` is a stub (always valid); the "execute in parallel" branch actually `await`s sequentially (`domain.md` §5.4).
