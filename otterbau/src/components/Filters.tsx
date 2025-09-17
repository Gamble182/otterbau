"use client";
import { useState, useMemo } from "react";
import { useEntries } from "@/store/useEntries";
import { Card } from "@/components/ui/Card";

export type FilterState = {
  type: "" | "work" | "expense" | "projectCost";
  from?: string;
  to?: string;
  person?: string;
  category?: string;
};

interface FiltersProps {
  onChange: (f: FilterState) => void;
}

export default function Filters({ onChange }: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [type, setType] = useState<FilterState["type"]>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [person, setPerson] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const entries = useEntries((s) => s.items);

  // Automatisch verfügbare Optionen extrahieren
  const { availablePersons, availableCategories } = useMemo(() => {
    const persons = new Set<string>();
    const categories = new Set<string>();

    entries.forEach((entry) => {
      const payload = entry.payload as any;

      if (entry.type === "work" && payload.personName) {
        persons.add(payload.personName);
      }

      if (payload.category) {
        categories.add(payload.category);
      }
    });

    return {
      availablePersons: Array.from(persons).sort(),
      availableCategories: Array.from(categories).sort(),
    };
  }, [entries]);

  // Filter-State aktualisieren
  useMemo(() => {
    onChange({
      type,
      from: from || undefined,
      to: to || undefined,
      person: person || undefined,
      category: category || undefined,
    });
  }, [type, from, to, person, category, onChange]);

  const hasActiveFilters = type || from || to || person || category;

  const clearFilters = () => {
    setType("");
    setFrom("");
    setTo("");
    setPerson("");
    setCategory("");
  };

  const setQuickFilter = (filter: "today" | "week" | "month") => {
    const now = new Date();
    let fromDate = "";

    if (filter === "today") {
      fromDate = now.toISOString().slice(0, 10);
      setFrom(fromDate);
      setTo(fromDate);
    } else if (filter === "week") {
      const startOfWeek = new Date(now);
      const day = (startOfWeek.getDay() + 6) % 7;
      startOfWeek.setDate(startOfWeek.getDate() - day);
      setFrom(startOfWeek.toISOString().slice(0, 10));
      setTo(now.toISOString().slice(0, 10));
    } else if (filter === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setFrom(startOfMonth.toISOString().slice(0, 10));
      setTo(now.toISOString().slice(0, 10));
    }
  };

  return (
    <Card>
      <div className="space-y-4">
        {/* Header mit Quick-Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-slate-600 dark:text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Filter
            </h3>
            {hasActiveFilters && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                Aktiv
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Filter Buttons */}
            <button
              onClick={() => setQuickFilter("today")}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              Heute
            </button>
            <button
              onClick={() => setQuickFilter("week")}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              Woche
            </button>
            <button
              onClick={() => setQuickFilter("month")}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              Monat
            </button>

            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg
                className={`w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Erweiterte Filter */}
        {isExpanded && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Typ Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Typ
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                >
                  <option value="">Alle Typen</option>
                  <option value="work">🕒 Arbeitszeit</option>
                  <option value="expense">💰 Ausgaben</option>
                  <option value="projectCost">🏗️ Projektkosten</option>
                </select>
              </div>

              {/* Person Filter (nur bei Arbeitszeit) */}
              {availablePersons.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Person
                  </label>
                  <select
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  >
                    <option value="">Alle Personen</option>
                    {availablePersons.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Kategorie Filter */}
              {availableCategories.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Kategorie
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  >
                    <option value="">Alle Kategorien</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Datums-Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Von Datum
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Bis Datum
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Clear Button */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Filter zurücksetzen
                </button>
              </div>
            )}
          </div>
        )}

        {/* Aktive Filter Anzeige */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Aktive Filter:
              </span>

              {type && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                  {type === "work"
                    ? "🕒 Arbeitszeit"
                    : type === "expense"
                    ? "💰 Ausgaben"
                    : "🏗️ Projektkosten"}
                  <button
                    onClick={() => setType("")}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}

              {person && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">
                  👤 {person}
                  <button
                    onClick={() => setPerson("")}
                    className="ml-1 hover:text-emerald-900"
                  >
                    ×
                  </button>
                </span>
              )}

              {category && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full">
                  🏷️ {category}
                  <button
                    onClick={() => setCategory("")}
                    className="ml-1 hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              )}

              {(from || to) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full">
                  📅 {from || "..."} - {to || "..."}
                  <button
                    onClick={() => {
                      setFrom("");
                      setTo("");
                    }}
                    className="ml-1 hover:text-amber-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Hilfsselector: gefilterte Items aus Store (clientseitig)
export function useFilteredEntries(f: FilterState) {
  const items = useEntries((s) => s.items);
  return useMemo(() => {
    return items
      .filter((e) => {
        // Typ Filter
        if (f.type && e.type !== f.type) return false;

        // Datums Filter
        if (f.from && e.date < f.from) return false;
        if (f.to && e.date > f.to) return false;

        // Person Filter (nur für work entries)
        if (f.person && e.type === "work") {
          const payload = e.payload as any;
          if (payload.personName !== f.person) return false;
        }

        // Kategorie Filter
        if (f.category) {
          const payload = e.payload as any;
          if (payload.category !== f.category) return false;
        }

        return true;
      })
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [items, f.type, f.from, f.to, f.person, f.category]);
}
