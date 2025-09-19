// src/components/dashboard/ExpenseCategoryChart.tsx
"use client";

import { memo } from "react";

import { Card } from "@/components/ui/Card";
import ExpensesByCategoryPie from "@/components/charts/ExpensesByCategoryPie";
import { ChartErrorBoundary } from "@/components/ErrorBoundary";

function ExpenseCategoryChart() {
  return (
    <Card
      title="Ausgaben nach Kategorie"
      subtitle="Alle historischen Daten - Kernchart"
      className="animate-fade-in"
    >
      {/* Größeres Chart für bessere Lesbarkeit */}
      <div className="h-[600px] px-2 sm:px-0">
        <ChartErrorBoundary>
          <ExpensesByCategoryPie
            // Keine Filter - alle historischen Daten
            topN={20} // Mehr Kategorien anzeigen
          />
        </ChartErrorBoundary>
      </div>
    </Card>
  );
}

export default memo(ExpenseCategoryChart);
