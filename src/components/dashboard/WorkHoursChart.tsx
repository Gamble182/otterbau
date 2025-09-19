// src/components/dashboard/WorkHoursChart.tsx
"use client";

import { memo } from "react";

import { Card } from "@/components/ui/Card";
import WorkByPersonBar from "@/components/charts/WorkByPersonBar";
import { ChartErrorBoundary } from "@/components/ErrorBoundary";
import type { TimeFilterRange, TimeFilterType } from "@/types/dashboard";

interface WorkHoursChartProps {
  filterDates: TimeFilterRange;
  timeFilter: TimeFilterType;
}

function WorkHoursChart({
  filterDates,
  timeFilter,
}: WorkHoursChartProps) {
  return (
    <Card
      title="Arbeitsstunden pro Person"
      subtitle={`Alle Personen im ${
        timeFilter === "month" ? "Monat" : "Jahr"
      } - Kernchart`}
      className="animate-fade-in"
    >
      <div className="h-96 px-2 sm:px-0">
        <ChartErrorBoundary>
          <WorkByPersonBar
            from={filterDates.from}
            to={filterDates.to}
            topN={0} // Alle Personen anzeigen
          />
        </ChartErrorBoundary>
      </div>
    </Card>
  );
}

export default memo(WorkHoursChart);
