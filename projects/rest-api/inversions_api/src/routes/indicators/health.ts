// FIC: REST endpoint GET /api/indicators/health — core liveness report (Mauricio, TEAM-02).
// FIC: Endpoint REST GET /api/indicators/health — reporte de disponibilidad del core (Mauricio, TEAM-02).

import { Router } from "express";
import { getCandles } from "../../modules/indicators/ohlcSource";
import { computeRsi } from "../../modules/indicators/rsi";
import { computeMacd } from "../../modules/indicators/macd";
import { computeEma } from "../../modules/indicators/ema";
import { computeAdx } from "../../modules/indicators/adx";
import { computeBollinger } from "../../modules/indicators/bollinger";
import type { OhlcBar, Timeframe } from "../../modules/indicators/types";

export const indicatorsHealthRouter = Router();

type CheckStatus = "ok" | "degraded";

// FIC: Run a probe defensively — any throw or null headline degrades, never bubbles up.
// FIC: Ejecuta una sonda de forma defensiva — cualquier excepcion o valor nulo degrada, nunca propaga.
function safeCheck(fn: () => boolean): CheckStatus {
  try {
    return fn() ? "ok" : "degraded";
  } catch {
    return "degraded";
  }
}

indicatorsHealthRouter.get("/health", (_req, res) => {
  const symbol = "AAPL";
  const timeframe: Timeframe = "1h";
  const meta = { symbol, timeframe };

  let candles: OhlcBar[] = [];
  let ohlcSource: CheckStatus = "degraded";
  try {
    candles = getCandles({ symbol, timeframe, count: 300 });
    ohlcSource = candles.length > 0 ? "ok" : "degraded";
  } catch {
    ohlcSource = "degraded";
  }

  const indicators = {
    rsi: safeCheck(() => computeRsi(candles, { period: 14 }, meta).current_value !== null),
    macd: safeCheck(() => computeMacd(candles, { fast: 12, slow: 26, signal: 9 }, meta).current_value.histogram !== null),
    ema: safeCheck(() => computeEma(candles, { period: 20 }, meta).current_value !== null),
    adx: safeCheck(() => computeAdx(candles, { period: 14 }, meta).current_value.adx !== null),
    bollinger: safeCheck(() => computeBollinger(candles, { period: 20, stdDev: 2 }, meta).current_value.middle !== null)
  };

  const allOk =
    ohlcSource === "ok" && Object.values(indicators).every((status) => status === "ok");

  return res.status(200).json({
    status: allOk ? "ok" : "degraded",
    ohlc_source: ohlcSource,
    indicators,
    timestamp: new Date().toISOString()
  });
});
