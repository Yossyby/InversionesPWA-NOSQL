# Tasks: Core de Indicadores Tecnicos + Chat IA (TEAM-02)

**Feature**: 003-team-02-core-indicadores
**Equipo**: TEAM-02 CocaDe6Lts
**Source**: `./spec.md` + `./plan.md` + `teams/TEAM-02/tasks.md` (canon)

## Convencion

- `[P]` = paralelizable con otra `[P]` del mismo bloque (sin dependencias).
- Owner: K=Kevin, E=Edgar, M=Mauricio, H=Hansel.
- Estado inicial: `[ ]` pendiente, `[x]` completo, `[~]` en progreso.

---

## Phase 0: Setup

- [x] **T000** Crear estructura de specs (`spec.md`, `plan.md`, `contracts/`). Owner: H.

## Phase 1: Tipos compartidos y fuente OHLC (bloqueante)

- [x] **T001** Crear `src/modules/indicators/types.ts` con `OhlcBar`, `IndicatorResult`, `ConfluenceVerdict`, `IndicatorError`. Owner: K (compartido).
- [x] **T002** Crear `src/modules/indicators/ohlcSource.ts` con `getCandles(symbol, timeframe, count)` reusando logica determinista de `routes/market-data/ohlc.ts`. Owner: K (compartido).
- [x] **T003** Crear helper `src/modules/indicators/errors.ts` con `respondError(res, status, code, message, hint)`. Owner: K (compartido).

## Phase 2: Indicadores individuales (paralelo)

### Slice KEVIN (Momentum)

- [x] **T010** [P] Implementar `src/modules/indicators/rsi.ts` (funcion pura). Owner: K.
- [x] **T011** [P] Tests unitarios `tests/unit/indicators/rsi.test.ts` (valor conocido, edge cases). Owner: K.
- [x] **T012** [P] Implementar `src/modules/indicators/macd.ts` (linea MACD, señal, histograma, deteccion de cruces). Owner: K.
- [x] **T013** [P] Tests unitarios `tests/unit/indicators/macd.test.ts`. Owner: K.
- [x] **T014** Ruta `src/routes/indicators/rsi.ts` (`GET /api/indicators/rsi`). Owner: K. Depende: T010, T002, T003.
- [x] **T015** Ruta `src/routes/indicators/macd.ts` (`GET /api/indicators/macd`). Owner: K. Depende: T012, T002, T003.
- [x] **T016** Tests integracion `tests/integration/indicators/rsiRoute.test.ts`. Owner: K.
- [x] **T017** Tests integracion `tests/integration/indicators/macdRoute.test.ts`. Owner: K.
- [x] **T018** Contrato OpenAPI `contracts/rsi.openapi.yaml`. Owner: K.
- [x] **T019** Contrato OpenAPI `contracts/macd.openapi.yaml`. Owner: K.
- [x] **T020** Registrar routers en `src/index.ts`. Owner: K.

### Slice EDGAR (Tendencia/Volatilidad)

- [x] **T030** [P] `src/modules/indicators/ema.ts` + tests + ruta + contrato. Owner: E.
- [x] **T031** [P] `src/modules/indicators/adx.ts` + tests + ruta + contrato. Owner: E.
- [x] **T032** [P] `src/modules/indicators/bollinger.ts` + tests + ruta + contrato. Owner: E.
- [x] **T033** Registrar routers en `src/index.ts`. Owner: E.

### Slice MAURICIO (Confluencia + Trazabilidad + Health)

- [x] **T040** `src/modules/indicators/confluence.ts` (consume los 5, score [-1,1], degradacion). Owner: M. Depende: T010, T012, T030, T031, T032.
- [x] **T041** Tests unitarios `tests/unit/indicators/confluence.test.ts`. Owner: M.
- [x] **T042** Ruta `src/routes/indicators/confluence.ts`. Owner: M.
- [x] **T043** Tests integracion `tests/integration/indicators/confluenceRoute.test.ts`. Owner: M.
- [x] **T044** Ruta `src/routes/indicators/health.ts` (`GET /api/indicators/health`). Owner: M.
- [x] **T045** Helper `source_input_hash` + `algorithm_version` consolidado en `types.ts` (`ConfluenceVerdict` con `source_input_hash`, `algorithm_version`, `bars_used`). Owner: M.
- [x] **T046** Contrato OpenAPI `contracts/confluence.openapi.yaml`. Owner: M.

### Slice HANSEL (Chat IA + Tests Cross)

- [x] **T050** `src/modules/indicators/chatExplainer.ts` con interfaz `LlmExplainer` neutral. Owner: H.
- [x] **T051** Implementacion concreta (provider a definir en clarify): mock determinista en CI (`DeterministicMockExplainer`). Owner: H.
- [x] **T052** Ruta `src/routes/indicators/chatExplain.ts` (`POST /api/chat/explain`). Owner: H.
- [x] **T053** Tests integracion (incluye disclaimer obligatorio y rechazo de ejecucion). Owner: H.
- [x] **T054** Contrato OpenAPI `contracts/chat-explain.openapi.yaml`. Owner: H.
- [x] **T055** Test e2e que ejercite: ohlc -> 5 indicadores -> confluencia -> chat. Owner: H. Depende: todos.

## Phase 3: Cobertura y calidad

- [x] **T060** Cobertura unit >= 80% en `modules/indicators/` (94.75% stmts / 97.02% lines, `--coverage`). Owner: H.
- [x] **T061** Validar FIC comments en archivos nuevos (`npm run lint:fic` OK). Owner: H.
- [x] **T062** `npm run -w @inversions/rest-api lint` sin errores. Owner: H.

## Phase 4: Clarifications pendientes (NO bloquean Phase 2)

- [ ] **T070** Resolver proveedor LLM y modelo (clarify). Owner: H + lead.
- [ ] **T071** Resolver fuente real OHLC (clarify con TEAM-01). Owner: M.
- [ ] **T072** Resolver politica de cache y rate limit. Owner: K.

---

## Resumen de progreso

- Completado: T000-T003, T010-T020 (slice Kevin + infra compartida).
- Completado: T030-T033 (slice Edgar: EMA, ADX, Bollinger + rutas + contratos).
- Completado: T040-T046 (slice Mauricio: confluencia, health, trazabilidad + contrato).
- Completado: T050-T055 (slice Hansel: Chat IA explicativo + e2e).
- Completado: T060-T062 (cobertura 94.75% en `modules/indicators/`, lint y lint:fic OK).
- Suite completa: 177 tests en verde (31 archivos).
- Pendiente: T070-T072 (clarifications — no bloquean Phase 2/3).
