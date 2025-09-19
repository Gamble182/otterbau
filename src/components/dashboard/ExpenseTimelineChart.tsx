// src/components/dashboard/ExpenseTimelineChart.tsx
"use client";

import { memo } from "react";

import { Card } from "@/components/ui/Card";
import ExpensesLine from "@/components/charts/ExpensesLine";
import type { TimeFilterRange } from "@/types/dashboard";

interface ExpenseTimelineChartProps {
  filterDates: TimeFilterRange;
  selectedMonth: number;
  selectedYear: number;
}

const MONTH_NAMES = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

function ExpenseTimelineChart({
  filterDates,
  selectedMonth,
  selectedYear,
}: ExpenseTimelineChartProps) {
  const monthName = MONTH_NAMES[selectedMonth];

  return (
    <Card
      title={`Ausgabenverlauf - ${monthName} ${selectedYear}`}
      subtitle="Tägliche Ausgaben im ausgewählten Monat"
      className="animate-fade-in"
    >
      <div className="h-80 px-2 sm:px-0">
        <ExpensesLine
          from={filterDates.from}
          to={filterDates.to}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </div>
    </Card>
  );
}

export default memo(ExpenseTimelineChart);
