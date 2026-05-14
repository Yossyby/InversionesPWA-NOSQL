import type { SourceConfig } from "./sourceConfig";

export type SignalDirection = "BUY" | "SELL" | "HOLD";

export interface SourceVerdict {
  sourceId: string;
  verdict: SignalDirection;
  confidence: number;
  rationale: string;
}

export interface ConfluenceResult {
  signal: SignalDirection;
  confidence: number;
  confluenceScore: number;
}

export interface DashboardSignalCard {
  signalId: string;
  instrument: string;
  signal: SignalDirection;
  confidence: number;
  confluenceScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  activeCores: string[];
  updatedAt: string;
  evidence: SourceVerdict[];
}

export interface DashboardConfluencePayload {
  generatedAt: string;
  instruments: string[];
  cards: DashboardSignalCard[];
}

const verdictWeights: Record<SignalDirection, number> = {
  BUY: 1,
  HOLD: 0,
  SELL: -1
};

export function evaluateConfluence(sources: SourceConfig[], verdicts: SourceVerdict[]): ConfluenceResult {
  const activeWeights = new Map(sources.filter((source) => source.enabled).map((source) => [source.id, source.weight]));

  let weightedScore = 0;
  let totalWeight = 0;

  for (const verdict of verdicts) {
    const weight = activeWeights.get(verdict.sourceId) ?? 0;
    weightedScore += verdictWeights[verdict.verdict] * weight * verdict.confidence;
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return { signal: "HOLD", confidence: 0, confluenceScore: 0 };
  }

  const normalized = weightedScore / totalWeight;
  const confidence = Math.min(1, Math.abs(normalized));
  const signal: SignalDirection = normalized > 0.15 ? "BUY" : normalized < -0.15 ? "SELL" : "HOLD";

  return {
    signal,
    confidence,
    confluenceScore: Math.round((normalized + 1) * 50)
  };
}

function resolveRiskLevel(confidence: number, confluenceScore: number): "LOW" | "MEDIUM" | "HIGH" {
  if (confidence >= 0.75 && confluenceScore >= 70) {
    return "LOW";
  }

  if (confidence >= 0.45 && confluenceScore >= 45) {
    return "MEDIUM";
  }

  return "HIGH";
}

/**
 * FIC: Build dashboard payload from confluence inputs for instrument-level monitoring.
 * Produces a deterministic response schema for the dashboard orchestrator route.
 *
 * FIC: Construye payload del dashboard desde entradas de confluencia para monitoreo por instrumento.
 * Produce un esquema de respuesta determinístico para la ruta orquestadora del dashboard.
 */
export function buildDashboardConfluencePayload(
  sources: SourceConfig[],
  input: Array<{ instrument: string; verdicts: SourceVerdict[] }>
): DashboardConfluencePayload {
  const cards = input.map((item, index) => {
    const confluence = evaluateConfluence(sources, item.verdicts);

    return {
      signalId: `sig-${index + 1}`,
      instrument: item.instrument,
      signal: confluence.signal,
      confidence: confluence.confidence,
      confluenceScore: confluence.confluenceScore,
      riskLevel: resolveRiskLevel(confluence.confidence, confluence.confluenceScore),
      activeCores: sources.filter((source) => source.enabled).map((source) => source.name),
      updatedAt: new Date().toISOString(),
      evidence: item.verdicts
    } satisfies DashboardSignalCard;
  });

  return {
    generatedAt: new Date().toISOString(),
    instruments: cards.map((card) => card.instrument),
    cards
  };
}

