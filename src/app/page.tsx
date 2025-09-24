// src/app/page.tsx
"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import QuickAdd from "@/components/QuickAdd";

// Dashboard Komponenten
import QuickAddButtons from "@/components/dashboard/QuickAddButtons";
import TimeFilter from "@/components/dashboard/TimeFilter";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ProjectProgress from "@/components/dashboard/ProjectProgress";

// Chart Wrapper Komponenten - Historische Daten
import WorkHoursChart from "@/components/dashboard/WorkHoursChart";
import ExpenseCategoryChart from "@/components/dashboard/ExpenseCategoryChart";
import ExpenseTimelineChart from "@/components/dashboard/ExpenseTimelineChart";

// Enhanced Footer
import { EnhancedFooter } from "@/components/EnhancedFooter";

// Custom Hooks
import { useEnhancedTimeFilter } from "@/hooks/useEnhancedTimeFilter";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  useKeyboardShortcuts,
  createCommonShortcuts,
} from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";

function HomePage() {
  // QuickAdd State Management
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddType, setQuickAddType] = useState<"work" | "expense">("work");
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Enhanced Time Filter State
  const currentDate = new Date();
  const [timeFilterState, setTimeFilterState] = useState({
    selectedOption: "gesamt" as "gesamt" | "custom",
    fromMonth: currentDate.getMonth(),
    fromYear: currentDate.getFullYear(),
    toMonth: currentDate.getMonth(),
    toYear: currentDate.getFullYear(),
  });

  // Custom Hooks - verwende useEnhancedTimeFilter
  const { filterDates, displayName, isFiltered } =
    useEnhancedTimeFilter(timeFilterState);
  const stats = useDashboardStats(filterDates);

  // QuickAdd Handler Functions
  const openWorkDialog = () => {
    setQuickAddType("work");
    setShowQuickAdd(true);
  };

  const openExpenseDialog = () => {
    setQuickAddType("expense");
    setShowQuickAdd(true);
  };

  const closeQuickAdd = () => {
    setShowQuickAdd(false);
  };

  // Time Filter Handler Functions
  const handleOptionChange = (option: "gesamt" | "custom") => {
    setTimeFilterState((prev) => ({
      ...prev,
      selectedOption: option,
    }));
  };

  const handleFromChange = (month: number, year: number) => {
    setTimeFilterState((prev) => ({
      ...prev,
      fromMonth: month,
      fromYear: year,
    }));
  };

  const handleToChange = (month: number, year: number) => {
    setTimeFilterState((prev) => ({
      ...prev,
      toMonth: month,
      toYear: year,
    }));
  };

  // Keyboard shortcuts
  const shortcuts = createCommonShortcuts({
    onNewEntry: openWorkDialog,
    onHelp: () => setShowKeyboardHelp(true),
  });

  useKeyboardShortcuts(shortcuts);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Section 1: iOS-style CTAs */}
        <QuickAddButtons
          onWorkClick={openWorkDialog}
          onExpenseClick={openExpenseDialog}
        />

        {/* Section 2: Projektfortschritt */}
        <ProjectProgress />

        {/* Section 3: Kern-Charts - HISTORISCHE DATEN (ungefiltert) */}

        {/* Chart 1: Arbeitsstunden pro Person - ALLE DATEN - Vergrößert */}
        <WorkHoursChart />

        {/* Chart 2: Ausgaben nach Kategorie - ALLE DATEN - Vergrößert */}
        <ExpenseCategoryChart />

        {/* Section 4: Zeitraum-Filter */}
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

        {/* Section 5: Gefilterte Statistiken */}
        <DashboardStats
          stats={stats}
          displayName={displayName}
          isFiltered={isFiltered}
        />

        {/* Chart 3: Ausgabenverlauf - GEFILTERT nach Zeitraum */}
        <ExpenseTimelineChart
          filterDates={filterDates}
          displayName={displayName}
          isFiltered={isFiltered}
        />

        {/* Enhanced Footer mit dynamischen Status-Informationen */}
        <EnhancedFooter displayName={displayName} isFiltered={isFiltered} />

        {/* QuickAdd Modal - Conditional Rendering */}
        {showQuickAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeQuickAdd}
            ></div>
            <div className="relative z-10 w-full max-w-lg mx-4">
              <QuickAdd onClose={closeQuickAdd} initialType={quickAddType} />
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        <KeyboardShortcutsHelp
          shortcuts={shortcuts}
          isOpen={showKeyboardHelp}
          onClose={() => setShowKeyboardHelp(false)}
        />
      </div>
    </AppShell>
  );
}

export default HomePage;
