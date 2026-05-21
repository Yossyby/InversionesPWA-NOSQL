# InversionesPWA-NOSQL — Core de Indicadores Tecnicos + Chat IA

**Equipo:** TEAM-02 CocaDe6Lts (Hansel *lead*, Edgar, Kevin, Mauricio)
**Feature:** `003-team-02-core-indicadores`
**Workspace backend:** `projects/rest-api/inversions_api` (npm workspace `@inversions/rest-api`)
**Stack:** Express 4 · TypeScript 5.6 · Vitest 4 · Supertest 7

Este repositorio contiene el monorepo completo. Este README documenta **lo que agrego
TEAM-02**: el core de indicadores tecnicos (RSI, MACD, EMA, ADX, Bollinger), el motor
de confluencia, el health-check del core y el Chat IA explicativo, todo expuesto como
endpoints REST.

> **Regla constitucional:** la IA y los indicadores **solo evaluan / explican**, nunca
> ejecutan ni recomiendan operaciones. Toda respuesta del Chat IA incluye el disclaimer
> `esta explicacion no constituye orden ni recomendacion ejecutable`.

---

## 1. Requisitos previos

- Node.js 20+ y npm 10+
- Repositorio clonado completo (es un monorepo con workspaces)

## 2. Instalacion

Desde la raiz del repositorio:

```bash
npm install
```

Esto instala las dependencias de todos los workspaces, incluido `@inversions/rest-api`.

## 3. Validacion completa (los 3 gates obligatorios)

Ejecutar desde la raiz del repositorio:

```bash
# Gate 1 — Tipado (tsc --noEmit), debe terminar sin errores
npm run -w @inversions/rest-api lint

# Gate 2 — Tests unitarios + integracion del core de indicadores
npm run -w @inversions/rest-api test -- tests/unit/indicators tests/integration/indicators

# Gate 3 — Convencion de comentarios FIC
npm run lint:fic
```

**Resultado esperado (al cierre de TEAM-02):**

| Gate | Resultado |
|---|---|
| `lint` (tsc --noEmit) | sin errores |
| Tests del core de indicadores | **116 tests en verde** (16 archivos) |
| Suite REST API completa (`npm run -w @inversions/rest-api test`) | **177 tests en verde** (31 archivos) |
| `lint:fic` | OK |
| Cobertura en `src/modules/indicators/**` | **94.75 % statements / 97.02 % lines** (gate >= 80 %) |

Cobertura detallada:

```bash
npm run -w @inversions/rest-api test -- tests/unit/indicators tests/integration/indicators --coverage
```

---

## 4. Estructura de lo que se agrego

```
projects/rest-api/inversions_api/src/modules/indicators/
  types.ts          # tipos compartidos + ConfluenceVerdict (infra)
  ohlcSource.ts     # fuente OHLC mock determinista (infra)
  errors.ts         # helper respondError (infra)
  rsi.ts            # KEVIN  — RSI de Wilder
  macd.ts           # KEVIN  — MACD (linea, señal, histograma, cruce)
  ema.ts            # EDGAR  — EMA
  adx.ts            # EDGAR  — ADX + DI con suavizado de Wilder
  bollinger.ts      # EDGAR  — Bandas de Bollinger
  confluence.ts     # MAURICIO — motor de confluencia de los 5 indicadores
  chatExplainer.ts  # HANSEL — orquestador del Chat IA explicativo

projects/rest-api/inversions_api/src/routes/indicators/
  rsi.ts  macd.ts                 # KEVIN
  ema.ts  adx.ts  bollinger.ts    # EDGAR
  confluence.ts  health.ts        # MAURICIO
  chatExplain.ts                  # HANSEL  (montado en /api/chat)

projects/rest-api/inversions_api/tests/unit/indicators/
  rsi.test.ts  macd.test.ts                       # KEVIN
  ema.test.ts  adx.test.ts  bollinger.test.ts     # EDGAR
  confluence.test.ts                              # MAURICIO
  chatExplainer.test.ts                           # HANSEL

projects/rest-api/inversions_api/tests/integration/indicators/
  rsiRoute.test.ts  macdRoute.test.ts             # KEVIN
  emaRoute.test.ts  adxRoute.test.ts  bollingerRoute.test.ts   # EDGAR
  confluenceRoute.test.ts  healthRoute.test.ts    # MAURICIO
  chatExplainRoute.test.ts  e2eChat.test.ts       # HANSEL

specs/003-team-02-core-indicadores/
  spec.md  plan.md  tasks.md
  contracts/
    rsi.openapi.yaml  macd.openapi.yaml           # KEVIN
    ema.openapi.yaml  adx.openapi.yaml  bollinger.openapi.yaml   # EDGAR
    confluence.openapi.yaml                       # MAURICIO
    chat-explain.openapi.yaml                     # HANSEL
```

