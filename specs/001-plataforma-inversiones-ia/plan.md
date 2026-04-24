# Implementation Plan: Plataforma de Inversiones con IA (DR.FIC)

**Branch**: `[001-plataforma-inversiones-ia]` | **Date**: 2026-04-23 | **Spec**: [spec.md](./spec.md)
**Input**: Technical plan from `/.drfic/diana-sdk/specs/001-plan-drfic.md` plus canonical feature specification from `/specs/001-plataforma-inversiones-ia/spec.md`

**Note**: This plan captures Phase 0 research and Phase 1 design outputs only.

## Summary

Plan the implementation of a professional investment platform that keeps the canonical SPEC-001 scope intact while using the DR.FIC technical plan as direct planning input. The solution will use a constitution-aligned split architecture with a web frontend, a REST API backend, persistent operational storage, explainable AI-assisted analytics, optional retrieval context for AI efficiency, broker integrations, and full auditability around signals, recommendations, approvals, and assisted execution.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18, Node.js 22 LTS  
**Primary Dependencies**: Vite, React, Zustand, TailwindCSS, TradingView Lightweight Charts, Express, Supabase client, optional MongoDB driver, Claude API client, broker SDKs for IBKR and Alpaca  
**Storage**: Supabase as primary operational store; optional MongoDB for historical analytics payloads and AI context archives; optional vector retrieval store for RAG-style contextual enrichment when AI cost or precision requires it  
**Testing**: Vitest, React Testing Library, Supertest, contract tests for auth and broker adapters  
**Target Platform**: Modern browser PWA plus Linux-hosted Node.js REST API  
**Project Type**: Web application with strict frontend/backend separation  
**Performance Goals**: Dashboard and review views load actionable data within 2 seconds under normal conditions; authenticated API p95 <= 300 ms excluding external provider latency; backend monthly availability >= 99.5%  
**Constraints**: No autonomous execution; AI is advisory only; every order requires explicit manual approval; failed broker attempts require new approval before retry; server-side persistence only; credentials only in environment configuration; audit evidence retention >= 365 days  
**Scale/Scope**: v1 covers US equities and options, explainable multi-core signal generation, professional internal users, IBKR and Alpaca integrations, ranked opportunities, reporting, and audit trails

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate Review

| Gate | Requirement | Status | Notes |
|------|-------------|--------|-------|
| G1 | Human approval is mandatory for execution | PASS | Plan preserves per-order manual approval and forbids auto-trading. |
| G2 | AI acts only as confirmer and evaluator | PASS | AI remains advisory and cannot submit or authorize orders. |
| G3 | Cores must stay decoupled and explainable | PASS | Design separates signal evidence, confluence, and AI reasoning. |
| G4 | PWA and REST API must be separated | PASS | Source structure uses dedicated `frontend/` and `backend/` applications. |
| G5 | Broker logic must be adapter-based | PASS | Contracts define a stable broker adapter boundary. |
| G6 | Security and persistence remain server-side | PASS | JWT validation, audit persistence, and secret handling remain backend-only. |
| G7 | Observability, evidence, and testing are mandatory | PASS | Research and contracts include audit events, failure tracking, and test layers. |
| G8 | Planning remains within Picoro scope | PASS | Artifacts stay at research/design level with no implementation code. |

### Post-Design Gate Review

| Gate | Status | Notes |
|------|--------|-------|
| G1-G8 | PASS | `research.md`, `data-model.md`, `contracts/`, and `quickstart.md` are aligned with the constitution and the DR.FIC technical plan. |

## Project Structure

### Documentation (this feature)

```text
specs/001-plataforma-inversiones-ia/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── auth-context.md
│   ├── broker-adapter.md
│   └── signal-lifecycle.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   ├── auth/
│   ├── domain/
│   ├── integrations/
│   │   ├── ai/
│   │   ├── brokers/
│   │   ├── market-data/
│   │   └── persistence/
│   ├── services/
│   └── observability/
└── tests/
    ├── contract/
    ├── integration/
    └── unit/

frontend/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── dashboard/
│   │   ├── signals/
│   │   ├── recommendations/
│   │   ├── reports/
│   │   └── portfolio/
│   ├── services/
│   └── stores/
└── tests/
    ├── integration/
    └── unit/
```

**Structure Decision**: Use a two-application web structure because the constitution requires separation between the PWA and the REST API, and the DR.FIC technical plan explicitly models frontend, backend, storage, AI services, and external integrations as separate architectural components.

## Complexity Tracking

No constitutional exceptions are required for this plan.