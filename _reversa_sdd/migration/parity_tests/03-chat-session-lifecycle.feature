# language: en
# spec-id: PT-003
# traceability:
#   flowcharts: _reversa_sdd/flowcharts/agent-chat.md (session FSM)
#   target_architecture: BC-03 agents (AGG-ChatSession)
#   business_rules: R-AC-1, R-AC-2, R-AC-8
#   paradigma_alvo: OO-with-DI; FSM as sealed class (AD-03) — behavioral parity
Feature: Agent chat session lifecycle
  As a developer running agents in chat
  I want session terminal states, follow-up queueing, and target immutability preserved
  So that the migrated plugin behaves identically to the legacy

  @paridade @critico
  Scenario: Terminal states are absorbing and a new run creates a new session
    Given a chat session in terminal state "completed"
    When a new run is started
    Then a new session is created with a new id
    And the terminal session is never reused

  @paridade
  Scenario: At most one follow-up may be queued while a turn is in flight
    Given a chat session with a turn in flight and one queued follow-up
    When a second follow-up is submitted
    Then the second submit is rejected

  @paridade
  Scenario: Execution target is immutable after the first turn
    Given a chat session that has already run one turn with target "local"
    When the execution target is changed to "worktree"
    Then the change is rejected
    And the target remains "local"
