# language: en
# spec-id: PT-004
# traceability:
#   flowcharts: _reversa_sdd/flowcharts/agent-chat.md (pending-write gate)
#   target_architecture: BC-03 agents (AGG-ChatSession.PendingWrite)
#   business_rules: R-AC-3 (cloud read-only), pending-write approval
#   paradigma_alvo: OO-with-DI — behavioral parity
Feature: Pending-write approval gate
  As a developer reviewing agent edits
  I want buffered writes to block execution until I accept or reject them
  So that the migrated plugin preserves the safety gate

  @paridade @critico
  Scenario: A pending write blocks agent execution until settled
    Given a chat session with a buffered writeTextFile request
    When the agent attempts to continue
    Then execution is blocked until the pending write is accepted or rejected

  @paridade
  Scenario: Accepting a pending write applies it and unblocks execution
    Given a chat session with a pending write awaiting decision
    When the pending write is accepted
    Then the write is applied
    And agent execution resumes

  @paridade
  Scenario: Cloud sessions reject input
    Given a cloud chat session marked read-only
    When a follow-up is submitted
    Then the submit is rejected with the read-only reason
