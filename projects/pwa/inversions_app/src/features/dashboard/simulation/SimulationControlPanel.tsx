// FIC: Simulation control panel — Revolut tokens applied, logic unchanged.
// FIC: Panel de control de simulación — tokens Revolut aplicados, lógica sin cambios.

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  runSimulation,
  ALL_CORES,
  ALL_SUBCORES,
  type CoreId,
  type SubCoreIndicador,
  type SimulationRequestPayload,
  type SimulationResponse
} from "../../../services/signals/confluenceTableApi";
import type { StrikeSelection, FromChainResponse } from "../../../services/strategies/strategyApi";
import { StrategySelector } from "./StrategySelector";
import { RiskToleranceToggle } from "./RiskToleranceToggle";
import { ExecuteSimulationButton } from "./ExecuteSimulationButton";

interface Props {
  ticket: string;
  onResult: (result: SimulationResponse) => void;
}

type Preset = "2A" | "1A" | "6M" | "3M" | "1M";
const PRESETS: Preset[] = ["2A", "1A", "6M", "3M", "1M"];
const TIMEFRAMES: Array<"1m" | "5m" | "15m" | "1h" | "4h" | "1d"> = ["1m", "5m", "15m", "1h", "4h", "1d"];

// FIC: Complex multi-leg option strategies that show the expanded Strategy Builder UI.
// FIC: Estrategias multi-pata complejas que muestran la UI expandida del Strategy Builder.
const COMPLEX_STRATEGIES = new Set(["IRON_CONDOR", "BUTTERFLY", "IRON_BUTTERFLY", "CONDOR"]);


// FIC: Generate default strikes per strategy type — matches StrategyLab behavior.
// FIC: Genera strikes por defecto por tipo de estrategia — igual que en StrategyLab.
function getDefaultStrikes(type: string, baseStrike: number): StrikeSelection[] {
  const w = 20;
  switch (type) {
    case "IRON_CONDOR":
      return [
        { strike: baseStrike - w, tipo: "put", posicion: "long" },
        { strike: baseStrike, tipo: "put", posicion: "short" },
        { strike: baseStrike + 2 * w, tipo: "call", posicion: "short" },
        { strike: baseStrike + 3 * w, tipo: "call", posicion: "long" },
      ];
    case "BUTTERFLY":
      return [
        { strike: baseStrike - w, tipo: "call", posicion: "long" },
        { strike: baseStrike + w, tipo: "call", posicion: "short" },
        { strike: baseStrike + 3 * w, tipo: "call", posicion: "long" },
      ];
    case "CONDOR":
      return [
        { strike: baseStrike - 3 * w, tipo: "call", posicion: "long" },
        { strike: baseStrike - w, tipo: "call", posicion: "short" },
        { strike: baseStrike + w, tipo: "call", posicion: "short" },
        { strike: baseStrike + 3 * w, tipo: "call", posicion: "long" },
      ];
    case "IRON_BUTTERFLY":
      return [
        { strike: baseStrike - 2 * w, tipo: "put", posicion: "long" },
        { strike: baseStrike, tipo: "put", posicion: "short" },
        { strike: baseStrike, tipo: "call", posicion: "short" },
        { strike: baseStrike + 2 * w, tipo: "call", posicion: "long" },
      ];
    default:
      return [];
  }
}

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoPlusDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

