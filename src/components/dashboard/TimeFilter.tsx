"use client";

import { Card } from "@/components/ui/Card";
import type { TimeFilterProps } from "@/types/dashboard";

const TIME_FILTERS = [
  { id: "month", label: "Monat", icon: "📅" },
  { id: "year", label: "Jahr", icon: "📊" },
] as const;

export default function TimeFilter({
  timeFilter,
  onTimeFilterChange,
}: TimeFilterProps) {
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              Zeitraum wählen
            </h3>
            <p className="text-[var(--text-secondary)]">
              Filter wirkt auf alle Statistiken
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {TIME_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onTimeFilterChange(filter.id)}
              className={`
                filter-pill transition-all duration-200 px-4 py-2 sm:px-6 sm:py-3
                ${timeFilter === filter.id ? "active" : ""}
              `}
            >
              <span className="text-sm">{filter.icon}</span>
              <span className="font-medium">{filter.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
