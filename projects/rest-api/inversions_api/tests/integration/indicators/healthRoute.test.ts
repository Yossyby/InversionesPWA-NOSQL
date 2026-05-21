// FIC: Integration tests for GET /api/indicators/health (Mauricio, TEAM-02).
// FIC: Tests de integracion para GET /api/indicators/health (Mauricio, TEAM-02).

import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { indicatorsHealthRouter } from "../../../src/routes/indicators/health";

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/indicators", indicatorsHealthRouter);
  return app;
}

describe("GET /api/indicators/health", () => {
  it("reports the status of the OHLC source and every indicator", async () => {
    const res = await request(buildApp()).get("/api/indicators/health");
    expect(res.status).toBe(200);
    expect(["ok", "degraded"]).toContain(res.body.status);
    expect(res.body.ohlc_source).toBe("ok");
    expect(res.body.indicators).toMatchObject({
      rsi: "ok",
      macd: "ok",
      ema: "ok",
      adx: "ok",
      bollinger: "ok"
    });
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.timestamp).toBe("string");
  });
});
