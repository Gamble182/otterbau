"use client";

import { StatsCard } from "@/components/ui/Card";
import type { DashboardStatsProps } from "@/types/dashboard";

export default function DashboardStats({
  stats,
  timeFilter,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2 sm:px-0">
      <StatsCard
        title={`${timeFilter === "month" ? "Monat" : "Jahr"} Stunden`}
        value={`${stats.totalHours.toFixed(1)}h`}
        change={`${stats.workEntries} Einträge`}
        trend={stats.totalHours > 0 ? "up" : "neutral"}
        icon={
          <svg
            className="w-5 h-5 text-[var(--accent-primary)]"
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
        title={`${timeFilter === "month" ? "Monat" : "Jahr"} Ausgaben`}
        value={`${stats.totalExpenses.toFixed(0)}€`}
        change={`${stats.expenseEntries} Ausgaben`}
        trend="neutral"
        icon={
          <svg
            className="w-5 h-5 text-[var(--coral-red)]"
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
        title="Ø Stunden/Tag"
        value={
          stats.workEntries > 0
            ? `${(stats.totalHours / stats.workEntries).toFixed(1)}h`
            : "0h"
        }
        change="Durchschnitt"
        trend="neutral"
        icon={
          <svg
            className="w-5 h-5 text-[var(--vibrant-orange)]"
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
        title="Ø Ausgabe"
        value={
          stats.expenseEntries > 0
            ? `${(stats.totalExpenses / stats.expenseEntries).toFixed(0)}€`
            : "0€"
        }
        change="pro Einkauf"
        trend="neutral"
        icon={
          <svg
            className="w-5 h-5 text-[var(--deep-red)]"
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
  );
}
