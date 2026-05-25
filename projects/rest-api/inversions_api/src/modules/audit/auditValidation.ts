/**
 * T018-US4: Implementar herramienta de validación determinística
 * 
 * Valida que un análisis es reproducible: recalcula con los mismos datos
 * y comprueba que los scores coinciden.
 */

import type { FundamentalAnalysisData } from "../fundamental/fundamentalSourceContract";
import type { ViabilityScore } from "../fundamental/viabilityEngine";
import { ViabilityEngine } from "../fundamental/viabilityEngine";
import { getAnalysisAudit } from "./fundamentalAnalysisAudit";

/**
 * T018a: Resultado de validación determinística
 */
export interface DeterminismValidationResult {
  matches: boolean; // True si scores son idénticos
  divergencePoint?: string; // Qué métrica divergió
  original_score: number;
  recalculated_score: number;
  divergence_details?: {
    original_components: Record<string, number>;
    recalculated_components: Record<string, number>;
    differences: Record<string, number>;
  };
  message: string; // Resumen legible
}

/**
 * T018b-c: Reconstituir snapshot y re-ejecutar viabilityEngine.score()
 */
export async function validateDeterminism(
  ticker: string,
  originalDate: string // YYYY-MM-DD
): Promise<DeterminismValidationResult> {
  // Obtener snapshot de auditoría
  const auditRecord = await getAnalysisAudit(ticker, originalDate);

  if (!auditRecord) {
    return {
      matches: false,
      original_score: 0,
      recalculated_score: 0,
      message: `No audit record found for ${ticker} on ${originalDate}`
    };
  }

  // Reconstituir datos de snapshot
  const reconstructedData: FundamentalAnalysisData = {
    ticker: auditRecord.ticker,
    source: auditRecord.snapshot_data.source,
    dataVersion: auditRecord.snapshot_data.dataVersion,
    fetchTimestamp: auditRecord.snapshot_data.fetchTimestamp,
    priceHistory: auditRecord.snapshot_data.priceHistory,
    pe_ratio: auditRecord.snapshot_data.pe_ratio,
    roe: auditRecord.snapshot_data.roe,
    volatility_30d: auditRecord.snapshot_data.volatility_30d,
    volatility_60d: auditRecord.snapshot_data.volatility_60d,
    volatility_252d: auditRecord.snapshot_data.volatility_252d,
    market_cap: auditRecord.snapshot_data.market_cap,
    dividend_yield: auditRecord.snapshot_data.dividend_yield,
    eps_growth: auditRecord.snapshot_data.eps_growth,
    beta: auditRecord.snapshot_data.beta
  };

  // T018b: Re-ejecutar viabilityEngine.score() con mismos datos
  const engine = new ViabilityEngine();
  const recalculatedScore: ViabilityScore = engine.calculateViability(
    reconstructedData
  );

  // T018c: Comparar scores
  const originalScore = auditRecord.viability_score;
  const recalculatedValue = recalculatedScore.overall;

  // Permitir diferencia mínima por redondeo (0.01)
  const tolerance = 0.01;
  const matches = Math.abs(originalScore - recalculatedValue) < tolerance;

  if (matches) {
    // T018d: PASSED
    return {
      matches: true,
      original_score: originalScore,
      recalculated_score: recalculatedValue,
      message: `PASSED: Scores idénticos (${originalScore.toFixed(2)})`
    };
  }

  // T018d: DIVERGED - identificar qué métrica divergió
  const divergencePoint = identifyDivergence(
    auditRecord.calculated_metrics.componentScores,
    recalculatedScore.componentScores
  );

  return {
    matches: false,
    divergencePoint,
    original_score: originalScore,
    recalculated_score: recalculatedValue,
    divergence_details: {
      original_components: auditRecord.calculated_metrics.componentScores,
      recalculated_components: recalculatedScore.componentScores,
      differences: calculateDifferences(
        auditRecord.calculated_metrics.componentScores,
        recalculatedScore.componentScores
      )
    },
    message: `DIVERGED: Original score ${originalScore.toFixed(2)}, recalculated ${recalculatedValue.toFixed(2)} (divergence at ${divergencePoint})`
  };
}

/**
 * T018f: Identificar fuente de divergencia (data vs logic)
 */
function identifyDivergence(
  originalComponents: Record<string, number>,
  recalculatedComponents: Record<string, number>
): string {
  const keys = Object.keys(originalComponents);

  for (const key of keys) {
    const original = originalComponents[key];
    const recalculated = recalculatedComponents[key];

    const diff = Math.abs(original - recalculated);
    if (diff > 0.01) {
      return `${key} (original: ${original.toFixed(4)}, recalculated: ${recalculated.toFixed(4)})`;
    }
  }

  return "unknown";
}

/**
 * Calcular diferencias entre scores de componentes
 */
function calculateDifferences(
  original: Record<string, number>,
  recalculated: Record<string, number>
): Record<string, number> {
  const differences: Record<string, number> = {};

  for (const key of Object.keys(original)) {
    differences[key] = recalculated[key] - original[key];
  }

  return differences;
}

/**
 * T018e: Endpoint GET /api/team-03/audit/{ticker}/{dateIso}/validate
 * Esta función es el handler del endpoint
 */
export async function handleValidationRequest(
  ticker: string,
  dateIso: string
): Promise<{ validation: DeterminismValidationResult }> {
  const validation = await validateDeterminism(ticker, dateIso);
  return { validation };
}
