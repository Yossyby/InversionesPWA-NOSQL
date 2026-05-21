# Implementation Plan: Core de Indicadores Tecnicos + Chat IA (TEAM-02)

**Branch**: `003-team-02-core-indicadores` | **Date**: 2026-05-19 | **Spec**: `./spec.md`
**Equipo**: TEAM-02 CocaDe6Lts

## Summary

Implementar 5 indicadores tecnicos (RSI, MACD, EMA, ADX, Bollinger Bands), un motor de confluencia y un Chat IA explicativo, todo expuesto como endpoints REST en el workspace existente `projects/rest-api/inversions_api`. Cada indicador es modulo puro (calculo) + ruta Express (transporte), siguiendo el patron actual del repo. Confluencia compone los 5. Chat IA orquesta prompt + LLM y exige disclaimer no operativo.

## Technical Context

- **Language/Version**: TypeScript 5.6, Node 22.
- **Primary Dependencies**: express 4.21, vitest 4.1 (tests), supertest 7.2 (integration), jsonwebtoken 9 (auth), @supabase/supabase-js 2.105.
- **Storage**: Supabase (Postgres) para OHLC cache cuando llegue Mode Offline real; por ahora candles deterministas via mock.
- **Testing**: vitest (`npm test` en workspace `@inversions/rest-api`).
- **Target Platform**: Linux/Windows server, Node runtime.
- **Project Type**: web-service (extension de monorepo existente).
- **Performance Goals**: < 200 ms p95 por indicador individual con 500 velas; < 500 ms p95 confluencia compuesta.
- **Constraints**: respuestas deterministas (mismo input -> mismo output), timestamps UTC, JSON body con `error_code|message|hint` en errores.
- **Scale/Scope**: 5 indicadores + 1 confluencia + 1 chat = 7 endpoints REST; uso interno team monorepo + dashboard PWA.

## Constitution Check

- **Modelo semi-automatico**: OK. Los indicadores y confluencia solo evaluan; no emiten ordenes.
- **IA no ejecuta**: OK. Chat IA tiene gate `FR-011` que rechaza solicitudes ejecutables.
- **Cores desacoplados**: OK. Indicadores en `modules/indicators/`, sin acoplamiento a `modules/execution` ni `modules/brokers`.
- **Señales explicables y trazables**: OK. Cada respuesta incluye `params`, `algorithm_version`, `computed_at`, `source_input_hash`.
- **Idioma español**: artefactos Speckit en español; mensajes de error en español; comentarios FIC bilingues por convencion del repo.

## Data Source Routing & Runtime Modes

- **Source Domain `indicators`**: calculo local puro sobre candles OHLC. No depende de broker externo.
- **Source Domain `ohlc`** (insumo): Mode Online -> servicio `market-data` (delegado a TEAM-01, hoy mock determinista). Mode Offline -> mismo mock determinista (compatible).
- **Routing Rule**: el modulo `ohlcSource` lee `runtime mode` desde header `X-Runtime-Mode` o env `RUNTIME_MODE`; en ambos casos hoy retorna candles deterministas mientras TEAM-01 termina la fuente real.
- **Chat IA**: proveedor LLM a resolver en `/speckit.clarify`. Plan asume contrato neutral: `LlmExplainer.explain(prompt) -> { text, model, latency_ms }`.

## Project Structure

### Documentation (this feature)

```text
specs/003-team-02-core-indicadores/
├── plan.md          # este archivo
├── spec.md          # feature spec
├── contracts/       # OpenAPI/JSON Schema por endpoint
│   ├── rsi.openapi.yaml
│   ├── macd.openapi.yaml
│   ├── ema.openapi.yaml
│   ├── adx.openapi.yaml
│   ├── bollinger.openapi.yaml
│   ├── confluence.openapi.yaml
│   └── chat-explain.openapi.yaml
├── checklists/
└── tasks.md         # generado por /speckit.tasks
```

### Source Code (extension de monorepo existente)

```text
projects/rest-api/inversions_api/
├── src/
│   ├── modules/
│   │   └── indicators/                    # NUEVO modulo
│   │       ├── types.ts                   # OhlcBar, IndicatorResult, ConfluenceVerdict
│   │       ├── ohlcSource.ts              # adapter a market-data (mock por ahora)
│   │       ├── rsi.ts                     # KEVIN: calculo puro RSI
│   │       ├── macd.ts                    # KEVIN: calculo puro MACD
│   │       ├── ema.ts                     # EDGAR
│   │       ├── adx.ts                     # EDGAR
│   │       ├── bollinger.ts               # EDGAR
│   │       ├── confluence.ts              # MAURICIO
│   │       └── chatExplainer.ts           # HANSEL
│   └── routes/
│       └── indicators/
│           ├── catalog.ts                 # ya existe
│           ├── rsi.ts                     # KEVIN: ruta REST
│           ├── macd.ts                    # KEVIN: ruta REST
│           ├── ema.ts                     # EDGAR
│           ├── adx.ts                     # EDGAR
│           ├── bollinger.ts               # EDGAR
│           ├── confluence.ts              # MAURICIO
│           └── chatExplain.ts             # HANSEL
└── tests/
    ├── unit/indicators/
    │   ├── rsi.test.ts                    # KEVIN
    │   ├── macd.test.ts                   # KEVIN
    │   ├── ema.test.ts                    # EDGAR
    │   ├── adx.test.ts                    # EDGAR
    │   ├── bollinger.test.ts              # EDGAR
    │   └── confluence.test.ts             # MAURICIO
    └── integration/indicators/
        ├── rsiRoute.test.ts               # KEVIN
        ├── macdRoute.test.ts              # KEVIN
        ├── emaRoute.test.ts               # EDGAR
        ├── adxRoute.test.ts               # EDGAR
        ├── bollingerRoute.test.ts         # EDGAR
        ├── confluenceRoute.test.ts        # MAURICIO
        └── chatExplainRoute.test.ts       # HANSEL
```

**Structure Decision**: Extension del workspace `@inversions/rest-api` (no nuevo servicio). Cada indicador es par `(modules/indicators/<id>.ts, routes/indicators/<id>.ts)` siguiendo el patron de `routes/indicators/catalog.ts` y `routes/market-data/ohlc.ts`.

## Decisiones Tecnicas

1. **Calculo local puro**: cada indicador es funcion pura `(candles, params) => IndicatorResult`. No dependencias externas para calculo (evita acoplar a librerias hasta `/speckit.clarify`). Si SC-003 requiere tolerancia vs libreria de referencia, se compara en test contra `technicalindicators` npm en CI sin instalarla en runtime.
2. **OHLC source**: helper compartido `ohlcSource.getCandles(symbol, timeframe, count)` que hoy reutiliza la logica determinista de `routes/market-data/ohlc.ts`. Cuando TEAM-01 publique fuente real, solo cambia este modulo.
3. **Auth**: reutilizar `middleware/authContext.ts` global. Los endpoints de indicadores requieren `viewer|trader|admin`.
4. **Errores**: helper `respondError(res, status, code, message, hint)` para formato uniforme.
5. **Trazabilidad**: cada respuesta incluye `algorithm_version: "1.0.0"`, `computed_at: ISO`, `source_input_hash: sha256(candles_truncated)`.
6. **Confluencia degradada**: si un indicador falla, el endpoint retorna 200 con `degraded: true` y omite ese componente; nunca 500 por indicador faltante.

## Complexity Tracking

Sin violaciones constitucionales. No requiere justificacion adicional.
