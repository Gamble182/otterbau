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

// Custom Hooks
import { useMonthYearFilter } from "@/hooks/useMonthYearFilter";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  useKeyboardShortcuts,
  createCommonShortcuts,
} from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { Card } from "@/components/ui/Card";

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

function HomePage() {
  // QuickAdd State Management
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddType, setQuickAddType] = useState<"work" | "expense">("work");
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Monats/Jahres-Filter State
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Custom Hooks - verwende useMonthYearFilter direkt
  const filterDates = useMonthYearFilter({
    month: selectedMonth,
    year: selectedYear,
  });
  const stats = useDashboardStats(filterDates);

  // Berechne Display-Informationen inline
  const displayName = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
  const isCurrentMonth =
    selectedMonth === currentDate.getMonth() &&
    selectedYear === currentDate.getFullYear();

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

        {/* Chart 1: Arbeitsstunden pro Person - ALLE DATEN */}
        <WorkHoursChart />

        {/* Chart 2: Ausgaben nach Kategorie - ALLE DATEN - Vergrößert */}
        <ExpenseCategoryChart />

        {/* Section 4: Monats/Jahres-Filter */}
        <TimeFilter
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />

        {/* Section 5: Gefilterte Statistiken */}
        <DashboardStats
          stats={stats}
          timeFilter="month"
        />

        {/* Chart 3: Ausgabenverlauf - GEFILTERT nach Monat/Jahr */}
        <ExpenseTimelineChart
          filterDates={filterDates}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />

        {/* Footer Status */}
        <Card variant="glass" className="backdrop-blur">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
            <div className="status-indicator status-online">
              <div className="status-led status-led-active" />
              <span className="font-medium">App läuft offline</span>
            </div>
            <div className="status-indicator status-offline">
              <div className="status-led status-led-neutral" />
              <span className="font-medium">Daten lokal gespeichert</span>
            </div>
            <div className="status-indicator status-offline">
              <div className="status-led status-led-neutral" />
              <span className="font-medium">
                {displayName}
                {isCurrentMonth && " (Aktuell)"}
              </span>
            </div>
          </div>
        </Card>

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
