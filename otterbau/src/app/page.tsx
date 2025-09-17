"use client";

import { useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import QuickActions from "@/components/QuickActions";
import { Card } from "@/components/ui/Card";

import DashboardCards from "@/components/DashboardCards";
import WorkHoursBar from "@/components/charts/WorkHoursBar";
import ExpensesLine from "@/components/charts/ExpensesLine";
import WorkByPersonBar from "@/components/charts/WorkByPersonBar";
import ExpensesByCategoryPie from "@/components/charts/ExpensesByCategoryPie";

import { useEntries } from "@/store/useEntries";
import { usePersons } from "@/store/usePersons";
import { isoDate, isoNow } from "@/lib/utils";

export default function Home() {
  // Stores
  const allEntries = useEntries((s) => s.items);
  const addEntry = useEntries((s) => s.add);
  const persons = usePersons((s) => s.items);

  // Quick-Add Aktionen
  async function addWork() {
    const p = persons[0]; // einfache Voreinstellung: erste Person
    if (!p) return alert("Bitte zuerst eine Person anlegen.");
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
  }

  async function addExpense() {
    await addEntry({
      type: "expense",
      date: isoDate(),
      tags: ["Allgemein"],
      payload: {
        position: "Material",
        category: "Baustelle",
        qty: 1,
        unitPrice: 25,
        total: 25,
        currency: "EUR",
        buyer: "Yannik",
      },
      createdAt: isoNow(),
      updatedAt: isoNow(),
    } as any);
  }

  // (Optional) einfache KPI-Basis für spätere Filter/Analyse
  const entryCount = useMemo(() => allEntries.length, [allEntries]);

  return (
    <div className="grid gap-4 pb-16 sm:pb-0">
      {/* Suche */}
      <SearchBar />

      {/* Optische Tabbar (UI-Stub) */}
      <Card>
        <div className="flex justify-around text-sm">
          <button className="text-blue-600 font-medium">Stunden</button>
          <button className="text-gray-500">Ausgaben</button>
          <button className="text-gray-500">Analyse</button>
        </div>
      </Card>

      {/* Dashboard-Kacheln */}
      <DashboardCards />

      {/* Quick-Actions */}
      <QuickActions onAddWork={addWork} onAddExpense={addExpense} />

      {/* Charts */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Arbeitszeit (Woche)">
          <div style={{ height: 240 }}>
            <WorkHoursBar />
          </div>
        </Card>

        <Card title="Ausgaben (Monat)">
          <div style={{ height: 240 }}>
            <ExpensesLine />
          </div>
        </Card>

        <Card title="Arbeitsstunden pro Person">
          <div style={{ height: 320 }}>
            <WorkByPersonBar />
          </div>
        </Card>

        <Card title="Ausgaben pro Kategorie">
          <div style={{ height: 340 }}>
            <ExpensesByCategoryPie />
          </div>
        </Card>
      </div>

      {/* kleine Fußzeile / Debug-Info */}
      <p className="text-xs text-gray-500 text-center mt-2">
        Einträge gesamt: {entryCount}
      </p>
    </div>
  );
}
