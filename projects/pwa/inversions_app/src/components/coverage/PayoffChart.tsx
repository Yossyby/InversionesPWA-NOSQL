// FIC: PayoffChart — coverage strategy payoff diagram using lightweight-charts. (EN)
// FIC: PayoffChart — diagrama de payoff de estrategia de cobertura usando lightweight-charts. (ES)

import React, { useEffect, useRef } from "react";
import { createChart, LineSeries, ColorType, type UTCTimestamp } from "lightweight-charts";

export interface PayoffPoint {
  underlyingPrice: number;
  pnl: number;
}

interface PayoffChartProps {
  points: PayoffPoint[];
  breakEvenPrice: number;
  height?: number;
}

// FIC: TIME_BASE maps real prices to the chart's internal time axis (avoids "1970" display). (EN)
// FIC: TIME_BASE mapea precios reales al eje de tiempo interno del chart (evita mostrar "1970"). (ES)
const TIME_BASE = 1_000_000_000;

export const PayoffChart: React.FC<PayoffChartProps> = ({
  points,
  breakEvenPrice,
  height = 220,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || points.length === 0) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(255,255,255,0.6)",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      timeScale: {
        // FIC: tickMarkFormatter converts the internal time back to a readable price. (EN)
        // FIC: tickMarkFormatter convierte el tiempo interno de vuelta a un precio legible. (ES)
        tickMarkFormatter: (time: number) => `$${(time - TIME_BASE).toFixed(0)}`,
        borderColor: "rgba(255,255,255,0.08)",
      },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
      crosshair: { mode: 1 },
    });

    const series = chart.addSeries(LineSeries, {
      color: "var(--color-accent)",
      lineWidth: 2,
    });

    const data = points.map((p) => ({
      time: (TIME_BASE + p.underlyingPrice) as UTCTimestamp,
      value: p.pnl,
    }));

    series.setData(data);

    // FIC: Crosshair tooltip — shows "Break-even: $XXX.XX" when hovering within ±5% of break-even. (EN)
    // FIC: Tooltip de crosshair — muestra "Break-even: $XXX.XX" al pasar cerca (±5%) del break-even. (ES)
    const tooltipEl = document.createElement("div");
    Object.assign(tooltipEl.style, {
      position: "absolute",
      padding: "4px 8px",
      backgroundColor: "var(--color-surface-raised)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "4px",
      fontSize: "11px",
      color: "var(--color-text)",
      pointerEvents: "none",
      display: "none",
      zIndex: "10",
    });
    containerRef.current.style.position = "relative";
    containerRef.current.appendChild(tooltipEl);

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point) {
        tooltipEl.style.display = "none";
        return;
      }
      const price = (param.time as number) - TIME_BASE;
      const proximity = Math.abs(price - breakEvenPrice) / breakEvenPrice;

      if (proximity <= 0.05) {
        tooltipEl.textContent = `Break-even: $${breakEvenPrice.toFixed(2)}`;
        tooltipEl.style.display = "block";
        tooltipEl.style.left = `${param.point.x + 8}px`;
        tooltipEl.style.top = `${param.point.y - 24}px`;
      } else {
        tooltipEl.style.display = "none";
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      tooltipEl.remove();
    };
  }, [points, breakEvenPrice, height]);

  return <div ref={containerRef} style={{ width: "100%", height }} />;
};