`src/index.ts` registra todos los routers nuevos bajo `/api/indicators` y `/api/chat`.

---

## 5. Endpoints REST

| Metodo | Ruta | Descripcion | Responsable |
|---|---|---|---|
| GET  | `/api/indicators/rsi`        | RSI de Wilder | Kevin |
| GET  | `/api/indicators/macd`       | MACD + deteccion de cruce | Kevin |
| GET  | `/api/indicators/ema`        | Media movil exponencial | Edgar |
| GET  | `/api/indicators/adx`        | ADX + `+DI` / `-DI` + fuerza de tendencia | Edgar |
| GET  | `/api/indicators/bollinger`  | Bandas de Bollinger + ancho + `%B` | Edgar |
| GET  | `/api/indicators/confluence` | Veredicto consolidado de los 5 indicadores | Mauricio |
| GET  | `/api/indicators/health`     | Salud del core (fuente OHLC + indicadores) | Mauricio |
| POST | `/api/chat/explain`          | Chat IA explicativo de la señal tecnica | Hansel |

Parametros comunes de los indicadores: `symbol` (obligatorio), `timeframe`
(`1m,5m,15m,1h,4h,1d`, default `1h`), `count` (default 300), mas los parametros propios
de cada indicador (`period`, `fast/slow/signal`, `stdDev`).

Errores estructurados: `{ error_code, message, hint? }` — `400` parametros invalidos,
`404` symbol sin datos, `422` velas insuficientes.

### Levantar el servidor (opcional)

```bash
npm run -w @inversions/rest-api dev
# escucha en http://localhost:3000
```

Ejemplo de prueba manual:

```bash
curl "http://localhost:3000/api/indicators/confluence?symbol=AAPL&timeframe=1h"
curl -X POST http://localhost:3000/api/chat/explain \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","timeframe":"1h","question":"por que la señal esta asi?"}'
```

---

## 6. Validacion paso a paso por integrante

Cada integrante puede validar **solo su parte** con el comando indicado. Todos los
comandos se ejecutan desde la **raiz del repositorio**.

### 6.1 Kevin — Momentum: RSI + MACD (T010–T020)

**Archivos:** `modules/indicators/{rsi,macd}.ts`, `routes/indicators/{rsi,macd}.ts`,
tests `rsi*`, `macd*`, contratos `rsi.openapi.yaml`, `macd.openapi.yaml`.

```bash
npm run -w @inversions/rest-api test -- tests/unit/indicators/rsi.test.ts tests/unit/indicators/macd.test.ts tests/integration/indicators/rsiRoute.test.ts tests/integration/indicators/macdRoute.test.ts
```

**Que verificar:**
- RSI devuelve `current_value` en `[0,100]`, serie alineada por timestamp y `zone`.
- MACD devuelve `macd`, `signal`, `histogram` y `cross` (`bullish|bearish|none`).
- Errores `400/404/422` con cuerpo `{error_code,message,hint}`.
- Reproducibilidad: mismas velas → mismo `source_input_hash`.

### 6.2 Edgar — Tendencia / Volatilidad: EMA + ADX + Bollinger (T030–T033)

**Archivos:** `modules/indicators/{ema,adx,bollinger}.ts`,
`routes/indicators/{ema,adx,bollinger}.ts`, tests `ema*`, `adx*`, `bollinger*`,
contratos `ema/adx/bollinger.openapi.yaml`, registro de routers en `src/index.ts`.

```bash
npm run -w @inversions/rest-api test -- tests/unit/indicators/ema.test.ts tests/unit/indicators/adx.test.ts tests/unit/indicators/bollinger.test.ts tests/integration/indicators/emaRoute.test.ts tests/integration/indicators/adxRoute.test.ts tests/integration/indicators/bollingerRoute.test.ts
```

