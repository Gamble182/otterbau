"use client";
import { useState, useMemo } from "react";
import { useEntries } from "@/store/useEntries";
import { Card } from "@/components/ui/Card";
import type { WorkPayload, ExpensePayload, ProjectCostPayload } from "@/lib/schemas/zod";

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

  // Extract available options automatically
  const { availablePersons, availableCategories } = useMemo(() => {
    const persons = new Set<string>();
    const categories = new Set<string>();

    entries.forEach((entry) => {
      if (entry.type === "work") {
        const payload = entry.payload as WorkPayload;
        if (payload.personName) {
          persons.add(payload.personName);
        }
      }

      if (entry.type === "expense" || entry.type === "projectCost") {
        const payload = entry.payload as ExpensePayload | ProjectCostPayload;
        if (payload.category) {
          categories.add(payload.category);
        }
      }
    });

    return {
      availablePersons: Array.from(persons).sort(),
      availableCategories: Array.from(categories).sort(),
    };
  }, [entries]);

  // Update filter state
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
    <Card variant="glass">
      <div className="space-y-6">
        {/* Header with Quick-Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
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
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Filter
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Einträge eingrenzen
              </p>
            </div>
            {hasActiveFilters && (
              <div className="px-3 py-1 bg-gradient-accent text-white text-xs font-semibold rounded-full animate-scale-in">
                Aktiv
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Filter Buttons with Sony styling */}
            {[
              { label: "Heute", filter: "today" as const, icon: "📅" },
              { label: "Woche", filter: "week" as const, icon: "🗓️" },
              { label: "Monat", filter: "month" as const, icon: "📊" },
            ].map((item, index) => (
              <button
                key={item.filter}
                onClick={() => setQuickFilter(item.filter)}
                className="filter-pill animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="text-xs">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}

            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn btn-ghost btn-sm"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
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

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-6 animate-slide-up">
            {/* Type & Category Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="form-label">Typ</label>
                <select
                  value={type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value as FilterState["type"])}
                  className="form-select"
                >
                  <option value="">Alle Typen</option>
                  <option value="work">⏰ Arbeitszeit</option>
                  <option value="expense">💰 Ausgaben</option>
                  <option value="projectCost">🏗️ Projektkosten</option>
                </select>
              </div>

              {/* Person Filter */}
              {availablePersons.length > 0 && (
                <div className="space-y-2">
                  <label className="form-label">Person</label>
                  <select
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Alle Personen</option>
                    {availablePersons.map((p) => (
                      <option key={p} value={p}>
                        👤 {p}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category Filter */}
              {availableCategories.length > 0 && (
                <div className="space-y-2">
                  <label className="form-label">Kategorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Alle Kategorien</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        🏷️ {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Date Range Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="form-label">Von Datum</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <label className="form-label">Bis Datum</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Clear Button */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary animate-scale-in"
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

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-[var(--border-subtle)] animate-fade-in">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-[var(--text-secondary)] mr-2">
                Aktive Filter:
              </span>

              {type && (
                <span className="filter-pill active">
                  {type === "work"
                    ? "⏰ Arbeitszeit"
                    : type === "expense"
                    ? "💰 Ausgaben"
                    : "🏗️ Projektkosten"}
                  <button
                    onClick={() => setType("")}
                    className="ml-2 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}

              {person && (
                <span className="filter-pill active">
                  👤 {person}
                  <button
                    onClick={() => setPerson("")}
                    className="ml-2 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}

              {category && (
                <span className="filter-pill active">
                  🏷️ {category}
                  <button
                    onClick={() => setCategory("")}
                    className="ml-2 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}

              {(from || to) && (
                <span className="filter-pill active">
                  📅 {from || "..."} - {to || "..."}
                  <button
                    onClick={() => {
                      setFrom("");
                      setTo("");
                    }}
                    className="ml-2 hover:text-white"
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

// Helper selector: filtered items from store (client-side)
export function useFilteredEntries(f: FilterState) {
  const items = useEntries((s) => s.items);
  return useMemo(() => {
    return items
      .filter((e) => {
        // Type Filter
        if (f.type && e.type !== f.type) return false;

        // Date Filter
        if (f.from && e.date < f.from) return false;
        if (f.to && e.date > f.to) return false;

        // Person Filter (only for work entries)
        if (f.person && e.type === "work") {
          const payload = e.payload as WorkPayload;
          if (payload.personName !== f.person) return false;
        }

        // Category Filter
        if (f.category && (e.type === "expense" || e.type === "projectCost")) {
          const payload = e.payload as ExpensePayload | ProjectCostPayload;
          if (payload.category !== f.category) return false;
        }

        return true;
      })
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [items, f.type, f.from, f.to, f.person, f.category]);
}
