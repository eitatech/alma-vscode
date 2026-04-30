---
name: orchestration-ui-contract
description: UI contract for the phase 01 orchestration prototype
author: OpenCode
version: v0.0.1
---

# Orchestration UI Contract

See also: [[Running-Agents-Prototype]]

## Inbound Messages

- `orchestration/ready`: webview asks the extension for the current snapshot.
- `orchestration/refresh`: webview asks the extension to refresh cloud polling and republish the snapshot.
- `orchestration/open-session`: webview asks the extension to open the selected session in the best existing surface.
- `orchestration/open-existing-surface`: webview asks the extension to reveal the original surface for a session source.
- `orchestration/open-external`: webview asks the extension to open an external provider URL.

## Outbound Messages

- `orchestration/snapshot`: extension publishes the normalized orchestration snapshot.

## Snapshot Shape

- `sessions[]`: normalized session cards with `id`, `source`, `sourceSessionId`, `title`, `agentName`, `state`, `bucket`, timestamps, blocking metadata, worktree metadata, and open-session routing hints.
- `activeProvider`: current cloud provider metadata when present.
- `generatedAt`: snapshot creation timestamp.
- `degradedReasons[]`: user-facing degraded-state explanations.

## Empty and Degraded States

- Empty state explains that no local or cloud sessions exist yet.
- Degraded state explains when cloud storage or provider wiring is unavailable.
- Waiting sessions are surfaced as blocked work so they do not disappear inside the active list.
