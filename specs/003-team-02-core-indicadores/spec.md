# Feature Specification: Core de Indicadores Tecnicos + Chat IA (TEAM-02 CocaDe6Lts)

**Feature Branch**: `003-team-02-core-indicadores`
**Created**: 2026-05-19
**Status**: Draft
**Equipo**: TEAM-02 CocaDe6Lts (Hansel lead, Edgar, Kevin, Mauricio)
**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Fuente canonica**: `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-02/spec.md`
**Cobertura canonica**: preserved RF-001..RF-006, RNF-001..RNF-005; expanded con user stories, acceptance scenarios y contratos operativos.

**Input**: Implementar el core de indicadores tecnicos (EMA, MACD, ADX, RSI, Bollinger Bands) sobre series OHLC, un motor de confluencia tecnica que consolida sus salidas y un Chat IA explicativo que justifica cada señal sin ejecutar operaciones. Exponer endpoints REST consumibles por el dashboard de TEAM-01 y por otros cores.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Calcular indicadores de momentum sobre un instrumento (Priority: P1)

Como analista del dashboard, quiero solicitar al backend los valores actuales y la serie historica de RSI y MACD para un instrumento y timeframe dados, de forma que pueda evaluar momentum y divergencias sin tener que calcularlos en el cliente.

**Why this priority**: Momentum (RSI/MACD) es la base operativa minima para que el dashboard muestre señales explicables. Sin este slice, el motor de confluencia no tiene insumo y el Chat IA no tiene que explicar. Es el slice de Kevin y desbloquea a Mauricio.

**Independent Test**: Llamar `GET /api/indicators/rsi?symbol=AAPL&timeframe=1h&period=14` y `GET /api/indicators/macd?symbol=AAPL&timeframe=1h` y verificar valores coherentes contra una serie OHLC de referencia. Sin frontend, validable por contract test.

**Acceptance Scenarios**:

1. **Given** una serie OHLC valida de al menos 30 velas para AAPL en 1h, **When** se solicita RSI con periodo 14, **Then** la respuesta incluye el valor actual entre 0 y 100, la serie historica alineada por timestamp y la zona (oversold/neutral/overbought).
2. **Given** una serie OHLC valida, **When** se solicita MACD con parametros default (12,26,9), **Then** la respuesta incluye linea MACD, linea señal, histograma y deteccion de cruce alcista/bajista en la ultima vela.
3. **Given** un symbol no soportado o sin datos, **When** se solicita cualquier indicador, **Then** la respuesta es 404 con cuerpo `{ error_code, message, hint }` y no se devuelve serie vacia silenciosa.
4. **Given** parametros invalidos (period <= 0, timeframe no soportado), **When** se solicita el indicador, **Then** la respuesta es 400 con detalle de campo invalido.

---

### User Story 2 - Calcular indicadores de tendencia y volatilidad (Priority: P1)

Como analista del dashboard, quiero solicitar EMA, ADX y Bollinger Bands para un instrumento y timeframe dados, de forma que pueda evaluar direccion, fuerza de tendencia y rangos de volatilidad.

**Why this priority**: Tendencia y volatilidad son las otras dos dimensiones que junto con momentum forman la confluencia minima. Slice de Edgar. Independiente del slice de Kevin: cada indicador es un endpoint propio.

**Independent Test**: Llamar `GET /api/indicators/ema?symbol=AAPL&timeframe=1h&period=20`, `/adx`, `/bollinger` y validar contra serie de referencia.

**Acceptance Scenarios**:

1. **Given** una serie OHLC con N >= period velas, **When** se solicita EMA con period=20, **Then** la respuesta incluye serie alineada y el valor actual numerico finito.
2. **Given** una serie con N >= 28 velas, **When** se solicita ADX con period=14, **Then** la respuesta incluye ADX, +DI, -DI y clasifica la tendencia como (sin_tendencia | debil | fuerte | muy_fuerte) segun umbrales documentados.
3. **Given** una serie OHLC, **When** se solicita Bollinger con period=20 y stdDev=2, **Then** la respuesta incluye banda superior, media, banda inferior y ancho de banda relativo.

---

### User Story 3 - Confluencia tecnica consolidada (Priority: P2)

Como dashboard, quiero un endpoint unico que consolide los 5 indicadores en una señal tecnica explicable (alcista / neutral / bajista) con score y desglose por indicador, para no tener que orquestar las 5 llamadas y aplicar reglas en el cliente.

**Why this priority**: Es el "producto" del equipo. Depende de US1 y US2. Slice de Mauricio.

**Independent Test**: `GET /api/indicators/confluence?symbol=AAPL&timeframe=1h` retorna `{ verdict, score, components: [...], inputs_used, computed_at }` y se valida contra casos sinteticos con resultados conocidos.

**Acceptance Scenarios**:

