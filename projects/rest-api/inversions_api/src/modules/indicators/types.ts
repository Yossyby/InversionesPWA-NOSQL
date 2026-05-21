// FIC: Shared types for technical indicators module (TEAM-02 CocaDe6Lts).
// FIC: Tipos compartidos para el modulo de indicadores tecnicos (TEAM-02 CocaDe6Lts).

export type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export interface OhlcBar {
  time: number; // unix seconds, UTC
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorMeta {
  symbol: string;
  timeframe: Timeframe;
  indicator: string;
  params: Record<string, number | string>;
  algorithm_version: string;
  computed_at: string; // ISO UTC
  source_input_hash: string; // sha256 truncated
  bars_used: number;
}

export interface IndicatorResult<TValue, TPoint = TValue> extends IndicatorMeta {
  current_value: TValue;
  series: Array<{ time: number } & TPoint>;
  zone?: string;
}

export interface IndicatorError {
  error_code: string;
  message: string;
  hint?: string;
}

export type ConfluenceVerdictLabel = "alcista" | "neutral" | "bajista";

// FIC: Per-indicator contribution breakdown inside a consolidated confluence verdict.
// FIC: Desglose de la contribucion por indicador dentro de un veredicto de confluencia.
export interface ConfluenceComponent {
  indicator: string;
  available: boolean;
  signal: number; // directional reading in [-1, 1] before weighting
  weight: number; // nominal weight assigned to the indicator
  contribution: number; // normalized weighted contribution to the score
  value: number | null; // headline raw value for traceability
  detail: string; // Spanish human-readable explanation
}

// FIC: Consolidated confluence verdict with full traceability (US3 / FR-006 / FR-008).
// FIC: Veredicto de confluencia consolidado con trazabilidad completa (US3 / FR-006 / FR-008).
export interface ConfluenceVerdict {
  symbol: string;
  timeframe: Timeframe;
  verdict: ConfluenceVerdictLabel;
  score: number; // consolidated score in [-1, 1]
  components: ConfluenceComponent[];
  degraded: boolean;
  missing: string[]; // indicators that could not be evaluated
  inputs_used: string[]; // indicators that contributed to the score
  algorithm_version: string;
  computed_at: string; // ISO UTC
  source_input_hash: string; // sha256 truncated, identical input -> identical hash
  bars_used: number;
}

export const ALGORITHM_VERSION = "1.0.0";
