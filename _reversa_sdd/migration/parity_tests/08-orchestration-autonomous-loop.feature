# language: en
# spec-id: PT-008
# traceability:
#   flowcharts: _reversa_sdd/flowcharts/orchestration.md (autonomous loop)
#   target_architecture: BC-05 orchestration (AGG-OrchestrationSnapshot)
#   business_rules: R-OR-1, R-OR-3, R-OR-4 (+ D-2/D-3 decided fixes)
#   paradigma_alvo: internally event-driven; canonical session store + terminal-state set
Feature: Orchestration autonomous loop and dashboard
  As a developer using MAESTRO
  I want task claiming, the autonomous loop, and bucket sorting preserved
  So that the migrated orchestration behaves identically

  @paridade @critico
  Scenario: claimTask rejects an already-running task
    Given a task already in a running state
    When claimTask is invoked for that task
    Then the claim is rejected

  @paridade
  Scenario: A second concurrent task is rejected unless parallelizable
    Given one task already running and not marked parallelizable
    When a second task is claimed
    Then the second claim is rejected

  @paridade @ordem
  Scenario: Dashboard buckets are ranked active, waiting, completed, failed
    Given sessions across all four buckets
    When the orchestration snapshot is built
    Then sessions are sorted by bucket rank then by lastVisibleActivityAt descending

  @paridade @critico
  Scenario: A task reaching a terminal state fires the orchestration hook
    Given the autonomous loop builds a session via the canonical session store
    When the task reaches "completed" in the terminal-state set
    Then an "orchestration.task-completed" hook trigger fires with the task JSON
    And the invalid "error" state is never used as a completion signal
