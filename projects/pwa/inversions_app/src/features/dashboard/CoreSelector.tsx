// FIC: Core selector — Revolut chip toggle style with accent active state and CSS vars.
// FIC: Selector de cores — estilo toggle chip Revolut con estado activo acento y CSS vars.

import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { StrategyLab } from "../strategies/StrategyLab";

interface CoreDefinition {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface CoreSelectorProps {
  cores: CoreDefinition[];
  onToggle: (coreId: string) => void;
}

export type { CoreDefinition };

/**
 * FIC: Selector for active analytical cores in dashboard confluence.
 * Allows operators to enable/disable strategy cores before refresh.
 *
 * FIC: Selector de cores analíticos activos en la confluencia del dashboard.
 * Permite a operadores habilitar/deshabilitar cores antes de refrescar.
 */
export function CoreSelector({ cores, onToggle }: CoreSelectorProps) {
  const [estrategiasEnabled, setEstrategiasEnabled] = useState(false);
  const [showStrategiesModal, setShowStrategiesModal] = useState(false);

  // FIC: Lock body scroll while Strategy Lab modal is open.
  // FIC: Bloquea el scroll del body mientras el modal de Strategy Lab está abierto.
  useEffect(() => {
    if (showStrategiesModal) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [showStrategiesModal]);

  const handleEstrategiasToggle = () => {
    const newValue = !estrategiasEnabled;
    setEstrategiasEnabled(newValue);
    setShowStrategiesModal(newValue);
  };

  const chipButtonStyle = (active: boolean): CSSProperties => ({
    display: "block",
    width: "100%",
    textAlign: "left",
    background: active ? "var(--color-accent-subtle)" : "var(--color-surface-raised)",
    border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
    borderRadius: "var(--radius-md)",
    padding: "0.65rem 0.75rem",
    cursor: "pointer",
    transition: "background var(--duration-fast) var(--easing-standard), border-color var(--duration-fast) var(--easing-standard)"
  });

  const chipLabelStyle = (active: boolean): CSSProperties => ({
    color: active ? "var(--color-text)" : "var(--color-text-muted)",
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-emphasis)"
  });

  const chipBadgeStyle = (active: boolean): CSSProperties => ({
    marginLeft: "auto",
    background: active ? "var(--color-buy)" : "var(--color-text-muted)",
    color: "#000",
    fontWeight: "var(--font-weight-bold)",
    fontSize: "var(--font-size-xs)",
    padding: "0.1rem 0.4rem",
    borderRadius: "var(--radius-xs)"
  });

  return (
    <section className="card">
      <h2 style={{ marginBottom: "0.75rem" }}>Cores analíticos</h2>
      <div style={{ display: "grid", gap: "var(--space-sm)", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
        {cores.map((core) => (
          <button
            key={core.id}
            onClick={() => onToggle(core.id)}
            aria-pressed={core.enabled}
            style={chipButtonStyle(core.enabled)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <strong style={chipLabelStyle(core.enabled)}>
                {core.label}
              </strong>
              {/* FIC: SI/NO explicit toggle badge — required by constitution §10 (PDF v1). */}
              {/* FIC: Badge de toggle explícito SI/NO — requerido por constitución §10 (PDF v1). */}
              <span
                aria-label={`${core.label} ${core.enabled ? "SI" : "NO"}`}
                style={chipBadgeStyle(core.enabled)}
              >
                {core.enabled ? "SI" : "NO"}
              </span>
            </div>
            <p style={{ marginTop: "0.3rem", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              {core.description}
            </p>
          </button>
        ))}

        {/* FIC: Estrategias toggle — opens Strategy Lab modal inline. */}
        {/* FIC: Toggle de Estrategias — abre modal de Strategy Lab incrustado. */}
        <button
          onClick={handleEstrategiasToggle}
          aria-pressed={estrategiasEnabled}
          style={chipButtonStyle(estrategiasEnabled)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <strong style={chipLabelStyle(estrategiasEnabled)}>
              Estrategias
            </strong>
            <span
              aria-label={`Estrategias ${estrategiasEnabled ? "SI" : "NO"}`}
              style={chipBadgeStyle(estrategiasEnabled)}
            >
              {estrategiasEnabled ? "SI" : "NO"}
            </span>
          </div>
          <p style={{ marginTop: "0.3rem", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Estrategias complejas de opciones
          </p>
        </button>
      </div>

      {/* FIC: Strategy Lab modal — full-screen overlay embedded in CoreSelector. */}
      {/* FIC: Modal de Strategy Lab — overlay a pantalla completa incrustado en CoreSelector. */}
      {showStrategiesModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "var(--color-bg)",
            overflow: "auto",
          }}
        >
          <StrategyLab
            onNavigateToDashboard={() => {
              setShowStrategiesModal(false);
              setEstrategiasEnabled(false);
            }}
          />
        </div>
      )}
    </section>
  );
}