1. **Given** los 5 indicadores responden correctamente, **When** se solicita confluencia, **Then** la respuesta incluye verdict consolidado, score numerico [-1, 1] y desglose por indicador con peso aplicado.
2. **Given** uno de los 5 indicadores no esta disponible, **When** se solicita confluencia, **Then** la respuesta degrada explicitamente (campo `degraded: true` y lista de indicadores faltantes) sin fallar.
3. **Given** la misma serie OHLC en dos llamadas consecutivas, **When** se calcula confluencia, **Then** el resultado es identico (idempotencia/reproducibilidad).

---

### User Story 4 - Chat IA explicativo de la señal (Priority: P2)

Como usuario operativo, quiero preguntar al Chat IA por que la señal tecnica actual de AAPL es alcista, y recibir una explicacion en lenguaje natural basada en los valores reales de los 5 indicadores y sus contribuciones, sin que la IA sugiera ejecutar operaciones.

**Why this priority**: Es el diferenciador de explicabilidad. Depende de US3. Slice de Hansel.

**Independent Test**: `POST /api/chat/explain { symbol, timeframe, question }` retorna texto explicativo con citaciones a los valores numericos usados y disclaimer no operativo.

**Acceptance Scenarios**:

1. **Given** confluencia disponible para AAPL 1h, **When** el usuario pregunta "por que esta alcista?", **Then** la respuesta menciona al menos 3 de los 5 indicadores con sus valores numericos y la regla por la que contribuyen.
2. **Given** cualquier pregunta de usuario, **When** la respuesta se genera, **Then** incluye el disclaimer constitucional "esta explicacion no constituye orden ni recomendacion ejecutable".
3. **Given** una pregunta fuera de scope (p.ej. "ejecuta una orden"), **When** se procesa, **Then** la IA rechaza explicitamente y redirige a explicacion.

---

### Edge Cases

- Serie OHLC con gaps (festivos, fines de semana): el calculo respeta el orden temporal real, no rellena con ceros.
- Serie con N < period requerido: respuesta 422 con mensaje `insufficient_data` y el N minimo requerido.
- Timeframe no soportado por la fuente de datos: 400 con lista de timeframes validos.
- Symbol existe pero sin datos para el rango: 404 (no 200 con serie vacia).
- Cambio de zona horaria del servidor: timestamps siempre en UTC con sufijo Z.
- Llamadas concurrentes al mismo simbolo: cache de calculo por (symbol, timeframe, params, last_bar_ts) para evitar recomputo.
- Chat IA recibe pregunta en idioma distinto al español: responde en español por constitucion.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST calcular RSI (period configurable, default 14) sobre series OHLC y exponerlo via REST.
- **FR-002**: El sistema MUST calcular MACD (fast/slow/signal configurables, defaults 12/26/9), incluyendo deteccion de cruces, y exponerlo via REST.
- **FR-003**: El sistema MUST calcular EMA (period configurable, default 20) sobre la columna close y exponerla via REST.
- **FR-004**: El sistema MUST calcular ADX con +DI y -DI (period default 14) y clasificacion de fuerza de tendencia, y exponerlo via REST.
- **FR-005**: El sistema MUST calcular Bollinger Bands (period default 20, stdDev default 2) y exponerlas via REST.
- **FR-006**: El sistema MUST consolidar los 5 indicadores en un endpoint de confluencia con verdict, score y desglose.
- **FR-007**: El sistema MUST exponer un endpoint de Chat IA que reciba una pregunta y devuelva explicacion basada en los valores reales de los indicadores, con disclaimer no operativo.
- **FR-008**: El sistema MUST mantener trazabilidad completa: input OHLC usado, parametros, version del algoritmo, timestamp de calculo, en cada respuesta.
- **FR-009**: El sistema MUST validar parametros de entrada y devolver errores 400/404/422 con cuerpo estructurado (`error_code`, `message`, `hint`).
- **FR-010**: Los endpoints MUST autenticar via JWT/Supabase (reutilizando el middleware existente en `projects/rest-api/inversions_api`).
- **FR-011**: El Chat IA MUST rechazar cualquier solicitud que implique ejecucion de ordenes y MUST redirigir a explicacion.
- **FR-012**: El sistema MUST publicar contratos OpenAPI/JSON Schema de cada endpoint en `specs/003-team-02-core-indicadores/contracts/`.
- **FR-013**: El sistema MUST exponer un health endpoint del core (`GET /api/indicators/health`) que reporte disponibilidad de fuente OHLC y dependencias.

### Key Entities

- **OhlcBar**: representa una vela. Atributos: timestamp (UTC), open, high, low, close, volume, symbol, timeframe.
- **IndicatorResult**: resultado de un indicador. Atributos: symbol, timeframe, indicator_name, params, current_value, series, computed_at, version_algoritmo, source_input_hash.
- **ConfluenceVerdict**: salida consolidada. Atributos: symbol, timeframe, verdict (alcista|neutral|bajista), score [-1,1], components[], degraded, computed_at.
- **ChatExplanationRequest**: question, symbol, timeframe, optional context.
- **ChatExplanationResponse**: explanation_text, indicators_cited[], disclaimer, model_version, computed_at.

