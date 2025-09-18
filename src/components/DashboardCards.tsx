"use client";
import { StatsCard, HeroStatsCard } from "@/components/ui/Card";
import { useEntries } from "@/store/useEntries";
import { useMemo } from "react";

export default function DashboardCards() {
  const items = useEntries((s) => s.items);

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

    for (const e of items) {
      const d = new Date(e.date);
      if (e.type === "work") {
        const payload = e.payload as { hours?: number };
        const h = Number(payload.hours ?? 0);
        if (e.date.startsWith(isoToday)) todayHours += h;
        if (d >= startOfWeek) weekHours += h;
        if (d >= startOfMonth) monthHours += h;
      } else if (e.type === "expense") {
        const payload = e.payload as { total?: number };
        const v = Number(payload.total ?? 0);
        if (d >= startOfWeek) weekExpenses += v;
        if (d >= startOfMonth) monthExpenses += v;
      }
    }

    return { todayHours, weekHours, monthHours, weekExpenses, monthExpenses };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Hero Cards - Today's Focus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HeroStatsCard
          title="Heute gearbeitet"
          value={`${stats.todayHours.toFixed(1)}h`}
          subtitle={
            stats.todayHours > 0
              ? "Guter Start! 👍"
              : "Noch keine Stunden heute"
          }
          gradient="default"
          icon={
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        <HeroStatsCard
          title="Wochenausgaben"
          value={`${stats.weekExpenses.toFixed(0)}€`}
          subtitle={`Ø ${(stats.weekExpenses / 7).toFixed(1)}€ pro Tag`}
          gradient="warm"
          icon={
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          }
        />
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Wochenstunden"
          value={`${stats.weekHours.toFixed(1)}h`}
          change={`${Math.round((stats.weekHours / 40) * 100)}% von 40h Ziel`}
          trend={
            stats.weekHours >= 40
              ? "up"
              : stats.weekHours >= 30
              ? "neutral"
              : "down"
          }
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
        />

        <StatsCard
          title="Monatsstunden"
          value={`${stats.monthHours.toFixed(1)}h`}
          change={`${Math.round(
            stats.monthHours / new Date().getDate()
          )} Arbeitstage`}
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />

        <StatsCard
          title="Monat Ausgaben"
          value={`${stats.monthExpenses.toFixed(0)}€`}
          change={`Ø ${(stats.monthExpenses / new Date().getDate()).toFixed(
            1
          )}€/Tag`}
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
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />

        <StatsCard
          title="Gesamteinträge"
          value={items.length}
          change={
            items.length > 0
              ? `Seit ${new Date().toLocaleDateString("de-DE", {
                  month: "long",
                })}`
              : "Noch keine Daten"
          }
          trend={items.length > 10 ? "up" : "neutral"}
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
      </div>

      {/* Weekly Progress Bar */}
      <div className="card">
        <div className="card-body-compact">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Wochenziel (40h)
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                {stats.weekHours >= 40
                  ? "Ziel erreicht! 🎉"
                  : `${(40 - stats.weekHours).toFixed(1)}h bis zum Ziel`}
              </div>
            </div>
            <div className="text-lg font-bold text-[var(--text-primary)]">
              {Math.round((stats.weekHours / 40) * 100)}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[var(--bg-secondary)] rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-accent transition-all duration-700 ease-out rounded-full relative overflow-hidden"
              style={{
                width: `${Math.min((stats.weekHours / 40) * 100, 100)}%`,
              }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
