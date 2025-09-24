// src/components/dashboard/ExpenseTimelineChart.tsx
"use client";

import { memo } from "react";
import { Card } from "@/components/ui/Card";
import EnhancedExpensesLine from "@/components/charts/EnhancedExpensesLine";

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
      return "💸 Ausgabenverlauf - Gesamte Historie";
    }
    return `💸 Ausgabenverlauf - ${displayName}`;
  };

  const getSubtitle = () => {
    if (!isFiltered) {
      return "Alle historischen Ausgabendaten mit kumulierten und absoluten Werten";
    }
    if (displayName.includes("-")) {
      return "Tägliche & kumulierte Ausgaben im ausgewählten Zeitraum";
    }
    return "Tägliche & kumulierte Ausgaben im ausgewählten Monat";
  };

  // Kreative Gestaltung: Gradient basierend auf Filter-Status
  const getCardVariant = () => {
    return isFiltered ? "default" : "glass";
  };

  // Zeitraum-Analyse für bessere UX
  const getTimeSpanInfo = () => {
    const fromDate = new Date(filterDates.from);
    const toDate = new Date(filterDates.to);
    const daysDiff = Math.ceil(
      (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff <= 31) {
      return { type: "month" as const, days: daysDiff, label: "Tägliche Ansicht" };
    } else if (daysDiff <= 93) {
      return { type: "quarter" as const, days: daysDiff, label: "Wöchentliche Trends" };
    } else {
      return { type: "long" as const, days: daysDiff, label: "Monatliche Übersicht" };
    }
  };

  const timeSpanInfo = getTimeSpanInfo();

  return (
    <Card
      title={getTitle()}
      subtitle={getSubtitle()}
      variant={getCardVariant()}
      className={`animate-fade-in ${
        !isFiltered ? "border-2 border-[var(--accent-primary)]/20" : ""
      }`}
    >
      {/* Kreative Header-Info */}
      <div className="px-2 sm:px-0 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-[var(--coral-red)]/10 to-[var(--deep-red)]/10 border border-[var(--coral-red)]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--coral-red)] to-[var(--deep-red)] flex items-center justify-center shadow-lg">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-[var(--text-primary)]">
                {timeSpanInfo.label}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {timeSpanInfo.days} Tage • {filterDates.from} bis{" "}
                {filterDates.to}
              </div>
            </div>
          </div>

          {/* Visuelle Indikatoren */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-[var(--coral-red)] shadow-lg"></div>
              <span className="text-[var(--text-secondary)]">Täglich</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-[var(--accent-primary)] shadow-lg"></div>
              <span className="text-[var(--text-secondary)]">Kumuliert</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-xs font-bold">
              {isFiltered ? "GEFILTERT" : "ALLE DATEN"}
            </div>
          </div>
        </div>
      </div>

      {/* Erweiterter Chart-Bereich */}
      <div className="h-96 px-2 sm:px-0">
        <EnhancedExpensesLine
          from={filterDates.from}
          to={filterDates.to}
          timeSpanType={timeSpanInfo.type}
          isFiltered={isFiltered}
        />
      </div>

      {/* Erweiterte Info-Sektion */}
      <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] px-2 sm:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="text-center sm:text-left">
            <div className="text-[var(--text-tertiary)] text-xs uppercase tracking-wider font-semibold mb-1">
              Darstellung
            </div>
            <div className="text-[var(--text-primary)] font-medium">
              Dynamische X-Achsen-Skalierung
            </div>
            <div className="text-[var(--text-secondary)] text-xs">
              {timeSpanInfo.type === "month"
                ? "Tage"
                : timeSpanInfo.type === "quarter"
                ? "Wochen"
                : "Monate"}
            </div>
          </div>

          <div className="text-center">
            <div className="text-[var(--text-tertiary)] text-xs uppercase tracking-wider font-semibold mb-1">
              Zeitraum
            </div>
            <div className="text-[var(--text-primary)] font-medium">
              {timeSpanInfo.days} Tage
            </div>
            <div className="text-[var(--text-secondary)] text-xs">
              {Math.round(timeSpanInfo.days / 7)} Wochen
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="text-[var(--text-tertiary)] text-xs uppercase tracking-wider font-semibold mb-1">
              Filter-Status
            </div>
            <div
              className={`font-medium ${
                isFiltered
                  ? "text-[var(--accent-primary)]"
                  : "text-[var(--coral-red)]"
              }`}
            >
              {isFiltered ? "Zeitraum-Filter aktiv" : "Komplette Historie"}
            </div>
            <div className="text-[var(--text-secondary)] text-xs">
              {isFiltered ? "Gefilterte Daten" : "Alle verfügbaren Daten"}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(ExpenseTimelineChart);