## Experience & Component Contract *(este feature es API-first, no UI)*

No aplica como UI propia. El consumidor primario es el dashboard de TEAM-01 (feature `002-team-01-dashboard-brokers`). El contrato visible es el OpenAPI bajo `contracts/`.

### Runtime Modes & Source Selection

- **Mode Online**: OHLC desde fuente broker priorizada (delegada a TEAM-01 via servicio `market-data`).
- **Mode Offline/Demo**: OHLC desde cache local Supabase (tabla `ohlc_bars`).
- Seleccion via header `X-Runtime-Mode` o env `RUNTIME_MODE`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los 5 indicadores individuales devuelven resultado en < 200 ms p95 para series de hasta 500 velas, en Mode Offline.
- **SC-002**: El endpoint de confluencia devuelve resultado en < 500 ms p95 (compuesto de los 5).
- **SC-003**: Los valores calculados coinciden con una libreria de referencia (p.ej. `technicalindicators` npm) con tolerancia <= 1e-6 en al menos 95% de casos de prueba sinteticos.
- **SC-004**: El Chat IA cita correctamente al menos 3 de los 5 indicadores en >= 90% de respuestas evaluadas.
- **SC-005**: 100% de respuestas del Chat IA incluyen el disclaimer constitucional no operativo.
- **SC-006**: Cobertura de tests unitarios >= 80% en los modulos de calculo.

## Assumptions

- La fuente de OHLC (broker o cache Supabase) ya esta resuelta por TEAM-01 y se consume como servicio interno.
- El middleware de auth JWT/Supabase existente (`projects/rest-api/inversions_api/src/middleware`) se reutiliza sin cambios.
- El LLM para Chat IA es invocado via SDK Anthropic/Supabase Edge (proveedor a confirmar en clarify); el equipo no implementa el modelo, solo el orquestador de prompt.
- El idioma de las explicaciones del Chat IA es español por constitucion.
- Los timeframes inicialmente soportados: 1m, 5m, 15m, 1h, 4h, 1d.
- El feature reside dentro del workspace existente `projects/rest-api/inversions_api`; no se crea nuevo servicio.

## Dependencias y Coordinacion Inter-Equipo

- **TEAM-01 (DIANArchiTEC)**: provee servicio de market-data (OHLC) y schema base en Supabase. Bloqueante para Mode Online.
- **Dashboard (TEAM-01 feature 002)**: consumidor primario de los contratos publicados aqui.
- **Cores de estrategia (TEAM-03..09)**: consumidores secundarios del endpoint de confluencia.

## Reparto Operativo del Equipo TEAM-02

| Integrante | Slice | User Stories | FRs principales |
|---|---|---|---|
| **Kevin** | Momentum: RSI + MACD + endpoints | US1 | FR-001, FR-002, FR-009, FR-010, FR-012 (RSI/MACD) |
| **Edgar** | Tendencia/Volatilidad: EMA + ADX + BB + endpoints | US2 | FR-003, FR-004, FR-005, FR-012 (EMA/ADX/BB) |
| **Mauricio** | Motor de confluencia + trazabilidad + health | US3 | FR-006, FR-008, FR-013 |
| **Hansel (lead)** | Chat IA explicativo + tests integracion + coordinacion | US4 | FR-007, FR-011, SC-004, SC-005 |

## Cobertura Canonica (input: teams/TEAM-02/spec.md)

| Item canonico | Estado | Mapeo |
|---|---|---|
| RF-001 core indicadores | preserved | FR-001..FR-005 |
| RF-002 EMA/MACD/ADX/RSI/BB | preserved | FR-001..FR-005 |
| RF-003 motor de confluencia | preserved | FR-006 |
| RF-004 endpoints para dashboard | expanded | FR-001..FR-007, contracts/ |
| RF-005 Chat IA explicativo | preserved | FR-007, FR-011 |
| RF-006 trazabilidad | preserved | FR-008 |
| RNF-001 IA no ejecuta | preserved | FR-011 |
| RNF-002 reproducibilidad | preserved | US3 scenario 3, SC-003 |
| RNF-003 desacoplado del frontend | preserved | API-first |
| RNF-004 auditabilidad | preserved | FR-008 |
| RNF-005 latencia interactiva | preserved | SC-001, SC-002 |
| dropped | (ninguno) | -- |

## Clarifications Pendientes

- [NEEDS CLARIFICATION] Proveedor LLM concreto (Anthropic Claude vs OpenAI vs Supabase Edge + Llama) y modelo objetivo.
- [NEEDS CLARIFICATION] Fuente exacta de OHLC en Mode Online: ¿IBKR via TEAM-01, Alpaca, ambos, fallback?
- [NEEDS CLARIFICATION] Politica de cache: TTL y clave por (symbol, timeframe, last_bar_ts).
- [NEEDS CLARIFICATION] Limites de rate por usuario en endpoints del core.
- [NEEDS CLARIFICATION] Persistencia de explicaciones del Chat IA: ¿se guardan para auditoria?
