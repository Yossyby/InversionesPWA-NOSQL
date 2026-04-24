# Contract: Broker Adapter

## Purpose

Define the stable internal adapter interface for supported brokers.

## Supported Brokers

- `IBKR`
- `ALPACA`

## Required Capabilities

1. Connectivity validation
2. Market data retrieval
3. Portfolio synchronization
4. Assisted order preparation
5. Approved order submission
6. Execution status normalization
7. Technical failure normalization

## Invariants

- Broker-specific SDK behavior is isolated inside the adapter layer.
- No adapter may submit an order that lacks explicit manual approval.
- Timeouts and technical rejections normalize to a failed execution attempt.
- Any retry requires a fresh approval cycle.