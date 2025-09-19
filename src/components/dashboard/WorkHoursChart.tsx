// src/components/dashboard/WorkHoursChart.tsx
"use client";

import { Card } from "@/components/ui/Card";
import WorkByPersonBar from "@/components/charts/WorkByPersonBar";
import type { TimeFilterRange, TimeFilterType } from "@/types/dashboard";

interface WorkHoursChartProps {
  filterDates: TimeFilterRange;
  timeFilter: TimeFilterType;
}

export default function WorkHoursChart({
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
        <WorkByPersonBar
          from={filterDates.from}
          to={filterDates.to}
          topN={0} // Alle Personen anzeigen
        />
      </div>
    </Card>
  );
}