export function SimulationControlPanel({ ticket, onResult }: Props) {
  const [preset, setPreset] = useState<Preset>("3M");
  const [estrategiaFrom, setEstrategiaFrom] = useState(isoToday());
  const [estrategiaTo, setEstrategiaTo] = useState(isoPlusDays(30));
  const [temporalidad, setTemporalidad] = useState<"1m" | "5m" | "15m" | "1h" | "4h" | "1d">("1h");
  const [estrategia, setEstrategia] = useState("IRON_CONDOR");
  const [tolerancia, setTolerancia] = useState<"BAJO" | "MEDIO" | "ALTO">("MEDIO");
  const [coresOn, setCoresOn] = useState<Record<CoreId, boolean>>(
    ALL_CORES.reduce((acc, c) => ({ ...acc, [c]: true }), {} as Record<CoreId, boolean>)
  );
  const [indicadoresOn, setIndicadoresOn] = useState<Record<SubCoreIndicador, boolean>>(
    ALL_SUBCORES.reduce((acc, s) => ({ ...acc, [s]: true }), {} as Record<SubCoreIndicador, boolean>)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Complex Strategy Builder state ────────────────────────
  const isComplex = COMPLEX_STRATEGIES.has(estrategia);
  const [strikes, setStrikes] = useState<StrikeSelection[]>(getDefaultStrikes(estrategia, 560));
  const [builderContratos, setBuilderContratos] = useState(1);
  const [portfolioValor, setPortfolioValor] = useState(50000);
  const [portfolioPoder, setPortfolioPoder] = useState(25000);
  const [builderError, setBuilderError] = useState<string | null>(null);
  const [builderResult, setBuilderResult] = useState<FromChainResponse | null>(null);
  const prevEstrategia = useRef(estrategia);

  // FIC: Reset strikes when strategy type changes.
  // FIC: Reinicia los strikes cuando cambia el tipo de estrategia.
  useEffect(() => {
    if (prevEstrategia.current !== estrategia) {
      prevEstrategia.current = estrategia;
      setStrikes(getDefaultStrikes(estrategia, 560));
      setBuilderResult(null);
      setBuilderError(null);
    }
  }, [estrategia]);

  // FIC: Update a specific strike leg field.
  // FIC: Actualiza un campo específico de una pata de strike.
  const updateStrike = useCallback((index: number, field: keyof StrikeSelection, value: number | string) => {
    setStrikes((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }, []);

  const toggleCore = (c: CoreId) => setCoresOn((prev) => ({ ...prev, [c]: !prev[c] }));
  const toggleSub = (s: SubCoreIndicador) => setIndicadoresOn((prev) => ({ ...prev, [s]: !prev[s] }));

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: SimulationRequestPayload = {
        ticket,
        rangoHistorico: preset,
        rangoEstrategia: { from: estrategiaFrom, to: estrategiaTo },
        temporalidad,
        runtimeMode: "OFFLINE",
        coresHabilitados: ALL_CORES.filter((c) => coresOn[c]),
        indicadoresHabilitados: ALL_SUBCORES.filter((s) => indicadoresOn[s]),
        estrategia,
        toleranciaRiesgo: tolerancia
      };
      const result = await runSimulation(payload);
      onResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "simulation_failed");
    } finally {
      setLoading(false);
    }
  };

  const fieldsetStyle: React.CSSProperties = {
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
    padding: "var(--space-sm) var(--space-md)"
  };

  const legendStyle: React.CSSProperties = {
    fontSize: "var(--font-size-xs)",
    color: "var(--color-text-muted)",
    textTransform: "uppercase",
    fontWeight: "var(--font-weight-emphasis)",
    letterSpacing: "0.06em"
  };

  return (
    <section className="card" style={{ display: "grid", gap: "var(--space-md)" }}>
      <h2 style={{ margin: 0 }}>Panel de Control · Simulacion</h2>

      <div style={{ display: "grid", gap: "var(--space-sm)", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "var(--font-size-xs)" }}>
          <span style={{ color: "var(--color-text-muted)", fontWeight: "var(--font-weight-emphasis)", textTransform: "uppercase" }}>Rango Historico</span>
          <select value={preset} onChange={(e) => setPreset(e.target.value as Preset)}>
            {PRESETS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "var(--font-size-xs)" }}>
          <span style={{ color: "var(--color-text-muted)", fontWeight: "var(--font-weight-emphasis)", textTransform: "uppercase" }}>Estrategia Desde</span>
          <input type="date" value={estrategiaFrom} onChange={(e) => setEstrategiaFrom(e.target.value)} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "var(--font-size-xs)" }}>
          <span style={{ color: "var(--color-text-muted)", fontWeight: "var(--font-weight-emphasis)", textTransform: "uppercase" }}>Estrategia Hasta</span>
          <input type="date" value={estrategiaTo} onChange={(e) => setEstrategiaTo(e.target.value)} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "var(--font-size-xs)" }}>
          <span style={{ color: "var(--color-text-muted)", fontWeight: "var(--font-weight-emphasis)", textTransform: "uppercase" }}>Temporalidad</span>
          <select value={temporalidad} onChange={(e) => setTemporalidad(e.target.value as typeof temporalidad)}>
            {TIMEFRAMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <StrategySelector value={estrategia} onChange={setEstrategia} />
        <RiskToleranceToggle value={tolerancia} onChange={setTolerancia} />
      </div>

      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>Cores (SI/NO)</legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)", marginTop: "var(--space-xs)" }}>
          {ALL_CORES.map((c) => (
            <label key={c} style={{ display: "flex", gap: "0.3rem", alignItems: "center", fontSize: "var(--font-size-sm)", cursor: "pointer" }}>
              <input type="checkbox" checked={coresOn[c]} onChange={() => toggleCore(c)} style={{ accentColor: "var(--color-accent)" }} />
              <span style={{ color: coresOn[c] ? "var(--color-text)" : "var(--color-text-muted)" }}>{c}:</span>
              <strong style={{ color: coresOn[c] ? "var(--color-buy)" : "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
                {coresOn[c] ? "SI" : "NO"}
              </strong>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>Indicadores (SI/NO)</legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)", marginTop: "var(--space-xs)" }}>
          {ALL_SUBCORES.map((s) => (
            <label key={s} style={{ display: "flex", gap: "0.3rem", alignItems: "center", fontSize: "var(--font-size-sm)", cursor: "pointer" }}>
              <input type="checkbox" checked={indicadoresOn[s]} onChange={() => toggleSub(s)} style={{ accentColor: "var(--color-accent)" }} />
              <span style={{ color: indicadoresOn[s] ? "var(--color-text)" : "var(--color-text-muted)" }}>{s}:</span>
              <strong style={{ color: indicadoresOn[s] ? "var(--color-buy)" : "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
                {indicadoresOn[s] ? "SI" : "NO"}
              </strong>
            </label>
          ))}
        </div>
      </fieldset>

      {/* ── Complex Strategy Builder (only for IRON_CONDOR, BUTTERFLY) ── */}
      {isComplex && (
        <fieldset style={{
          border: "1px solid var(--color-accent)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-md)",
          background: "var(--color-accent-subtle)"
        }}>
          <legend style={{
            ...legendStyle,
            color: "var(--color-accent)",
            background: "var(--color-bg)",
            padding: "0.25rem 0.75rem",
            borderRadius: "var(--radius-sm)"
          }}>
            🛠️ Constructor de Estrategia — datos reales de Alpaca
          </legend>

          <div style={{ display: "grid", gap: "var(--space-md)" }}>
            {/* Strikes / Legs */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Patas ({strikes.length})
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Contratos:</span>
                  <input
                    type="number"
                    min={1}
                    value={builderContratos}
                    onChange={(e) => setBuilderContratos(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: "70px", padding: "0.25rem 0.5rem", textAlign: "center" }}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gap: "0.4rem" }}>
                {strikes.map((leg, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr 1fr 1fr",
                      gap: "0.4rem",
                      alignItems: "center",
                      padding: "0.5rem",
                      background: "rgba(0,0,0,0.08)",
                      borderRadius: "var(--radius-sm)"
                    }}
                  >
                    <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--color-text-muted)", width: "22px" }}>
                      #{i + 1}
                    </span>
                    <div>
                      <label style={{ display: "block", fontSize: "0.65rem", color: "var(--color-text-muted)", marginBottom: "0.15rem", fontWeight: 600, textTransform: "uppercase" }}>
                        Strike
                      </label>
                      <input
                        type="number"
                        value={leg.strike}
                        onChange={(e) => updateStrike(i, "strike", parseInt(e.target.value) || 0)}
                        style={{ padding: "0.3rem 0.5rem", width: "100%" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.65rem", color: "var(--color-text-muted)", marginBottom: "0.15rem", fontWeight: 600, textTransform: "uppercase" }}>
                        Tipo
                      </label>
                      <select
                        value={leg.tipo}
                        onChange={(e) => updateStrike(i, "tipo", e.target.value)}
                        style={{ padding: "0.3rem 0.5rem", width: "100%" }}
                      >
                        <option value="call">Call</option>
                        <option value="put">Put</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.65rem", color: "var(--color-text-muted)", marginBottom: "0.15rem", fontWeight: 600, textTransform: "uppercase" }}>
                        Posición
                      </label>
                      <select
                        value={leg.posicion}
                        onChange={(e) => updateStrike(i, "posicion", e.target.value)}
                        style={{ padding: "0.3rem 0.5rem", width: "100%" }}
                      >
                        <option value="long">Long</option>
                        <option value="short">Short</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.7rem", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>
                  Valor Portafolio ($)
                </label>
                <input
                  type="number"
                  value={portfolioValor}
                  onChange={(e) => setPortfolioValor(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.7rem", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>
                  Poder de Compra ($)
                </label>
                <input
                  type="number"
                  value={portfolioPoder}
                  onChange={(e) => setPortfolioPoder(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Builder error */}
            {builderError && (
              <div style={{ background: "rgba(248,81,73,0.08)", border: "1px solid var(--color-sell)", borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem", color: "var(--color-sell)", fontSize: "0.85rem" }}>
                ⚠️ {builderError}
              </div>
            )}

            {/* Builder result summary */}
            {builderResult && (
              <div style={{
                border: "1px solid var(--color-buy)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-md)",
                background: "var(--color-bg)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>✅</span>
                  <strong style={{ color: "var(--color-buy)", fontSize: "0.95rem" }}>Estrategia ejecutada con datos reales</strong>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.5rem" }}>
                  {(() => {
                    const s = builderResult.summary as Record<string, unknown>;
                    const perfil = (s?.perfil ?? {}) as Record<string, unknown>;
                    const riesgo = (s?.riesgo ?? {}) as Record<string, unknown>;
                    const simulacion = (s?.simulacion ?? {}) as Record<string, unknown>;
                    return (
                      <>
                        <div style={{ textAlign: "center", padding: "0.5rem", background: "var(--color-surface-raised)", borderRadius: "var(--radius-sm)" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem", fontWeight: 600 }}>
                            Ganancia Máx
                          </div>
                          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-buy)" }}>
                            ${(perfil.ganancia_maxima as number)?.toLocaleString() ?? "—"}
                          </div>
                        </div>
                        <div style={{ textAlign: "center", padding: "0.5rem", background: "var(--color-surface-raised)", borderRadius: "var(--radius-sm)" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem", fontWeight: 600 }}>
                            Pérdida Máx
                          </div>
                          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-sell)" }}>
                            ${(perfil.perdida_maxima as number)?.toLocaleString() ?? "—"}
                          </div>
                        </div>
                        <div style={{ textAlign: "center", padding: "0.5rem", background: "var(--color-surface-raised)", borderRadius: "var(--radius-sm)" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem", fontWeight: 600 }}>
                            Riesgo
                          </div>
                          <div style={{ fontSize: "1rem", fontWeight: 700 }}>
                            {(riesgo.puntaje as number) ?? "—"}/100
                          </div>
                        </div>
                        <div style={{ textAlign: "center", padding: "0.5rem", background: "var(--color-surface-raised)", borderRadius: "var(--radius-sm)" }}>
                          <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem", fontWeight: 600 }}>
                            Prob. Éxito
                          </div>
                          <div style={{ fontSize: "1rem", fontWeight: 700 }}>
                            {(simulacion.prob_exito as number) != null ? `${((simulacion.prob_exito as number) * 100).toFixed(1)}%` : "—"}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </fieldset>
      )}

      {error && <div style={{ color: "var(--color-sell)", fontSize: "var(--font-size-sm)" }}>Error: {error}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <ExecuteSimulationButton loading={loading} onClick={run} />
      </div>
    </section>
  );
}

export default SimulationControlPanel;
