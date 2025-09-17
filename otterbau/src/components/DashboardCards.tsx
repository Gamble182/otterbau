"use client";
import { StatsCard } from "@/components/ui/Card";
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
    
    let todayHours = 0, weekHours = 0, monthHours = 0;
    let weekExpenses = 0, monthExpenses = 0;
    
    for (const e of items) {
      const d = new Date(e.date);
      if (e.type === "work") {
        const h = Number((e.payload as any).hours ?? 0);
        if (e.date.startsWith(isoToday)) todayHours += h;
        if (d >= startOfWeek) weekHours += h;
        if (d >= startOfMonth) monthHours += h;
      } else if (e.type === "expense") {
        const v = Number((e.payload as any).total ?? 0);
        if (d >= startOfWeek) weekExpenses += v;
        if (d >= startOfMonth) monthExpenses += v;
      }
    }
    
    return { todayHours, weekHours, monthHours, weekExpenses, monthExpenses };
  }, [items]);

  const cards = [
    {
      title: "Heute gearbeitet",
      value: `${stats.todayHours.toFixed(1)}h`,
      change: stats.todayHours > 0 ? `+${stats.todayHours.toFixed(1)}h heute` : "Noch keine Einträge",
      trend: stats.todayHours > 0 ? 'up' : 'neutral',
      icon: (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Wochenstunden",
      value: `${stats.weekHours.toFixed(1)}h`,
      change: `Ø ${(stats.weekHours / 7).toFixed(1)}h/Tag`,
      trend: stats.weekHours > 35 ? 'up' : stats.weekHours > 20 ? 'neutral' : 'down',
      icon: (
        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: "Ausgaben (Woche)",
      value: `${stats.weekExpenses.toFixed(0)}€`,
      change: `${stats.weekExpenses > stats.monthExpenses/4 ? '+' : ''}${((stats.weekExpenses - stats.monthExpenses/4)/100).toFixed(0)}% vs Ø`,
      trend: stats.weekExpenses > stats.monthExpenses/4 ? 'down' : 'up',
      icon: (
        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      title: "Monatsstunden",
      value: `${stats.monthHours.toFixed(1)}h`,
      change: `${stats.monthExpenses.toFixed(0)}€ Ausgaben`,
      trend: 'neutral',
      icon: (
        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Monat Ausgaben",
      value: `${stats.monthExpenses.toFixed(0)}€`,
      change: `Ø ${(stats.monthExpenses/30).toFixed(1)}€/Tag`,
      trend: 'neutral',
      icon: (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <StatsCard
          key={index}
          title={card.title}
          value={card.value}
          change={card.change}
          trend={card.trend as any}
          icon={card.icon}
          className="hover:scale-[1.02] transition-transform"
        />
      ))}
    </div>
  );
}