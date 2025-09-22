// src/components/dashboard/TimeFilter.tsx
"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { useEntries } from "@/store/useEntries";

export interface TimeFilterProps {
  selectedOption: "gesamt" | "custom";
  fromMonth?: number;
  fromYear?: number;
  toMonth?: number;
  toYear?: number;
  onOptionChange: (option: "gesamt" | "custom") => void;
  onFromChange: (month: number, year: number) => void;
  onToChange: (month: number, year: number) => void;
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
  selectedOption,
  fromMonth,
  fromYear,
  toMonth,
  toYear,
  onOptionChange,
  onFromChange,
  onToChange,
}: TimeFilterProps) {
  const entries = useEntries((s) => s.items);

  // Verfügbare Jahre aus den Daten extrahieren
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    entries.forEach((entry) => {
      const year = new Date(entry.date).getFullYear();
      years.add(year);
    });

    // Sortiert und mit aktuellem Jahr falls noch keine Daten vorhanden
    const yearsArray = Array.from(years).sort((a, b) => a - b);
    const currentYear = new Date().getFullYear();
    if (!yearsArray.includes(currentYear)) {
      yearsArray.push(currentYear);
      yearsArray.sort((a, b) => a - b);
    }

    return yearsArray;
  }, [entries]);

  // Standard-Werte für aktuellen und letzten Monat
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthValue = lastMonth.getMonth();
  const lastMonthYear = lastMonth.getFullYear();

  const getDisplayText = () => {
    if (selectedOption === "gesamt") {
      return "Gesamte Historie";
    }

    if (
      fromMonth !== undefined &&
      fromYear !== undefined &&
      toMonth !== undefined &&
      toYear !== undefined
    ) {
      const fromText = `${MONTH_NAMES[fromMonth]} ${fromYear}`;
      const toText = `${MONTH_NAMES[toMonth]} ${toYear}`;
      return `${fromText} - ${toText}`;
    }

    return "Zeitraum wählen";
  };

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
              Wähle einen spezifischen Zeitraum oder gesamte Historie
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Filter-Option Radio Buttons */}
          <div className="space-y-2">
            <label className="form-label text-sm font-semibold text-[var(--text-primary)]">
              Filter-Typ
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="timeFilter"
                  value="gesamt"
                  checked={selectedOption === "gesamt"}
                  onChange={() => onOptionChange("gesamt")}
                  className="text-[var(--accent-primary)]"
                />
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Gesamt
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="timeFilter"
                  value="custom"
                  checked={selectedOption === "custom"}
                  onChange={() => onOptionChange("custom")}
                  className="text-[var(--accent-primary)]"
                />
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Zeitraum
                </span>
              </label>
            </div>
          </div>

          {/* Von-Bis Selects - nur wenn custom ausgewählt */}
          {selectedOption === "custom" && (
            <>
              {/* Von */}
              <div className="space-y-2">
                <label className="form-label text-sm font-semibold text-[var(--text-primary)]">
                  Von
                </label>
                <div className="flex gap-2">
                  <select
                    value={fromMonth ?? currentMonth}
                    onChange={(e) =>
                      onFromChange(
                        parseInt(e.target.value),
                        fromYear ?? currentYear
                      )
                    }
                    className="form-select text-center font-bold"
                  >
                    {MONTH_NAMES.map((month, index) => (
                      <option key={index} value={index}>
                        {month.slice(0, 3)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={fromYear ?? currentYear}
                    onChange={(e) =>
                      onFromChange(
                        fromMonth ?? currentMonth,
                        parseInt(e.target.value)
                      )
                    }
                    className="form-select text-center font-bold"
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bis */}
              <div className="space-y-2">
                <label className="form-label text-sm font-semibold text-[var(--text-primary)]">
                  Bis
                </label>
                <div className="flex gap-2">
                  <select
                    value={toMonth ?? currentMonth}
                    onChange={(e) =>
                      onToChange(
                        parseInt(e.target.value),
                        toYear ?? currentYear
                      )
                    }
                    className="form-select text-center font-bold"
                  >
                    {MONTH_NAMES.map((month, index) => (
                      <option key={index} value={index}>
                        {month.slice(0, 3)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={toYear ?? currentYear}
                    onChange={(e) =>
                      onToChange(
                        toMonth ?? currentMonth,
                        parseInt(e.target.value)
                      )
                    }
                    className="form-select text-center font-bold"
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => {
                    onFromChange(currentMonth, currentYear);
                    onToChange(currentMonth, currentYear);
                  }}
                  className="filter-pill transition-all duration-200 px-4 py-2"
                >
                  <span className="text-sm">📅</span>
                  <span className="font-medium">Aktuell</span>
                </button>

                <button
                  onClick={() => {
                    onFromChange(lastMonthValue, lastMonthYear);
                    onToChange(lastMonthValue, lastMonthYear);
                  }}
                  className="filter-pill transition-all duration-200 px-4 py-2"
                >
                  <span className="text-sm">📊</span>
                  <span className="font-medium">Letzter</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Information über ausgewählten Zeitraum */}
      <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--text-secondary)]">
            Ausgewählter Zeitraum:
          </div>
          <div className="text-lg font-bold text-[var(--accent-primary)]">
            {getDisplayText()}
          </div>
        </div>
      </div>
    </Card>
  );
}
