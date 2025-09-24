// src/components/dashboard/WorkHoursChart.tsx
"use client";

import { memo } from "react";
import { Card } from "@/components/ui/Card";
import WorkByPersonBar from "@/components/charts/WorkByPersonBar";
import { ChartErrorBoundary } from "@/components/ErrorBoundary";
import { useChartControls, CHART_CONFIGS } from "@/hooks/useChartControls";

function WorkHoursChart() {
  const chartControls = useChartControls(CHART_CONFIGS.workByPerson);

  // Dynamische Höhenberechnung basierend auf topN
  const getChartHeight = (topN: number) => {
    // Basis-Höhe + zusätzliche Höhe pro Person (mindestens 60px pro Person)
    const baseHeight = 300;
    const heightPerPerson = Math.max(60, 400 / topN); // Mindestens 60px, maximal für bessere Sichtbarkeit
    return Math.max(baseHeight, topN * heightPerPerson + 100); // +100 für Achsen und Padding
  };

  const chartHeight = getChartHeight(chartControls.topN);

  return (
    <Card
      title="Arbeitsstunden pro Person"
      subtitle="Alle historischen Daten - Kernchart"
      className="animate-fade-in"
    >
      {/* Chart Controls */}
      <div className="px-2 sm:px-0">{chartControls.renderControls()}</div>

      {/* Chart mit dynamischer Höhe */}
      <div className="px-2 sm:px-0" style={{ height: `${chartHeight}px` }}>
        <ChartErrorBoundary>
          <WorkByPersonBar topN={chartControls.topN} />
        </ChartErrorBoundary>
      </div>

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] px-2 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
          <div className="text-[var(--text-secondary)]">
            Zeigt die {chartControls.topN} Personen mit den meisten
            Arbeitsstunden
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <div className="w-2 h-2 rounded-full bg-gradient-accent"></div>
            <span>Gesamte Projektlaufzeit</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(WorkHoursChart);
