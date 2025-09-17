"use client";

import { useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import QuickActions from "@/components/QuickActions";
import QuickAdd from "@/components/QuickAdd";
import { Card, StatsCard } from "@/components/ui/Card";
import DashboardCards from "@/components/DashboardCards";
import WorkHoursBar from "@/components/charts/WorkHoursBar";
import ExpensesLine from "@/components/charts/ExpensesLine";
import WorkByPersonBar from "@/components/charts/WorkByPersonBar";
import ExpensesByCategoryPie from "@/components/charts/ExpensesByCategoryPie";
import EntryList from "@/components/EntryList";
import Filters from "@/components/Filters";
import type { FilterState } from "@/components/Filters";

import { useEntries } from "@/store/useEntries";
import { usePersons } from "@/store/usePersons";
import { isoDate, isoNow } from "@/lib/utils";

const TABS = [
  {
    id: "dashboard",
    label: "Übersicht",
    icon: (
      <svg
        className="w-5 h-5"
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
    ),
  },
  {
    id: "work",
    label: "Arbeitszeit",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: "expenses",
    label: "Ausgaben",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
        />
      </svg>
    ),
  },
  {
    id: "entries",
    label: "Alle Einträge",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filter, setFilter] = useState<FilterState>({
    type: "",
    from: undefined,
    to: undefined,
  });

  // Stores
  const allEntries = useEntries((s) => s.items);
  const addEntry = useEntries((s) => s.add);
  const persons = usePersons((s) => s.items);

  // Quick-Add Actions
  async function addWork() {
    const p = persons[0];
    if (!p) {
      alert("Bitte zuerst eine Person anlegen.");
      return;
    }

    try {
      await addEntry({
        type: "work",
        date: isoDate(),
        tags: [],
        payload: {
          personId: p.id,
          personName: p.name,
          hours: 1.0,
          note: "Schnellerfassung",
        },
        createdAt: isoNow(),
        updatedAt: isoNow(),
      } as any);
    } catch (error) {
      console.error("Fehler beim Hinzufügen:", error);
      alert("Fehler beim Speichern. Bitte versuche es erneut.");
    }
  }

  async function addExpense() {
    try {
      await addEntry({
        type: "expense",
        date: isoDate(),
        tags: ["Material"],
        payload: {
          position: "Material",
          category: "Baustelle",
          qty: 1,
          unitPrice: 25,
          total: 25,
          currency: "EUR",
          buyer: "Schnellerfassung",
        },
        createdAt: isoNow(),
        updatedAt: isoNow(),
      } as any);
    } catch (error) {
      console.error("Fehler beim Hinzufügen:", error);
      alert("Fehler beim Speichern. Bitte versuche es erneut.");
    }
  }

  // KPIs calculation
  const stats = useMemo(() => {
    const now = new Date();
    const isoToday = now.toISOString().slice(0, 10);
    const startOfWeek = new Date(now);
    const day = (startOfWeek.getDay() + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - day);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let todayHours = 0,
      weekHours = 0,
      monthHours = 0;
    let weekExpenses = 0,
      monthExpenses = 0;
    let totalEntries = allEntries.length;

    for (const e of allEntries) {
      const d = new Date(e.date);
      if (e.type === "work") {
        const h = Number((e.payload as any).hours ?? 0);
        if (e.date.startsWith(isoToday)) todayHours += h;
        if (d >= startOfWeek) weekHours += h;
        if (d >= startOfMonth) monthHours += h;
      } else if (e.type === "expense") {
        const v = Number((e.payload as any).total ?? 0);
        if (d >= startOfWeek) weekExpenses += v;
        if (d >= startOfMonth) monthExpenses += v;
      }
    }

    return {
      todayHours,
      weekHours,
      monthHours,
      weekExpenses,
      monthExpenses,
      totalEntries,
    };
  }, [allEntries]);

  return (
    <div className="space-y-8 pb-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Willkommen zurück! 👋
        </h1>
        <p className="text-secondary">
          Deine Otterbau Übersicht für {new Date().toLocaleDateString("de-DE")}
        </p>
      </div>

      {/* Search */}
      <SearchBar />

      {/* Tab Navigation */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="tab-container flex-1 max-w-2xl">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <QuickAdd />
          </div>
        </div>
      </Card>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="space-y-8">
          {/* Quick Stats */}
          <DashboardCards />

          {/* Quick Actions */}
          <QuickActions onAddWork={addWork} onAddExpense={addExpense} />

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card
              title="Arbeitszeit (7 Tage)"
              subtitle="Wochenübersicht"
              className="chart-container"
            >
              <div className="h-64">
                <WorkHoursBar />
              </div>
            </Card>

            <Card
              title="Ausgaben (Monat)"
              subtitle="Monatsverlauf"
              className="chart-container"
            >
              <div className="h-64">
                <ExpensesLine />
              </div>
            </Card>

            <Card
              title="Stunden pro Person"
              subtitle="Gesamtverteilung"
              className="chart-container"
            >
              <div className="h-80">
                <WorkByPersonBar />
              </div>
            </Card>

            <Card
              title="Ausgaben nach Kategorie"
              subtitle="Kostenverteilung"
              className="chart-container"
            >
              <div className="h-80">
                <ExpensesByCategoryPie />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Work Tab */}
      {activeTab === "work" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Heute"
              value={`${stats.todayHours.toFixed(1)}h`}
              trend={stats.todayHours > 0 ? "up" : "neutral"}
              icon={
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Diese Woche"
              value={`${stats.weekHours.toFixed(1)}h`}
              change={`Ø ${(stats.weekHours / 7).toFixed(1)}h/Tag`}
              trend={stats.weekHours > 35 ? "up" : "neutral"}
              icon={
                <svg
                  className="w-5 h-5 text-accent"
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
              }
            />
            <StatsCard
              title="Dieser Monat"
              value={`${stats.monthHours.toFixed(1)}h`}
              change={`${Math.round(
                stats.monthHours / new Date().getDate()
              )} Tage aktiv`}
              trend="neutral"
              icon={
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Ziel (40h/Wo)"
              value={`${Math.round((stats.weekHours / 40) * 100)}%`}
              change={
                stats.weekHours >= 40
                  ? "Erreicht!"
                  : `${(40 - stats.weekHours).toFixed(1)}h fehlen`
              }
              trend={
                stats.weekHours >= 40
                  ? "up"
                  : stats.weekHours >= 20
                  ? "neutral"
                  : "down"
              }
              icon={
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              }
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card
              title="Wochenübersicht"
              className="chart-container lg:col-span-2"
            >
              <div className="h-64">
                <WorkHoursBar />
              </div>
            </Card>

            <Card
              title="Verteilung nach Personen"
              className="chart-container lg:col-span-2"
            >
              <div className="h-80">
                <WorkByPersonBar />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === "expenses" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Diese Woche"
              value={`€${stats.weekExpenses.toFixed(0)}`}
              change={`Ø €${(stats.weekExpenses / 7).toFixed(1)}/Tag`}
              trend="neutral"
              icon={
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Dieser Monat"
              value={`€${stats.monthExpenses.toFixed(0)}`}
              change={`€${Math.round(
                stats.monthExpenses / new Date().getDate()
              )}/Tag Ø`}
              trend="neutral"
              icon={
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Größte Ausgabe"
              value={`€${Math.max(
                ...allEntries
                  .filter((e) => e.type === "expense")
                  .map((e) => Number((e.payload as any).total) || 0),
                0
              ).toFixed(0)}`}
              change="Einzelposten"
              trend="neutral"
              icon={
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Ø pro Einkauf"
              value={`€${(
                stats.monthExpenses /
                Math.max(
                  allEntries.filter((e) => e.type === "expense").length,
                  1
                )
              ).toFixed(0)}`}
              change="Durchschnitt"
              trend="neutral"
              icon={
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              }
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card
              title="Ausgabenverlauf"
              className="chart-container lg:col-span-2"
            >
              <div className="h-64">
                <ExpensesLine />
              </div>
            </Card>

            <Card
              title="Kategorien-Aufteilung"
              className="chart-container lg:col-span-2"
            >
              <div className="h-80">
                <ExpensesByCategoryPie />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Entries Tab */}
      {activeTab === "entries" && (
        <div className="space-y-8">
          <Filters onChange={setFilter} />
          <EntryList filter={filter} />
        </div>
      )}

      {/* Footer */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
          <div className="status-indicator status-online">
            <div className="status-led status-led-active" />
            <span>App läuft offline</span>
          </div>
          <div className="status-indicator status-offline">
            <div className="status-led status-led-neutral" />
            <span>Daten lokal gespeichert</span>
          </div>
          <div className="status-indicator status-offline">
            <div className="status-led status-led-neutral" />
            <span>{stats.totalEntries} Einträge total</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
