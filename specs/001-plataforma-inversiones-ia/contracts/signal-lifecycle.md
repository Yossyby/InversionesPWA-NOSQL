# Contract: Signal Lifecycle

## Purpose

Define the shared lifecycle contract for signals, recommendations, approvals, and assisted execution.

## Lifecycle Stages

1. Signal evidence is produced by active analytical cores.
2. Confluence or aggregate evaluation is computed.
3. AI optionally enriches the record with explanation and risk context.
4. The user reviews the signal and recommendation.
5. The user approves or rejects a specific execution intent.
6. The backend submits only approved intents through a broker adapter.
7. The resulting execution outcome is persisted and audited.

## Invariants

- A signal must remain explainable through its evidence records.
- AI cannot be the sole basis for execution.
- Every execution requires explicit human approval.
- A failed execution attempt requires a new approval before retry.
- Lifecycle evidence is retained for at least 365 days.