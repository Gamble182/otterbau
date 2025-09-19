// src/components/dashboard/ExpenseTimelineChart.tsx
"use client";

import { memo } from "react";

import { Card } from "@/components/ui/Card";
import ExpensesLine from "@/components/charts/ExpensesLine";
import type { TimeFilterType } from "@/types/dashboard";

interface ExpenseTimelineChartProps {
  timeFilter: TimeFilterType;
}

function ExpenseTimelineChart({
  timeFilter,
}: ExpenseTimelineChartProps) {
  return (
    <Card
      title={`Ausgabenverlauf - ${timeFilter === "month" ? "Monat" : "Jahr"}`}
      subtitle="Sekundäre Auswertung"
      className="animate-fade-in"
    >
      <div className="h-64 px-2 sm:px-0">
        <ExpensesLine />
      </div>
    </Card>
  );
}

export default memo(ExpenseTimelineChart);
