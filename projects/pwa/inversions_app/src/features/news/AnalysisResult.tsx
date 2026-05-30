import { ExternalLink } from "lucide-react";
import type { AnalyzedNewsSource, NewsAnalysisAggregate, NewsConfluenceResponse, NewsVerdict } from "../../services/news/newsApi";

interface AnalysisResultProps {
  confluence?: NewsConfluenceResponse | null;
  manualAnalysis?: NewsAnalysisAggregate | null;
}

const PROVIDER_NAMES: Record<string, string> = {
  yahooFinance: "Yahoo Finance",
  finnhub: "Finnhub",
  newsapi: "NewsAPI",
  polygon: "Polygon",
  alphaVantage: "Alpha Vantage",
  manual: "Manual",
  url: "URL manual",
  tnmtAnalyzer: "TNMT"
};

function verdictLabel(verdict: NewsVerdict): string {
  if (verdict === "BUY") return "Compra / Alcista";
  if (verdict === "SELL") return "Venta / Bajista";
  return "Mantener / Neutral";
}

function verdictClass(verdict: NewsVerdict): string {
  if (verdict === "BUY") return "is-buy";
  if (verdict === "SELL") return "is-sell";
  return "is-hold";
}

function providerClass(provider: string): string {
  return `provider-${provider.replace(/[^a-z0-9]/gi, "").toLowerCase()}`;
}

function providerName(provider: string): string {
  return PROVIDER_NAMES[provider] ?? provider;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function SourceCard({ source }: { source: AnalyzedNewsSource }) {
  return (
    <article className="tnmt-article-card">
      <div className="tnmt-article-card__top">
        <div className="tnmt-article-badges">
          <span className={`tnmt-verdict ${verdictClass(source.verdict)}`}>{source.verdict}</span>
          <span className={`tnmt-provider-badge ${providerClass(source.provider)}`}>Fuente: {providerName(source.provider)}</span>
        </div>
        <span className="tnmt-confidence-label">{Math.round(source.confidence * 100)}% confianza</span>
      </div>
      <div className="tnmt-article-meta">
        <span>{formatDate(source.publishedAt)}</span>
        {source.url ? <span>URL verificable</span> : <span>Sin URL directa</span>}
      </div>
      <h4>{source.title}</h4>
      <p>{source.summary}</p>
      <div className="tnmt-tags">
        <span>Sentimiento: {source.sentiment}</span>
        <span>Credibilidad: {Math.round(source.credibilityScore * 100)}%</span>
        {source.affectedSymbols.map((symbol) => <span key={symbol}>{symbol}</span>)}
      </div>
      {source.url && (
        <a className="tnmt-source-link" href={source.url} target="_blank" rel="noreferrer">
          Abrir noticia real <ExternalLink size={14} />
        </a>
      )}
    </article>
  );
}

function ProviderBreakdown({ articles }: { articles: AnalyzedNewsSource[] }) {
  const counts = articles.reduce<Record<string, number>>((acc, article) => {
    acc[article.provider] = (acc[article.provider] ?? 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(counts);
  if (entries.length === 0) return null;

  return (
    <div className="tnmt-provider-breakdown">
      <strong>Noticias mostradas por proveedor:</strong>
      <div>
        {entries.map(([provider, count]) => (
          <span key={provider} className={`tnmt-provider-badge ${providerClass(provider)}`}>
            {providerName(provider)}: {count}
          </span>
        ))}
      </div>
    </div>
  );
}

export function AnalysisResult({ confluence, manualAnalysis }: AnalysisResultProps) {
  if (!confluence && !manualAnalysis) {
    return <p className="tnmt-empty">Carga noticias reales del ticker o pega fuentes propias para ver resultados.</p>;
  }

  const noRealNews = confluence && confluence.articles.length === 0;

  return (
    <div className="tnmt-results">
      {confluence && (
        <section className="tnmt-result-block tnmt-result-block--featured">
          <div className="tnmt-result-header">
            <div>
              <p className="tnmt-eyebrow">Confluencia por noticias reales</p>
              <h3>{confluence.symbol} · {verdictLabel(confluence.verdict)}</h3>
            </div>
            <span className={`tnmt-score ${verdictClass(confluence.verdict)}`}>{Math.round((confluence.score + 1) * 50)}/100</span>
          </div>
          <p className="tnmt-advice">{confluence.recommendation?.summary ?? "Señal generada desde noticias y sentimiento TNMT."}</p>
          <div className="tnmt-mini-grid">
            <span>Sentimiento: <strong>{confluence.sentiment}</strong></span>
            <span>Confianza: <strong>{Math.round(confluence.confidence * 100)}%</strong></span>
            <span>Fuentes reales: <strong>{confluence.articles.length}</strong></span>
            <span>Modo: <strong>{confluence.realDataOnly ? "100% real" : "mixto"}</strong></span>
          </div>
          <ProviderBreakdown articles={confluence.articles} />

          {noRealNews ? (
            <div className="tnmt-no-data">
              <strong>No se encontraron noticias reales para este ticker.</strong>
              <p>Agrega llaves de Finnhub, NewsAPI, Polygon o Alpha Vantage en el .env para ampliar la cobertura. No se generaron noticias demo.</p>
            </div>
          ) : (
            <div className="tnmt-articles-grid">
              {confluence.articles.map((article) => <SourceCard key={article.id} source={article} />)}
            </div>
          )}
        </section>
      )}

      {manualAnalysis && (
        <section className="tnmt-result-block">
          <div className="tnmt-result-header">
            <div>
              <p className="tnmt-eyebrow">Análisis manual de fuentes</p>
              <h3>{manualAnalysis.symbol} · {verdictLabel(manualAnalysis.verdict)}</h3>
            </div>
            <span className={`tnmt-score ${verdictClass(manualAnalysis.verdict)}`}>{Math.round((manualAnalysis.sentimentScore + 1) * 50)}/100</span>
          </div>
          <div className="tnmt-mini-grid">
            <span>BUY: <strong>{manualAnalysis.buyCount}</strong></span>
            <span>HOLD: <strong>{manualAnalysis.holdCount}</strong></span>
            <span>SELL: <strong>{manualAnalysis.sellCount}</strong></span>
          </div>
          <ProviderBreakdown articles={manualAnalysis.sources} />
          <div className="tnmt-articles-grid">
            {manualAnalysis.sources.map((source) => <SourceCard key={source.id} source={source} />)}
          </div>
        </section>
      )}
    </div>
  );
}
