// src/components/dashboard/WorkHoursChart.tsx
"use client";

import { memo } from "react";

import { Card } from "@/components/ui/Card";
import WorkByPersonBar from "@/components/charts/WorkByPersonBar";
import { ChartErrorBoundary } from "@/components/ErrorBoundary";

function WorkHoursChart() {
  return (
    <Card
      title="Arbeitsstunden pro Person"
      subtitle="Alle historischen Daten - Kernchart"
      className="animate-fade-in"
    >
      <div className="h-96 px-2 sm:px-0">
        <ChartErrorBoundary>
          <WorkByPersonBar
            // Keine Filter - alle historischen Daten
            topN={0} // Alle Personen anzeigen
          />
        </ChartErrorBoundary>
      </div>
    </Card>
  );
}

export default memo(WorkHoursChart);
