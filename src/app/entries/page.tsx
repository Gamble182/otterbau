"use client";

import { useState, useMemo } from "react";
import AppShell from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { useEntries } from "@/store/useEntries";
import { usePersons } from "@/store/usePersons";
import type { Entry, WorkPayload, ExpensePayload } from "@/lib/schemas/zod";

type SortKey = "date" | "createdAt" | "value" | "name" | "category";
type SortOrder = "asc" | "desc";

interface TableSort {
  key: SortKey;
  order: SortOrder;
}

interface FilterState {
  search: string;
  dateFrom: string;
  dateTo: string;
  person: string;
  category: string;
  manufacturer: string;
  buyer: string;
}

// Hilfsfunktion für Tausender-Trennzeichen
const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null) return "0";
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

// Hilfsfunktion für Währungsformatierung
const formatCurrency = (num: number | undefined): string => {
  if (num === undefined || num === null) return "0,00€";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// Hilfsfunktion für Wochentag
const getWeekday = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("de-DE", { weekday: "short" });
};

export default function EntriesPage() {
  const entries = useEntries((s) => s.items);
  const persons = usePersons((s) => s.items);
  const removeEntry = useEntries((s) => s.remove);

  // Lazy Loading States
  const [workEntriesLimit, setWorkEntriesLimit] = useState(20);
  const [expenseEntriesLimit, setExpenseEntriesLimit] = useState(20);

  // Filter & Sort States
  const [filter, setFilter] = useState<FilterState>({
    search: "",
    dateFrom: "",
    dateTo: "",
    person: "",
    category: "",
    manufacturer: "",
    buyer: "",
  });

  const [workSort, setWorkSort] = useState<TableSort>({
    key: "date",
    order: "desc",
  });
  const [expenseSort, setExpenseSort] = useState<TableSort>({
    key: "date",
    order: "desc",
  });

  const [activeTab, setActiveTab] = useState<"work" | "expense">("work");

  // Extract filter options from data
  const filterOptions = useMemo(() => {
    const categories = new Set<string>();
    const manufacturers = new Set<string>();
    const buyers = new Set<string>();

    entries.forEach((entry) => {
      if (entry.type === "expense") {
        const payload = entry.payload as ExpensePayload;
        if (payload.category) categories.add(payload.category);
        if (payload.manufacturer) manufacturers.add(payload.manufacturer);
        if (payload.buyer) buyers.add(payload.buyer);
      }
    });

    return {
      categories: Array.from(categories).sort(),
      manufacturers: Array.from(manufacturers).sort(),
      buyers: Array.from(buyers).sort(),
    };
  }, [entries]);

  // Filter and sort work entries
  const workEntries = useMemo(() => {
    let filtered = entries.filter((e) => e.type === "work");

    // Apply filters
    if (filter.search) {
      filtered = filtered.filter((e) => {
        const payload = e.payload as WorkPayload;
        const searchLower = filter.search.toLowerCase();
        return (
          payload.personName?.toLowerCase().includes(searchLower) ||
          payload.note?.toLowerCase().includes(searchLower) ||
          payload.project?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (filter.dateFrom) {
      filtered = filtered.filter((e) => e.date >= filter.dateFrom);
    }

    if (filter.dateTo) {
      filtered = filtered.filter((e) => e.date <= filter.dateTo);
    }

    if (filter.person) {
      filtered = filtered.filter((e) => {
        const payload = e.payload as WorkPayload;
        return payload.personName === filter.person;
      });
    }

    // Sort
    return filtered.sort((a, b) => {
      const aPayload = a.payload as WorkPayload;
      const bPayload = b.payload as WorkPayload;

      let aVal: any, bVal: any;

      switch (workSort.key) {
        case "date":
          aVal = a.date;
          bVal = b.date;
          break;
        case "createdAt":
          aVal = a.createdAt;
          bVal = b.createdAt;
          break;
        case "value":
          aVal = aPayload.hours || 0;
          bVal = bPayload.hours || 0;
          break;
        case "name":
          aVal = aPayload.personName || "";
          bVal = bPayload.personName || "";
          break;
        default:
          return 0;
      }

      if (workSort.order === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
  }, [entries, filter, workSort]);

  // Filter and sort expense entries
  const expenseEntries = useMemo(() => {
    let filtered = entries.filter((e) => e.type === "expense");

    // Apply filters
    if (filter.search) {
      filtered = filtered.filter((e) => {
        const payload = e.payload as ExpensePayload;
        const searchLower = filter.search.toLowerCase();
        return (
          payload.position?.toLowerCase().includes(searchLower) ||
          payload.manufacturer?.toLowerCase().includes(searchLower) ||
          payload.category?.toLowerCase().includes(searchLower) ||
          payload.buyer?.toLowerCase().includes(searchLower) ||
          payload.note?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (filter.dateFrom) {
      filtered = filtered.filter((e) => e.date >= filter.dateFrom);
    }

    if (filter.dateTo) {
      filtered = filtered.filter((e) => e.date <= filter.dateTo);
    }

    if (filter.category) {
      filtered = filtered.filter((e) => {
        const payload = e.payload as ExpensePayload;
        return payload.category === filter.category;
      });
    }

    if (filter.manufacturer) {
      filtered = filtered.filter((e) => {
        const payload = e.payload as ExpensePayload;
        return payload.manufacturer === filter.manufacturer;
      });
    }

    if (filter.buyer) {
      filtered = filtered.filter((e) => {
        const payload = e.payload as ExpensePayload;
        return payload.buyer === filter.buyer;
      });
    }

    // Sort
    return filtered.sort((a, b) => {
      const aPayload = a.payload as ExpensePayload;
      const bPayload = b.payload as ExpensePayload;

      let aVal: any, bVal: any;

      switch (expenseSort.key) {
        case "date":
          aVal = a.date;
          bVal = b.date;
          break;
        case "createdAt":
          aVal = a.createdAt;
          bVal = b.createdAt;
          break;
        case "value":
          aVal = aPayload.total || 0;
          bVal = bPayload.total || 0;
          break;
        case "name":
          aVal = aPayload.position || "";
          bVal = bPayload.position || "";
          break;
        case "category":
          aVal = aPayload.category || "";
          bVal = bPayload.category || "";
          break;
        default:
          return 0;
      }

      if (expenseSort.order === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
  }, [entries, filter, expenseSort]);

  // Lazy loading slices
  const displayedWorkEntries = workEntries.slice(0, workEntriesLimit);
  const displayedExpenseEntries = expenseEntries.slice(0, expenseEntriesLimit);

  // Handle delete with confirmation
  const handleDelete = async (entry: Entry) => {
    const entryName =
      entry.type === "work"
        ? `${(entry.payload as WorkPayload).personName} - ${formatNumber(
            (entry.payload as WorkPayload).hours
          )}h`
        : `${(entry.payload as ExpensePayload).position} - ${formatCurrency(
            (entry.payload as ExpensePayload).total
          )}`;

    const confirmed = window.confirm(
      `Möchtest du diesen Eintrag wirklich löschen?\n\n"${entryName}"\n\nDiese Aktion kann nicht rückgängig gemacht werden.`
    );

    if (confirmed) {
      try {
        await removeEntry(entry.id);
      } catch (error) {
        console.error("Fehler beim Löschen:", error);
        alert("Fehler beim Löschen des Eintrags");
      }
    }
  };

  // Sort handler
  const handleSort = (
    type: "work" | "expense",
    key: SortKey,
    currentSort: TableSort,
    setSortFn: (sort: TableSort) => void
  ) => {
    if (currentSort.key === key) {
      setSortFn({
        key,
        order: currentSort.order === "asc" ? "desc" : "asc",
      });
    } else {
      setSortFn({ key, order: "desc" });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  // Clear filters
  const clearFilters = () => {
    setFilter({
      search: "",
      dateFrom: "",
      dateTo: "",
      person: "",
      category: "",
      manufacturer: "",
      buyer: "",
    });
  };

  const hasActiveFilters = Object.values(filter).some((val) => val !== "");

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-lg">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Alle Einträge
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              {formatNumber(workEntries.length)} Arbeitszeit-Einträge •{" "}
              {formatNumber(expenseEntries.length)} Ausgaben-Einträge
            </p>
          </div>
        </div>

        {/* Advanced Filter Card */}
        <Card variant="glass">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <div className="search-icon">
                <svg
                  className="w-5 h-5 text-[var(--text-tertiary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={filter.search}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, search: e.target.value }))
                }
                placeholder="Suche nach Personen, Positionen, Notizen..."
                className="search-input"
              />
              {filter.search && (
                <button
                  onClick={() => setFilter((prev) => ({ ...prev, search: "" }))}
                  className="absolute right-4 p-2 hover:bg-[var(--bg-surface)] rounded-full transition-all"
                >
                  <svg
                    className="w-4 h-4 text-[var(--text-tertiary)]"
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
                </button>
              )}
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Date Range */}
              <div className="space-y-2">
                <label className="form-label text-sm">Von Datum</label>
                <input
                  type="date"
                  value={filter.dateFrom}
                  onChange={(e) =>
                    setFilter((prev) => ({ ...prev, dateFrom: e.target.value }))
                  }
                  className="form-input text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="form-label text-sm">Bis Datum</label>
                <input
                  type="date"
                  value={filter.dateTo}
                  onChange={(e) =>
                    setFilter((prev) => ({ ...prev, dateTo: e.target.value }))
                  }
                  className="form-input text-sm"
                />
              </div>

              {/* Person */}
              <div className="space-y-2">
                <label className="form-label text-sm">Person</label>
                <select
                  value={filter.person}
                  onChange={(e) =>
                    setFilter((prev) => ({ ...prev, person: e.target.value }))
                  }
                  className="form-select text-sm"
                >
                  <option value="">Alle Personen</option>
                  {persons.map((person) => (
                    <option key={person.id} value={person.name}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="form-label text-sm">Kategorie</label>
                <select
                  value={filter.category}
                  onChange={(e) =>
                    setFilter((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="form-select text-sm"
                >
                  <option value="">Alle Kategorien</option>
                  {filterOptions.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Manufacturer */}
              <div className="space-y-2">
                <label className="form-label text-sm">Hersteller</label>
                <select
                  value={filter.manufacturer}
                  onChange={(e) =>
                    setFilter((prev) => ({
                      ...prev,
                      manufacturer: e.target.value,
                    }))
                  }
                  className="form-select text-sm"
                >
                  <option value="">Alle Hersteller</option>
                  {filterOptions.manufacturers.map((mfr) => (
                    <option key={mfr} value={mfr}>
                      {mfr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buyer */}
              <div className="space-y-2">
                <label className="form-label text-sm">Käufer</label>
                <select
                  value={filter.buyer}
                  onChange={(e) =>
                    setFilter((prev) => ({ ...prev, buyer: e.target.value }))
                  }
                  className="form-select text-sm"
                >
                  <option value="">Alle Käufer</option>
                  {filterOptions.buyers.map((buyer) => (
                    <option key={buyer} value={buyer}>
                      {buyer}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters & Clear */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filter).map(([key, value]) => {
                    if (!value) return null;
                    return (
                      <span
                        key={key}
                        className="filter-pill active animate-scale-in"
                      >
                        {key === "dateFrom"
                          ? `Ab: ${value}`
                          : key === "dateTo"
                          ? `Bis: ${value}`
                          : `${
                              key.charAt(0).toUpperCase() + key.slice(1)
                            }: ${value}`}
                        <button
                          onClick={() =>
                            setFilter((prev) => ({ ...prev, [key]: "" }))
                          }
                          className="ml-2 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary btn-sm"
                >
                  Alle Filter löschen
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Tab Navigation */}
        <Card variant="glass">
          <div className="tab-container">
            <button
              onClick={() => setActiveTab("work")}
              className={`tab-item ${activeTab === "work" ? "active" : ""}`}
            >
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
              <span className="font-medium">
                Arbeitszeit ({formatNumber(workEntries.length)})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("expense")}
              className={`tab-item ${activeTab === "expense" ? "active" : ""}`}
            >
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
              <span className="font-medium">
                Ausgaben ({formatNumber(expenseEntries.length)})
              </span>
            </button>
          </div>
        </Card>

        {/* Work Entries Table */}
        {activeTab === "work" && (
          <div className="max-w-none -mx-4 px-4 lg:-mx-8 lg:px-8">
            <Card
              title={`Arbeitszeit-Einträge (${formatNumber(
                workEntries.length
              )})`}
              subtitle={`Gesamt: ${formatNumber(
                workEntries.reduce(
                  (sum, e) => sum + ((e.payload as WorkPayload).hours || 0),
                  0
                )
              )}h`}
            >
              {workEntries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-[var(--accent-primary)]/10 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-[var(--accent-primary)]"
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
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    Keine Arbeitszeit-Einträge gefunden
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    Versuche deine Filter zu ändern oder erstelle neue Einträge.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full min-w-[800px] table-fixed">
                      <colgroup>
                        <col className="w-[200px]" />
                        <col className="w-[130px]" />
                        <col className="w-[100px]" />
                        <col className="w-[120px]" />
                        <col className="w-[80px]" />
                      </colgroup>
                      <thead>
                        <tr className="border-b border-[var(--border-subtle)] text-left">
                          <th
                            className="pb-4 pt-2 text-sm font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                            onClick={() =>
                              handleSort("work", "name", workSort, setWorkSort)
                            }
                          >
                            <div className="flex items-center gap-2">
                              Person
                              {workSort.key === "name" && (
                                <svg
                                  className={`w-4 h-4 transition-transform ${
                                    workSort.order === "desc"
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 15l7-7 7 7"
                                  />
                                </svg>
                              )}
                            </div>
                          </th>
                          <th
                            className="pb-4 pt-2 text-sm font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                            onClick={() =>
                              handleSort("work", "date", workSort, setWorkSort)
                            }
                          >
                            <div className="flex items-center gap-2">
                              Datum
                              {workSort.key === "date" && (
                                <svg
                                  className={`w-4 h-4 transition-transform ${
                                    workSort.order === "desc"
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 15l7-7 7 7"
                                  />
                                </svg>
                              )}
                            </div>
                          </th>
                          <th className="pb-4 pt-2 text-sm font-semibold text-[var(--text-secondary)]">
                            Wochentag
                          </th>
                          <th
                            className="pb-4 pt-2 text-sm font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors text-right"
                            onClick={() =>
                              handleSort("work", "value", workSort, setWorkSort)
                            }
                          >
                            <div className="flex items-center justify-end gap-2">
                              Stunden
                              {workSort.key === "value" && (
                                <svg
                                  className={`w-4 h-4 transition-transform ${
                                    workSort.order === "desc"
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 15l7-7 7 7"
                                  />
                                </svg>
                              )}
                            </div>
                          </th>
                          <th className="pb-4 pt-2 text-sm font-semibold text-[var(--text-secondary)] text-center">
                            Aktionen
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedWorkEntries.map((entry, index) => {
                          const payload = entry.payload as WorkPayload;
                          return (
                            <tr
                              key={entry.id}
                              className={`border-b border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors animate-fade-in`}
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <td className="py-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-gradient-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                    {payload.personName?.charAt(0) || "?"}
                                  </div>
                                  <span className="font-medium text-[var(--text-primary)] truncate">
                                    {payload.personName || "Unbekannt"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-5 font-medium text-[var(--text-primary)]">
                                {formatDate(entry.date)}
                              </td>
                              <td className="py-5 text-sm text-[var(--text-secondary)]">
                                {getWeekday(entry.date)}
                              </td>
                              <td className="py-5 text-right">
                                <span className="font-bold text-lg text-[var(--accent-primary)]">
                                  {formatNumber(payload.hours || 0)}h
                                </span>
                              </td>
                              <td className="py-5 text-center">
                                <button
                                  onClick={() => handleDelete(entry)}
                                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                                  title="Eintrag löschen"
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
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Lazy Loading Button for Work Entries */}
                  {displayedWorkEntries.length < workEntries.length && (
                    <div className="text-center pt-6">
                      <button
                        onClick={() => setWorkEntriesLimit((prev) => prev + 20)}
                        className="btn btn-secondary"
                      >
                        Weitere{" "}
                        {Math.min(
                          20,
                          workEntries.length - displayedWorkEntries.length
                        )}{" "}
                        Einträge laden
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Expense Entries Table */}
        {/* Expense Entries Table */}
        {activeTab === "expense" && (
          <div className="max-w-none -mx-4 px-4 lg:-mx-8 lg:px-8">
            <Card
              title={`Ausgaben-Einträge (${formatNumber(
                expenseEntries.length
              )})`}
              subtitle={`Gesamt: ${formatCurrency(
                expenseEntries.reduce(
                  (sum, e) => sum + ((e.payload as ExpensePayload).total || 0),
                  0
                )
              )}`}
            >
              {expenseEntries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-[var(--coral-red)]/10 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-[var(--coral-red)]"
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
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    Keine Ausgaben-Einträge gefunden
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    Versuche deine Filter zu ändern oder erstelle neue Einträge.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[var(--border-subtle)] text-left">
                          <th
                            className="pb-3 pt-2 px-2 text-xs font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                            style={{ width: "8%" }}
                            onClick={() =>
                              handleSort(
                                "expense",
                                "date",
                                expenseSort,
                                setExpenseSort
                              )
                            }
                          >
                            <div className="flex items-center gap-1">
                              Datum
                              {expenseSort.key === "date" && (
                                <svg
                                  className={`w-3 h-3 transition-transform ${
                                    expenseSort.order === "desc"
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 15l7-7 7 7"
                                  />
                                </svg>
                              )}
                            </div>
                          </th>
                          <th
                            className="pb-3 pt-2 px-2 text-xs font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                            style={{ width: "18%" }}
                            onClick={() =>
                              handleSort(
                                "expense",
                                "name",
                                expenseSort,
                                setExpenseSort
                              )
                            }
                          >
                            <div className="flex items-center gap-1">
                              Position
                              {expenseSort.key === "name" && (
                                <svg
                                  className={`w-3 h-3 transition-transform ${
                                    expenseSort.order === "desc"
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 15l7-7 7 7"
                                  />
                                </svg>
                              )}
                            </div>
                          </th>
                          <th
                            className="pb-3 pt-2 px-2 text-xs font-semibold text-[var(--text-secondary)]"
                            style={{ width: "12%" }}
                          >
                            Hersteller
                          </th>
                          <th
                            className="pb-3 pt-2 px-2 text-xs font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                            style={{ width: "12%" }}
                            onClick={() =>
                              handleSort(
                                "expense",
                                "category",
                                expenseSort,
                                setExpenseSort
                              )
                            }
                          >
                            <div className="flex items-center gap-1">
                              Kategorie
                              {expenseSort.key === "category" && (
                                <svg
                                  className={`w-3 h-3 transition-transform ${
                                    expenseSort.order === "desc"
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 15l7-7 7 7"
                                  />
                                </svg>
                              )}
                            </div>
                          </th>
                          <th
                            className="pb-3 pt-2 px-2 text-xs font-semibold text-[var(--text-secondary)]"
                            style={{ width: "10%" }}
                          >
                            Art
                          </th>
                          <th
                            className="pb-3 pt-2 px-2 text-xs font-semibold text-[var(--text-secondary)]"
                            style={{ width: "8%" }}
                          >
                            Zusatz
                          </th>
                          <th
                            className="pb-3 pt-2 px-2 text-xs font-semibold text-[var(--text-secondary)]"
                            style={{ width: "6%" }}
                          >
                            Wohn.
                          </th>
                          <th
                            className="pb-3 pt-2 px-2 text-xs font-semibold text-[var(--text-secondary)] text-right"
                            style={{ width: "5%" }}
                          >
                            Menge
                          </th>
                          <th
                            className="pb-3 pt-2 px-2 text-xs font-semibold text-[var(--text-secondary)] text-right"
                            style={{ width: "9%" }}
                          >
                            Preis/St.
                          </th>
                          <th
                            className="pb-3 pt-2 px-2 text-xs font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors text-right"
                            style={{ width: "10%" }}
                            onClick={() =>
                              handleSort(
                                "expense",
                                "value",
                                expenseSort,
                                setExpenseSort
                              )
                            }
                          >
                            <div className="flex items-center justify-end gap-1">
                              Summe
                              {expenseSort.key === "value" && (
                                <svg
                                  className={`w-3 h-3 transition-transform ${
                                    expenseSort.order === "desc"
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 15l7-7 7 7"
                                  />
                                </svg>
                              )}
                            </div>
                          </th>
                          <th
                            className="pb-3 pt-2 px-2 text-xs font-semibold text-[var(--text-secondary)] text-center"
                            style={{ width: "2%" }}
                          ></th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedExpenseEntries.map((entry, index) => {
                          const payload = entry.payload as ExpensePayload;
                          return (
                            <tr
                              key={entry.id}
                              className={`border-b border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors animate-fade-in`}
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <td className="py-4 px-2 text-xs font-medium text-[var(--text-primary)]">
                                {formatDate(entry.date)}
                              </td>
                              <td className="py-4 px-2">
                                <div
                                  className="text-xs font-medium text-[var(--text-primary)] break-words leading-tight"
                                  title={
                                    payload.position || "Unbekannte Position"
                                  }
                                >
                                  {payload.position || "Unbekannte Position"}
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <div
                                  className="text-xs text-[var(--text-secondary)] break-words leading-tight"
                                  title={payload.manufacturer || "-"}
                                >
                                  {payload.manufacturer || "-"}
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <span className="text-xs text-[var(--text-secondary)] break-words leading-tight">
                                  {payload.category || "-"}
                                </span>
                              </td>
                              <td
                                className="py-4 px-2 text-xs text-[var(--text-secondary)] break-words leading-tight"
                                title={payload.type || "-"}
                              >
                                {payload.type || "-"}
                              </td>
                              <td
                                className="py-4 px-2 text-xs text-[var(--text-secondary)] break-words leading-tight"
                                title={payload.extra || "-"}
                              >
                                {payload.extra || "-"}
                              </td>
                              <td
                                className="py-4 px-2 text-xs text-[var(--text-secondary)]"
                                title={payload.apartment || "-"}
                              >
                                {payload.apartment || "-"}
                              </td>
                              <td className="py-4 px-2 text-right text-xs font-medium">
                                {formatNumber(payload.qty || 1)}
                              </td>
                              <td className="py-4 px-2 text-right text-xs font-medium">
                                {formatCurrency(payload.unitPrice || 0)}
                              </td>
                              <td className="py-4 px-2 text-right">
                                <span className="font-bold text-sm text-[var(--coral-red)]">
                                  {formatCurrency(payload.total || 0)}
                                </span>
                              </td>
                              <td className="py-4 px-2 text-center">
                                <button
                                  onClick={() => handleDelete(entry)}
                                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
                                  title="Eintrag löschen"
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Lazy Loading Button for Expense Entries */}
                  {displayedExpenseEntries.length < expenseEntries.length && (
                    <div className="text-center pt-6">
                      <button
                        onClick={() =>
                          setExpenseEntriesLimit((prev) => prev + 20)
                        }
                        className="btn btn-secondary"
                      >
                        Weitere{" "}
                        {Math.min(
                          20,
                          expenseEntries.length - displayedExpenseEntries.length
                        )}{" "}
                        Einträge laden
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="glass" className="text-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-[var(--text-primary)]">
                  {formatNumber(
                    workEntries.reduce(
                      (sum, e) => sum + ((e.payload as WorkPayload).hours || 0),
                      0
                    )
                  )}
                  h
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  Gesamt Arbeitszeit
                </div>
              </div>
            </div>
          </Card>

          <Card variant="glass" className="text-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-warm flex items-center justify-center">
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-[var(--text-primary)]">
                  {formatNumber(
                    expenseEntries.reduce(
                      (sum, e) =>
                        sum + ((e.payload as ExpensePayload).total || 0),
                      0
                    )
                  )}
                  €
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  Gesamt Ausgaben
                </div>
              </div>
            </div>
          </Card>

          <Card variant="glass" className="text-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--deep-red)] flex items-center justify-center">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-[var(--text-primary)]">
                  {formatNumber(workEntries.length + expenseEntries.length)}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  Gesamte Einträge
                </div>
              </div>
            </div>
          </Card>

          <Card variant="glass" className="text-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--burgundy)] flex items-center justify-center">
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
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-[var(--text-primary)]">
                  {expenseEntries.length > 0
                    ? formatNumber(
                        expenseEntries.reduce(
                          (sum, e) =>
                            sum + ((e.payload as ExpensePayload).total || 0),
                          0
                        ) / expenseEntries.length
                      )
                    : "0"}
                  €
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  Ø pro Ausgabe
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Export Actions */}
        <Card variant="glass">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-[var(--text-primary)]">
                  Daten exportieren
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  Gefilterte Einträge herunterladen
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="btn btn-secondary btn-sm">
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                CSV Export
              </button>
              <button className="btn btn-primary btn-sm">
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                JSON Export
              </button>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
