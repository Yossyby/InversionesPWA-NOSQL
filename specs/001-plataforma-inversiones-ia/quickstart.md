# Quickstart: Plataforma de Inversiones con IA (DR.FIC)

## Purpose

Describe the recommended implementation starting sequence after plan approval.

## 1. Create the application layout

Set up:

```text
frontend/
backend/
specs/001-plataforma-inversiones-ia/
```

## 2. Establish backend foundations first

Start with:

1. JWT validation and active-user resolution
2. Supabase operational persistence
3. Optional MongoDB and retrieval-context support boundaries
4. Broker adapter interfaces for IBKR and Alpaca
5. Audit logging and observability baseline

## 3. Add frontend review surfaces

Continue with:

1. Dashboard and ranked opportunities views
2. Signal detail and explainability views
3. Recommendation review surfaces
4. Assisted execution approval flow
5. Reporting and historical traceability views

## 4. Implement by technical phases

Follow the DR.FIC technical plan sequence:

1. Foundations
2. Investment core
3. AI integration
4. Visualization and reports
5. Security and scalability hardening

## 5. Validate critical constraints continuously

- No auto-trading in v1
- AI remains advisory only
- Every order requires explicit approval
- Failed broker attempts require new approval
- Audit evidence retention is at least 365 days
- Availability target remains 99.5% monthly or better