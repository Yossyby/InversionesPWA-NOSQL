# Research: Plataforma de Inversiones con IA (DR.FIC)

## Decision 1: Keep the architecture split into frontend, backend, storage, AI services, and external integrations

- Decision: Implement the platform as a React-based web frontend, a Node.js + Express backend API, operational persistence, AI services, and external provider integrations.
- Rationale: The DR.FIC technical plan already defines these as the core logical components, and the constitution requires strict separation between UI and REST responsibilities.
- Alternatives considered:
  - Single-process application with mixed concerns: rejected because it weakens architectural isolation and observability.
  - Frontend-only architecture with direct external calls: rejected because persistence, broker security, and auditability must remain server-side.

## Decision 2: Treat Supabase as primary storage and keep MongoDB and vector retrieval optional supporting stores

- Decision: Use Supabase for operational entities and relational integrity; reserve MongoDB and vector retrieval storage for optional historical analytics, reasoning archives, and AI context retrieval.
- Rationale: The canonical specification names Supabase as primary and MongoDB as optional, while the DR.FIC plan introduces RAG/vector capabilities as a cost and precision optimization rather than a mandatory core dependency.
- Alternatives considered:
  - Use MongoDB as the only store: rejected because it conflicts with the canonical spec.
  - Exclude optional historical/context stores entirely: rejected because the technical plan explicitly includes them as strategic support for AI efficiency.

## Decision 3: Model AI as a bounded advisory subsystem with optional retrieval support

- Decision: Place AI behind a dedicated backend integration layer that consumes platform data, optional retrieval context, and produces recommendations, summaries, and risk explanations without execution authority.
- Rationale: This matches both the constitution and the DR.FIC plan, which positions AI as analytical assistance and not as an autonomous actor.
- Alternatives considered:
  - AI directly embedded in the frontend: rejected because secrets, policy enforcement, and cost controls must remain server-side.
  - AI as the main source of trading decisions: rejected because AI cannot be the unique source of truth.

## Decision 4: Standardize broker integrations behind internal adapters

- Decision: Encapsulate IBKR and Alpaca behind stable adapter contracts for connectivity, market data, portfolio sync, order preparation, submission, and normalized execution outcomes.
- Rationale: The constitution requires replaceable broker integrations and the specification explicitly includes both brokers in v1.
- Alternatives considered:
  - Call broker SDKs directly from business services: rejected because it couples platform logic to provider-specific behavior.
  - Implement only one broker in the architecture baseline: rejected because both are in scope for v1 planning.

## Decision 5: Use explainable signal lifecycle records as the unit of traceability

- Decision: Anchor the design on signal lifecycle records that connect analytical evidence, AI enrichment, human review, approval, execution attempts, and audit evidence.
- Rationale: The canonical specification requires explainable signals, traceability by ticket, and evidence for each operational decision.
- Alternatives considered:
  - Persist only final recommendations: rejected because it erases explainability.
  - Keep AI reasoning separate from signal lifecycle records: rejected because it weakens auditability.

## Decision 6: Normalize failure handling and operational observability from the start

- Decision: Model broker failures, AI failures, and external data-provider failures as first-class observable events with normalized statuses, audit emission, and retry rules bounded by human approval.
- Rationale: The technical plan emphasizes observability and the clarified specification requires failed broker attempts to force a fresh approval cycle.
- Alternatives considered:
  - Ad hoc logging without normalized lifecycle states: rejected because it weakens operational control.
  - Automatic broker retries: rejected because it violates the explicit human-control rule.

## Decision 7: Plan implementation in phased technical slices aligned to the DR.FIC technical plan

- Decision: Use five planning slices: foundations, investment core, AI integration, visualization/reporting, and security/scalability.
- Rationale: The input technical plan already defines these phases and they map well to a later tasks breakdown without redefining business scope.
- Alternatives considered:
  - Feature slices only by UI screen: rejected because the current input is a technical plan, not a UX plan.
  - Infrastructure-first planning with no feature progression: rejected because it would obscure delivery sequencing.