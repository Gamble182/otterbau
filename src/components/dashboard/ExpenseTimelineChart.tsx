// src/components/dashboard/ExpenseTimelineChart.tsx
"use client";

import { memo } from "react";
import { Card } from "@/components/ui/Card";
import ExpensesLine from "@/components/charts/ExpensesLine";

interface ExpenseTimelineChartProps {
  filterDates: {
    from: string;
    to: string;
  };
  displayName: string;
  isFiltered: boolean;
}

function ExpenseTimelineChart({
  filterDates,
  displayName,
  isFiltered,
}: ExpenseTimelineChartProps) {
  // Dynamische Titel und Untertitel
  const getTitle = () => {
    if (!isFiltered) {
      return "Ausgabenverlauf - Gesamte Historie";
    }
    return `Ausgabenverlauf - ${displayName}`;
  };

  const getSubtitle = () => {
    if (!isFiltered) {
      return "Alle historischen Ausgabendaten";
    }
    if (displayName.includes("-")) {
      return "Tägliche Ausgaben im ausgewählten Zeitraum";
    }
    return "Tägliche Ausgaben im ausgewählten Monat";
  };

  return (
    <Card
      title={getTitle()}
      subtitle={getSubtitle()}
      className="animate-fade-in"
    >
      <div className="h-80 px-2 sm:px-0">
        <ExpensesLine
          from={filterDates.from}
          to={filterDates.to}
          // Für das Chart ist es egal ob es gefiltert ist - es verwendet from/to
        />
      </div>
    </Card>
  );
}

export default memo(ExpenseTimelineChart);
