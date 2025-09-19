// src/components/dashboard/ExpenseCategoryChart.tsx
"use client";

import { Card } from "@/components/ui/Card";
import ExpensesByCategoryPie from "@/components/charts/ExpensesByCategoryPie";
import type { TimeFilterRange, TimeFilterType } from "@/types/dashboard";

interface ExpenseCategoryChartProps {
  filterDates: TimeFilterRange;
  timeFilter: TimeFilterType;
}

export default function ExpenseCategoryChart({
  filterDates,
  timeFilter,
}: ExpenseCategoryChartProps) {
  return (
    <Card
      title="Ausgaben nach Kategorie"
      subtitle={`Top 15 Kategorien im ${
        timeFilter === "month" ? "Monat" : "Jahr"
      } - Kernchart`}
      className="animate-fade-in"
    >
      <div className="h-96 px-2 sm:px-0">
        <ExpensesByCategoryPie
          from={filterDates.from}
          to={filterDates.to}
          topN={15} // Top 15 statt Top 8
        />
      </div>
    </Card>
  );
}