**Que verificar:**
- EMA: default `period=20`; serie alineada; `zone` ∈ `alcista|bajista|neutral|unknown`.
- ADX: default `period=14`, suavizado de Wilder; devuelve `adx`, `plus_di`, `minus_di`
  y `strength` ∈ `sin_tendencia|debil|fuerte|muy_fuerte`; requiere `2*period` velas.
- Bollinger: default `period=20`, `stdDev=2`; devuelve `upper/middle/lower`,
  `bandwidth` y `percent_b`.
- Los 3 routers quedan registrados en `src/index.ts`.

### 6.3 Mauricio — Confluencia + Health + Trazabilidad (T040–T046)

**Archivos:** `modules/indicators/confluence.ts`,
`routes/indicators/{confluence,health}.ts`, `ConfluenceVerdict` en `types.ts`,
tests `confluence*`, `healthRoute*`, contrato `confluence.openapi.yaml`.

```bash
npm run -w @inversions/rest-api test -- tests/unit/indicators/confluence.test.ts tests/integration/indicators/confluenceRoute.test.ts tests/integration/indicators/healthRoute.test.ts
```

**Que verificar:**
- `confluence` consolida los 5 indicadores: `verdict` (`alcista|neutral|bajista`),
  `score` ∈ `[-1,1]`, `components[]` con peso y contribucion por indicador.
- Politica de degradacion: si falta un indicador → `degraded:true` + lista `missing`;
  con menos de 3 disponibles → `verdict=neutral`. **Nunca responde 500.**
- `health` reporta `ohlc_source` y cada indicador sin lanzar excepciones.
- Trazabilidad: `source_input_hash`, `algorithm_version`, `bars_used` en el veredicto.
- Idempotencia: mismas velas → mismo `score` / `verdict` / `components`.

### 6.4 Hansel — Chat IA explicativo + e2e + calidad (T050–T062)

**Archivos:** `modules/indicators/chatExplainer.ts`, `routes/indicators/chatExplain.ts`,
tests `chatExplainer*`, `chatExplainRoute*`, `e2eChat*`, contrato
`chat-explain.openapi.yaml`.

```bash
npm run -w @inversions/rest-api test -- tests/unit/indicators/chatExplainer.test.ts tests/integration/indicators/chatExplainRoute.test.ts tests/integration/indicators/e2eChat.test.ts
```

**Que verificar:**
- Interfaz `LlmExplainer` neutral + `DeterministicMockExplainer` (sin red, para CI).
- Toda respuesta incluye el disclaimer constitucional.
- Una pregunta que implica ejecutar una orden (p.ej. "ejecuta una compra") se
  **rechaza con 200** y `refused:true` (no 4xx) para que la UI la muestre.
- Se citan al menos 3 de 5 indicadores cuando la confluencia esta disponible.
- Responde en español aunque la pregunta venga en otro idioma.
- `e2eChat.test.ts` recorre el flujo completo: OHLC → 5 indicadores → confluencia → chat.

---

## 7. Estado de tareas (`specs/003-team-02-core-indicadores/tasks.md`)

| Bloque | Tareas | Estado |
|---|---|---|
| Infra compartida + Momentum (Kevin) | T000–T003, T010–T020 | ✅ Completado |
| Tendencia / Volatilidad (Edgar) | T030–T033 | ✅ Completado |
| Confluencia + Health (Mauricio) | T040–T046 | ✅ Completado |
| Chat IA + e2e (Hansel) | T050–T055 | ✅ Completado |
| Cobertura y calidad | T060–T062 | ✅ Completado |
| Clarifications | T070–T072 | ⏳ Pendiente (no bloquean) |

**Clarifications pendientes** (coordinacion, no son codigo):
- **T070** — proveedor y modelo LLM concreto para el Chat IA.
- **T071** — fuente real de OHLC (coordinacion con TEAM-01).
- **T072** — politica de cache (TTL) y limites de rate por usuario.

---

## 8. Notas tecnicas

- **Fuente OHLC:** mientras TEAM-01 no publica la fuente real, se usa
  `ohlcSource.getCandles()`, un generador mock **determinista** (los valores OHLC
  dependen solo del indice de vela). Por eso `verdict` / `score` son reproducibles
  entre llamadas; el campo `time` si depende del reloj.
- **Comentarios FIC:** cada archivo nuevo abre con dos lineas `// FIC:` (ingles +
  español) siguiendo la convencion del proyecto.
- **Funciones puras:** todo el calculo vive en `modules/indicators/`; las rutas Express
  solo validan parametros y delegan.
