/**
 * src/features/news/NewsSourcesAnalyzer.tsx
 * FIC: Analizador de fuentes de noticias — fuentes predeterminadas + empresas de watchlist
 *
 * Flujo:
 *  1. Muestra lista de fuentes predeterminadas (checkboxes, máx 5 seleccionadas)
 *  2. Toma automáticamente las empresas del watchlist (máx 5)
 *  3. "Analizar Fuentes" ejecuta el análisis para cada empresa contra las fuentes activas
 *  4. Muestra un card de resultado por empresa (BUY / SELL / HOLD)
 */

import React, { useState, useEffect } from 'react';
import { AnalysisResult } from './AnalysisResult';
import '../styles/NewsSourcesAnalyzer.css';

// ── Fuentes predeterminadas ──────────────────────────────────────────────────
const PREDEFINED_SOURCES = [
  { id: 'nasdaq',       url: 'nasdaq.com',       label: 'Nasdaq' },
  { id: 'investing',    url: 'investing.com',     label: 'Investing.com' },
  { id: 'cnbc',         url: 'cnbc.com',          label: 'CNBC' },
  { id: 'bloomberg',    url: 'bloomberg.com',     label: 'Bloomberg' },
  { id: 'reuters',      url: 'reuters.com',       label: 'Reuters' },
  { id: 'marketwatch',  url: 'marketwatch.com',   label: 'MarketWatch' },
  { id: 'yahoo',        url: 'finance.yahoo.com', label: 'Yahoo Finance' },
  { id: 'seekingalpha', url: 'seekingalpha.com',  label: 'Seeking Alpha' },
];

const MAX_SOURCES   = 5;
const MAX_COMPANIES = 5;

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface AnalysisResultData {
  company: string;
  verdict: 'BUY' | 'SELL' | 'HOLD';
  score: number;
  confidence: number;
  reasoning: string;
  keyPoints: string[];
  timestamp: string;
}

interface CompanyResult {
  symbol: string;
  loading: boolean;
  error: string | null;
  result: AnalysisResultData | null;
}

interface NewsSourcesAnalyzerProps {
  watchlistSymbols?: string[];
}

// ── Helpers visuales ──────────────────────────────────────────────────────────
const verdictColor = (v: string | null | undefined) => {
  if (v === 'BUY')  return '#00c853';
  if (v === 'SELL') return '#ff1744';
  return '#ffa000';
};

const verdictLabel = (v: string | null | undefined) => {
  if (v === 'BUY')  return 'Comprar';
  if (v === 'SELL') return 'Vender';
  return 'Mantener';
};

