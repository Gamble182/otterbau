"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import WorkByPersonBar from "@/components/charts/WorkByPersonBar";
import ExpensesByCategoryPie from "@/components/charts/ExpensesByCategoryPie";
import EnhancedExpensesLine from "@/components/charts/EnhancedExpensesLine";
import WorkHoursBar from "@/components/charts/WorkHoursBar";
import { useChartControls, CHART_CONFIGS } from "@/hooks/useChartControls";
import { ChartErrorBoundary } from "@/components/ErrorBoundary";
import { useEnhancedTimeFilter } from "@/hooks/useEnhancedTimeFilter";
import TimeFilter from "@/components/dashboard/TimeFilter";

export default function AnalysenPage() {
  // Time Filter State
  const currentDate = new Date();
  const [timeFilterState, setTimeFilterState] = useState({
    selectedOption: "gesamt" as "gesamt" | "custom",
    fromMonth: currentDate.getMonth(),
    fromYear: currentDate.getFullYear(),
    toMonth: currentDate.getMonth(),
    toYear: currentDate.getFullYear(),
  });

  const { filterDates, displayName, isFiltered } =
    useEnhancedTimeFilter(timeFilterState);

  // Chart Controls
  const workChartControls = useChartControls(CHART_CONFIGS.workByPerson);
  const expenseChartControls = useChartControls(
    CHART_CONFIGS.expensesByCategory
  );

  // Time Filter Handlers
  const handleOptionChange = (option: "gesamt" | "custom") => {
    setTimeFilterState((prev) => ({ ...prev, selectedOption: option }));
  };

  const handleFromChange = (month: number, year: number) => {
    setTimeFilterState((prev) => ({
      ...prev,
      fromMonth: month,
      fromYear: year,
    }));
  };

  const handleToChange = (month: number, year: number) => {
    setTimeFilterState((prev) => ({ ...prev, toMonth: month, toYear: year }));
  };

  // Zeitspanne bestimmen
  const getTimeSpanType = () => {
    if (!isFiltered) return "long";
    const fromDate = new Date(filterDates.from);
    const toDate = new Date(filterDates.to);
    const daysDiff = Math.ceil(
      (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff <= 31) return "month";
    if (daysDiff <= 93) return "quarter";
    return "long";
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-accent shadow-xl">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              📊 Analysen & Berichte
            </h1>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Detaillierte Auswertungen deiner Arbeitsstunden und Ausgaben mit
              flexiblen Filtern und interaktiven Charts
            </p>
          </div>
        </div>

        {/* Filter Section */}
        <TimeFilter
          selectedOption={timeFilterState.selectedOption}
          fromMonth={timeFilterState.fromMonth}
          fromYear={timeFilterState.fromYear}
          toMonth={timeFilterState.toMonth}
          toYear={timeFilterState.toYear}
          onOptionChange={handleOptionChange}
          onFromChange={handleFromChange}
          onToChange={handleToChange}
        />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Arbeitsstunden Chart */}
          <Card
            title="👥 Arbeitsstunden pro Person"
            subtitle={`${displayName} - ${
              isFiltered ? "Gefilterte" : "Alle"
            } Daten`}
            className="animate-fade-in"
          >
            <div className="space-y-4">
              {workChartControls.renderControls()}
              <div className="h-96">
                <ChartErrorBoundary>
                  <WorkByPersonBar
                    from={isFiltered ? filterDates.from : undefined}
                    to={isFiltered ? filterDates.to : undefined}
                    topN={workChartControls.topN}
                  />
                </ChartErrorBoundary>
              </div>
            </div>
          </Card>

          {/* Ausgaben Kategorie Chart */}
          <Card
            title="🏷️ Ausgaben nach Kategorie"
            subtitle={`${displayName} - ${
              isFiltered ? "Gefilterte" : "Alle"
            } Daten`}
            className="animate-fade-in"
          >
            <div className="space-y-4">
              {expenseChartControls.renderControls()}
              <div className="h-96">
                <ChartErrorBoundary>
                  <ExpensesByCategoryPie
                    from={isFiltered ? filterDates.from : undefined}
                    to={isFiltered ? filterDates.to : undefined}
                    topN={expenseChartControls.topN}
                  />
                </ChartErrorBoundary>
              </div>
            </div>
          </Card>
        </div>

        {/* Wöchentliche Arbeitsstunden */}
        <Card
          title="📅 Wöchentliche Arbeitsstunden"
          subtitle="Aktuelle Woche - Überblick"
          className="animate-fade-in"
        >
          <div className="h-80">
            <ChartErrorBoundary>
              <WorkHoursBar />
            </ChartErrorBoundary>
          </div>
        </Card>

        {/* Ausgabenverlauf - Vollbreite */}
        <Card
          title="📈 Detaillierter Ausgabenverlauf"
          subtitle={`${displayName} - Erweiterte Timeline-Analyse`}
          variant={isFiltered ? "default" : "glass"}
          className={`animate-fade-in ${
            !isFiltered ? "border-2 border-[var(--accent-primary)]/20" : ""
          }`}
        >
          <div className="h-[500px]">
            <ChartErrorBoundary>
              <EnhancedExpensesLine
                from={filterDates.from}
                to={filterDates.to}
                timeSpanType={getTimeSpanType()}
                isFiltered={isFiltered}
              />
            </ChartErrorBoundary>
          </div>
        </Card>

        {/* Info Footer */}
        <Card variant="glass" className="backdrop-blur">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse"></div>
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                Analysen basieren auf{" "}
                {isFiltered ? "gefilterten" : "allen verfügbaren"} Daten
              </span>
            </div>
            <div className="text-xs text-[var(--text-tertiary)]">
              Zeitraum: {displayName} • Datenstand:{" "}
              {new Date().toLocaleDateString("de-DE")}
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
