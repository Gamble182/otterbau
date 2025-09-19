"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { useEntries } from "@/store/useEntries";
import type { TimeFilterProps } from "@/types/dashboard";

interface TimeFilterPropsEnhanced
  extends Omit<TimeFilterProps, "timeFilter" | "onTimeFilterChange"> {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

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

export default function TimeFilter({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: TimeFilterPropsEnhanced) {
  const entries = useEntries((s) => s.items);

  // Verfügbare Jahre aus den Daten extrahieren
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    entries.forEach((entry) => {
      const year = new Date(entry.date).getFullYear();
      years.add(year);
    });

    // Sortiert und mit aktuellem Jahr falls noch keine Daten vorhanden
    const yearsArray = Array.from(years).sort((a, b) => b - a);
    const currentYear = new Date().getFullYear();
    if (!yearsArray.includes(currentYear)) {
      yearsArray.unshift(currentYear);
    }

    return yearsArray;
  }, [entries]);

  // Verfügbare Monate für das ausgewählte Jahr
  const availableMonths = useMemo(() => {
    const months = new Set<number>();
    entries.forEach((entry) => {
      const date = new Date(entry.date);
      if (date.getFullYear() === selectedYear) {
        months.add(date.getMonth());
      }
    });

    // Alle Monate 0-11 verfügbar machen, aber verfügbare hervorheben
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      name: MONTH_NAMES[i],
      hasData: months.has(i),
    }));
  }, [entries, selectedYear]);

  return (
    <Card variant="glass">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2 sm:px-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-lg">
            <svg
              className="w-6 h-6 text-white"
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
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              Zeitraum filtern
            </h3>
            <p className="text-[var(--text-secondary)]">
              Wähle einen spezifischen Monat und Jahr
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Jahr-Dropdown */}
          <div className="space-y-2">
            <label className="form-label text-sm font-semibold text-[var(--text-primary)]">
              Jahr
            </label>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
              className="form-select min-w-[120px] text-center font-bold"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Monat-Dropdown */}
          <div className="space-y-2">
            <label className="form-label text-sm font-semibold text-[var(--text-primary)]">
              Monat
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(parseInt(e.target.value))}
              className="form-select min-w-[140px] text-center font-bold"
            >
              {availableMonths.map((month) => (
                <option
                  key={month.value}
                  value={month.value}
                  className={month.hasData ? "" : "text-gray-400"}
                >
                  {month.name}
                  {month.hasData ? "" : " (keine Daten)"}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Select Buttons */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => {
                const now = new Date();
                onYearChange(now.getFullYear());
                onMonthChange(now.getMonth());
              }}
              className="filter-pill transition-all duration-200 px-4 py-2"
            >
              <span className="text-sm">📅</span>
              <span className="font-medium">Aktueller Monat</span>
            </button>

            <button
              onClick={() => {
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                onYearChange(lastMonth.getFullYear());
                onMonthChange(lastMonth.getMonth());
              }}
              className="filter-pill transition-all duration-200 px-4 py-2"
            >
              <span className="text-sm">📊</span>
              <span className="font-medium">Letzter Monat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Information über ausgewählten Zeitraum */}
      <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--text-secondary)]">
            Ausgewählter Zeitraum:
          </div>
          <div className="text-lg font-bold text-[var(--accent-primary)]">
            {MONTH_NAMES[selectedMonth]} {selectedYear}
          </div>
        </div>
      </div>
    </Card>
  );
}
