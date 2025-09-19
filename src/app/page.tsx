"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import QuickAdd from "@/components/QuickAdd";
import { Card } from "@/components/ui/Card";

// Dashboard Komponenten
import QuickAddButtons from "@/components/dashboard/QuickAddButtons";
import TimeFilter from "@/components/dashboard/TimeFilter";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ProjectProgress from "@/components/dashboard/ProjectProgress";

// Chart Wrapper Komponenten
import WorkHoursChart from "@/components/dashboard/WorkHoursChart";
import ExpenseCategoryChart from "@/components/dashboard/ExpenseCategoryChart";
import ExpenseTimelineChart from "@/components/dashboard/ExpenseTimelineChart";

// Custom Hooks
import { useTimeFilter } from "@/hooks/useTimeFilter";
import { useDashboardStats } from "@/hooks/useDashboardStats";

// Types
import type { TimeFilterType } from "@/types/dashboard";

function HomePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>("month");

  // QuickAdd State Management
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddType, setQuickAddType] = useState<"work" | "expense">("work");

  // Custom Hooks
  const filterDates = useTimeFilter(timeFilter);
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

        {/* Section 3: Kern-Charts - größer und prominenter */}

        {/* Chart 1: Arbeitsstunden pro Person (Kernchart) */}
        <WorkHoursChart filterDates={filterDates} timeFilter={timeFilter} />

        {/* Chart 2: Ausgaben nach Kategorie (Kernchart) */}
        <ExpenseCategoryChart
          filterDates={filterDates}
          timeFilter={timeFilter}
        />

        {/* Section 4: Globaler Zeit-Filter */}
        <TimeFilter
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
        />

        {/* Section 5: Relevante Statistiken basierend auf Zeitfilter */}
        <DashboardStats stats={stats} timeFilter={timeFilter} />

        {/* Chart 3: Ausgabenverlauf (sekundär) */}
        <ExpenseTimelineChart timeFilter={timeFilter} />

        {/* Content based on active tab */}
        {activeTab === "work" && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center py-8">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                Arbeitszeit-Fokus
              </h3>
              <p className="text-[var(--text-secondary)] mb-6">
                Detailierte Arbeitszeit-Auswertungen und spezifische
                Statistiken.
              </p>
              <div className="inline-block p-4 rounded-xl bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20">
                <p className="text-sm text-[var(--text-secondary)]">
                  🚧 Arbeitszeit-spezifische Ansicht wird hier erweitert
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "expenses" && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center py-8">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                Ausgaben-Fokus
              </h3>
              <p className="text-[var(--text-secondary)] mb-6">
                Detailierte Ausgaben-Auswertungen und Budget-Übersichten.
              </p>
              <div className="inline-block p-4 rounded-xl bg-gradient-to-r from-[var(--coral-red)]/10 to-[var(--deep-red)]/10 border border-[var(--coral-red)]/20">
                <p className="text-sm text-[var(--text-secondary)]">
                  🚧 Ausgaben-spezifische Ansicht wird hier erweitert
                </p>
              </div>
            </div>
          </div>
        )}

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
                Projekt {Math.round((stats.totalHours / 1000) * 100)}% komplett
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
      </div>
    </AppShell>
  );
}

export default HomePage;
