// src/hooks/useChartControls.ts
"use client";

import { useState, useCallback } from 'react';

export interface ChartControlsConfig {
  defaultTopN: number;
  availableTopN: readonly number[];
  label?: string;
}

export function useChartControls(config: ChartControlsConfig) {
  const [topN, setTopN] = useState(config.defaultTopN);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTopNChange = useCallback((newTopN: number) => {
    setTopN(newTopN);
    setIsExpanded(false);
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Render Controls Component
  const renderControls = useCallback(() => {
    return (
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            {config.label || 'Anzeigen:'}
          </span>
          
          <div className="relative">
            <button
              onClick={toggleExpanded}
              className="px-3 py-1.5 text-sm font-medium bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Top {topN}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="absolute top-full left-0 mt-1 z-10 bg-[var(--bg-surface-elevated)] border border-[var(--border-emphasis)] rounded-lg shadow-xl min-w-[120px]">
                <div className="py-1">
                  {config.availableTopN.map((n) => (
                    <button
                      key={n}
                      onClick={() => handleTopNChange(n)}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-[var(--bg-secondary)] transition-colors ${
                        topN === n ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-medium' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      Top {n}
                      {topN === n && (
                        <span className="float-right">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-[var(--text-tertiary)] hidden sm:block">
          {topN === Math.max(...config.availableTopN) ? 'Alle angezeigt' : `${topN} von verfügbaren Einträgen`}
        </div>
      </div>
    );
  }, [config, topN, isExpanded, toggleExpanded, handleTopNChange]);

  return {
    topN,
    setTopN: handleTopNChange,
    renderControls,
    isExpanded,
    toggleExpanded,
  };
}

// Vordefinierte Konfigurationen für verschiedene Chart-Typen
export const CHART_CONFIGS = {
  workByPerson: {
    defaultTopN: 5,
    availableTopN: [1, 2, 3, 4, 5, 10, 15, 20],
    label: 'Personen:',
  },
  expensesByCategory: {
    defaultTopN: 10,
    availableTopN: [1, 2, 3, 4, 5, 10, 15, 20],
    label: 'Kategorien:',
  },
} as const;