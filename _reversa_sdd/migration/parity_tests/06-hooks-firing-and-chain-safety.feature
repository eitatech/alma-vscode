# language: en
# spec-id: PT-006
# traceability:
#   flowcharts: _reversa_sdd/flowcharts/hooks.md (trigger -> action)
#   target_architecture: BC-02 automation (AGG-Hook); message bus (AD-04)
#   business_rules: R-HK-1, R-HK-2, R-HK-3, R-HK-5
#   paradigma_alvo: internally event-driven -> IntelliJ message bus
Feature: Hook firing and chain safety
  As a developer automating SDD operations
  I want hooks to fire deterministically with chain safety preserved
  So that the migrated event engine behaves identically

  @paridade @ordem
  Scenario: Matched hooks fire in createdAt order
    Given two hooks bound to the same agent, operation, and timing
    When the operation completes
    Then both hooks fire in ascending createdAt order

  @paridade
  Scenario: Blocking only happens for before-timing with waitForCompletion
    Given a hook with timing "before" and waitForCompletion set
    When the operation is about to start
    Then the agent waits for the hook to complete before proceeding

  @paridade @idempotencia
  Scenario: A circular hook chain is blocked
    Given hook A that would trigger hook B which would re-trigger hook A
    When hook A fires
    Then the executedHooks set blocks the re-entry of hook A
    And the chainDepth never exceeds 10

  @paridade
  Scenario: Strict variable gating rejects out-of-scope variables at save
    Given a hook action referencing a variable not in its trigger availableFor set
    When the hook is saved
    Then the save is rejected with a variable-gating error