// ── Componente principal ──────────────────────────────────────────────────────
export const NewsSourcesAnalyzer: React.FC<NewsSourcesAnalyzerProps> = ({ watchlistSymbols }) => {
  // Fuentes seleccionadas (IDs de PREDEFINED_SOURCES), primeras 2 activadas por defecto
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>(['nasdaq', 'investing']);

  // Resultados por empresa: uno por cada símbolo de watchlist (máx MAX_COMPANIES)
  const companies = (watchlistSymbols ?? []).slice(0, MAX_COMPANIES);
  const [results, setResults] = useState<CompanyResult[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState(false);

  // Sincroniza el array de resultados cuando cambia la watchlist
  useEffect(() => {
    setResults(companies.map((sym) => ({ symbol: sym, loading: false, error: null, result: null })));
    setAnalyzed(false);
    setGlobalError(null);
  }, [watchlistSymbols?.join(',')]);

  // ── Toggle de fuente ────────────────────────────────────────────────────────
  const toggleSource = (id: string) => {
    setSelectedSourceIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SOURCES) return prev; // máximo alcanzado
      return [...prev, id];
    });
  };

  const selectedSources = PREDEFINED_SOURCES.filter((s) => selectedSourceIds.includes(s.id));

  // ── Análisis ────────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (companies.length === 0) {
      setGlobalError('No hay empresas en la watchlist. Agrega al menos una.');
      return;
    }
    if (selectedSources.length === 0) {
      setGlobalError('Selecciona al menos una fuente predeterminada.');
      return;
    }

    setGlobalError(null);
    setAnalyzed(true);

    // Marca todas como "cargando"
    setResults(companies.map((sym) => ({ symbol: sym, loading: true, error: null, result: null })));

    // Analiza cada empresa en paralelo
    const urls = selectedSources.map((s) => s.url);
    await Promise.allSettled(
      companies.map(async (sym, idx) => {
        try {
          const res = await fetch('/api/news/analyze-sources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company: sym, urls }),
          });
          const data = res.ok ? await res.json() : await res.json().then((e) => { throw new Error(e.error ?? 'Error en análisis'); });
          setResults((prev) => prev.map((r, i) => i === idx ? { ...r, loading: false, result: data } : r));
        } catch (err) {
          setResults((prev) => prev.map((r, i) => i === idx ? { ...r, loading: false, error: (err as Error).message } : r));
        }
      })
    );
  };

  const isLoading = results.some((r) => r.loading);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="news-sources-analyzer" style={{ fontFamily: 'var(--font-family)' }}>

      {/* ── Header ── */}
      <div className="nsa-header">
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
          Análisis de Fuentes de Noticias
        </h2>
        <p className="nsa-description" style={{ marginTop: 4, marginBottom: 0 }}>
          Selecciona fuentes predeterminadas. El sistema analiza el sentimiento de cada empresa
          de tu watchlist y genera una recomendación de inversión (Comprar, Vender, Mantener).
        </p>
      </div>

      {/* ── Cuerpo en dos columnas ── */}
      <div className="nsa-layout" style={{ gap: '1.5rem' }}>

        {/* ── Columna izquierda: configuración ── */}
        <div className="nsa-left" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Fuentes predeterminadas */}
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>
              Fuentes Predeterminadas
              <span style={{ marginLeft: 6, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                ({selectedSourceIds.length}/{MAX_SOURCES} seleccionadas)
              </span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {PREDEFINED_SOURCES.map((src) => {
                const active = selectedSourceIds.includes(src.id);
                const disabled = !active && selectedSourceIds.length >= MAX_SOURCES;
                return (
                  <label
                    key={src.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.45 : 1,
                      padding: '5px 10px',
                      borderRadius: 6,
                      background: active ? 'rgba(79,70,229,0.1)' : 'var(--color-surface-raised)',
                      border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      disabled={disabled}
                      onChange={() => toggleSource(src.id)}
                      style={{ accentColor: 'var(--color-accent)', width: 14, height: 14 }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: active ? 600 : 400 }}>
                      {src.label}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      {src.url}
                    </span>
                  </label>
                );
              })}
            </div>
            {selectedSourceIds.length >= MAX_SOURCES && (
              <p style={{ margin: '6px 0 0', fontSize: '0.7rem', color: 'var(--color-warning)' }}>
                Máximo {MAX_SOURCES} fuentes alcanzado.
              </p>
            )}
          </div>

          {/* Empresas de watchlist */}
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>
              Empresas de Watchlist
              <span style={{ marginLeft: 6, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                (máx {MAX_COMPANIES})
              </span>
            </p>
            {companies.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                Sin empresas en la watchlist. Agrega tickers en el panel lateral.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {companies.map((sym) => (
                  <span
                    key={sym}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'var(--color-accent-subtle)',
                      border: '1px solid var(--color-accent)',
                      color: 'var(--color-accent)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    {sym}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Error global */}
          {globalError && (
            <div className="nsa-error-box">
              <span className="error-icon">⚠</span>
              <p>{globalError}</p>
            </div>
          )}

          {/* Botón analizar */}
          <button
            className="nsa-analyze-btn"
            onClick={handleAnalyze}
            disabled={isLoading || companies.length === 0 || selectedSources.length === 0}
            style={{ marginTop: 'auto' }}
          >
            {isLoading ? 'Analizando...' : 'Analizar Fuentes'}
          </button>
        </div>

        {/* ── Columna derecha: resultados por empresa ── */}
        <div className="nsa-right" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!analyzed && (
            <div className="nsa-placeholder">
              <p>Selecciona fuentes y presiona "Analizar Fuentes" para ver los resultados por empresa.</p>
            </div>
          )}

          {analyzed && results.map((r) => (
            <div
              key={r.symbol}
              style={{
                border: `1px solid ${r.result ? verdictColor(r.result.verdict) : 'var(--color-border)'}`,
                borderRadius: 10,
                padding: '12px 16px',
                background: 'var(--color-surface-raised)',
              }}
            >
              {/* Cabecera del resultado por empresa */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.symbol}</span>
                {r.result && (
                  <span style={{
                    padding: '3px 12px',
                    borderRadius: 'var(--radius-pill)',
                    background: verdictColor(r.result.verdict),
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    letterSpacing: '0.04em',
                  }}>
                    {verdictLabel(r.result.verdict)}
                  </span>
                )}
              </div>

              {/* Estado de carga */}
              {r.loading && (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>
                  Analizando {r.symbol}…
                </p>
              )}

              {/* Error */}
              {r.error && (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-sell)', margin: 0 }}>
                  ⚠ {r.error}
                </p>
              )}

              {/* Resultado */}
              {r.result && (
                <>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 6, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    <span>Score: <strong style={{ color: 'var(--color-text)' }}>{r.result.score.toFixed(2)}</strong></span>
                    <span>Confianza: <strong style={{ color: 'var(--color-text)' }}>{(r.result.confidence * 100).toFixed(0)}%</strong></span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 8px', lineHeight: 1.5 }}>
                    {r.result.reasoning}
                  </p>
                  {r.result.keyPoints?.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {r.result.keyPoints.slice(0, 3).map((kp, i) => (
                        <li key={i}>{kp}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
