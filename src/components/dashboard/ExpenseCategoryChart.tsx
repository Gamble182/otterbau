// src/components/dashboard/ExpenseCategoryChart.tsx
"use client";

import { memo } from "react";
import { Card } from "@/components/ui/Card";
import ExpensesByCategoryPie from "@/components/charts/ExpensesByCategoryPie";
import { ChartErrorBoundary } from "@/components/ErrorBoundary";
import { useChartControls, CHART_CONFIGS } from "@/hooks/useChartControls";

function ExpenseCategoryChart() {
  const chartControls = useChartControls(CHART_CONFIGS.expensesByCategory);

  return (
    <Card
      title="Ausgaben nach Kategorie"
      subtitle="Alle historischen Daten - Kernchart"
      className="animate-fade-in"
    >
      {/* Chart Controls */}
      <div className="px-2 sm:px-0">{chartControls.renderControls()}</div>

      {/* Vergrößerter Chart für Desktop - deutlich mehr Höhe */}
      <div className="h-[800px] lg:h-[900px] px-2 sm:px-0">
        <ChartErrorBoundary>
          <ExpensesByCategoryPie topN={chartControls.topN} />
        </ChartErrorBoundary>
      </div>

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] px-2 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
          <div className="text-[var(--text-secondary)]">
            Zeigt die Top {chartControls.topN} Ausgabenkategorien als
            Donut-Diagramm
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)]"></div>
              <span>Prozentuale Verteilung</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--coral-red)]"></div>
              <span>Absolute Beträge</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(ExpenseCategoryChart);
