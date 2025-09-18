"use client";
import { useState } from "react";
import type { FilterState } from "./Filters";
import { useFilteredEntries } from "./Filters";
import { Card } from "@/components/ui/Card";
import type { WorkPayload, ExpensePayload, ProjectCostPayload } from "@/lib/schemas/zod";

export default function EntryList({ filter }: { filter: FilterState }) {
  const items = useFilteredEntries(filter).slice().reverse();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "work":
        return (
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <svg
              className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
        );
      case "expense":
        return (
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <svg
              className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
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
        );
      default:
        return (
          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <svg
              className="w-4 h-4 text-slate-600 dark:text-slate-400"
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
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Heute";
    if (isYesterday) return "Gestern";

    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  if (items.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-slate-400"
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
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Keine Einträge gefunden
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            {filter.type || filter.from || filter.to
              ? "Versuche deine Filter zu ändern oder erstelle einen neuen Eintrag."
              : "Erstelle deinen ersten Eintrag mit den Quick-Actions oben!"}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {items.map((entry) => {
          const isExpanded = expandedItems.has(entry.id);

          let primaryText = "";
          let secondaryText = "";
          let valueText = "";
          let badgeText = "";

          if (entry.type === "work") {
            const payload = entry.payload as WorkPayload;
            primaryText = payload.personName || "Unbekannt";
            secondaryText = payload.note || payload.project || "Arbeitszeit";
            valueText = `${payload.hours}h`;
            badgeText = "Arbeit";
          } else if (entry.type === "expense") {
            const payload = entry.payload as ExpensePayload;
            primaryText = payload.position || "Ausgabe";
            secondaryText = `${payload.category} • ${payload.buyer}`;
            valueText = `${Number(payload.total).toFixed(2)}€`;
            badgeText = "Ausgabe";
          } else {
            const payload = entry.payload as ProjectCostPayload;
            primaryText = payload.position || "Eintrag";
            secondaryText = payload.category || "Projektkosten";
            valueText = `${Number(payload.amount || 0).toFixed(2)}€`;
            badgeText = "Projekt";
          }

          return (
            <div key={entry.id} className="group">
              <button
                onClick={() => toggleExpand(entry.id)}
                className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-700/50"
              >
                <div className="flex items-start gap-3">
                  {getTypeIcon(entry.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {primaryText}
                      </h4>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                          {valueText}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {secondaryText}
                      </p>
                      <div className="flex items-center gap-2 ml-2">
                        <span
                          className={`
                          px-2 py-1 text-xs font-medium rounded-full
                          ${
                            entry.type === "work"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              : entry.type === "expense"
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                          }
                        `}
                        >
                          {badgeText}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {formatDate(entry.date)}
                        </span>
                        <svg
                          className={`w-4 h-4 text-slate-400 transition-transform ${
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
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Erweiterte Details */}
              {isExpanded && (
                <div className="px-4 pb-4 animate-in slide-in-from-top-1 duration-200">
                  <div className="ml-11 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          ID:
                        </span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {entry.id.slice(0, 8)}...
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          Erstellt:
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {new Date(entry.createdAt).toLocaleString("de-DE")}
                        </span>
                      </div>

                      {entry.type === "work" && (() => {
                        const payload = entry.payload as WorkPayload;
                        return (
                          <>
                            {payload.project && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 dark:text-slate-400">
                                  Projekt:
                                </span>
                                <span className="text-slate-700 dark:text-slate-300">
                                  {payload.project}
                                </span>
                              </div>
                            )}
                            {payload.note && (
                              <div className="text-xs">
                                <span className="text-slate-500 dark:text-slate-400 block mb-1">
                                  Notiz:
                                </span>
                                <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 rounded p-2">
                                  {payload.note}
                                </p>
                              </div>
                            )}
                          </>
                        );
                      })()}

                      {entry.type === "expense" && (() => {
                        const payload = entry.payload as ExpensePayload;
                        return (
                          <>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-slate-500 dark:text-slate-400 block mb-1">
                                  Menge:
                                </span>
                                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                                  {payload.qty || 1}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500 dark:text-slate-400 block mb-1">
                                  Einzelpreis:
                                </span>
                                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                                  {Number(payload.unitPrice || 0).toFixed(2)}€
                                </span>
                              </div>
                            </div>

                            {payload.manufacturer && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 dark:text-slate-400">
                                  Hersteller:
                                </span>
                                <span className="text-slate-700 dark:text-slate-300">
                                  {payload.manufacturer}
                                </span>
                              </div>
                            )}

                            {payload.note && (
                              <div className="text-xs">
                                <span className="text-slate-500 dark:text-slate-400 block mb-1">
                                  Notiz:
                                </span>
                                <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 rounded p-2">
                                  {payload.note}
                                </p>
                              </div>
                            )}
                          </>
                        );
                      })()}

                      {entry.tags && entry.tags.length > 0 && (
                        <div className="text-xs">
                          <span className="text-slate-500 dark:text-slate-400 block mb-1">
                            Tags:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {entry.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                        <button className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          Bearbeiten
                        </button>
                        <button className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          Löschen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Zusammenfassung am Ende */}
      {items.length > 0 && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              {items.length} Eintrag{items.length !== 1 ? "e" : ""} gefunden
            </span>

            <div className="flex items-center gap-4">
              {/* Arbeitszeit Summe */}
              {items.some((e) => e.type === "work") && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-blue-500"
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
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {items
                      .filter((e) => e.type === "work")
                      .reduce(
                        (sum, e) => sum + Number((e.payload as WorkPayload).hours || 0),
                        0
                      )
                      .toFixed(1)}
                    h
                  </span>
                </div>
              )}

              {/* Ausgaben Summe */}
              {items.some((e) => e.type === "expense") && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-emerald-500"
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
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {items
                      .filter((e) => e.type === "expense")
                      .reduce(
                        (sum, e) => sum + Number((e.payload as ExpensePayload).total || 0),
                        0
                      )
                      .toFixed(2)}
                    €
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
