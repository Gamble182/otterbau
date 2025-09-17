"use client";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useEntries } from "@/store/useEntries";

type Props = {
  from?: string;
  to?: string;
  topN?: number;
};

// Custom Tooltip Component
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {data.fullName}
        </p>
        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
          {data.value}h gesamt
        </p>
      </div>
    );
  }
  return null;
}

export default function WorkByPersonBar({ from, to, topN = 10 }: Props) {
  const items = useEntries((s) => s.items);

  const data = useMemo(() => {
    const byPerson = new Map<string, number>();
    
    for (const e of items) {
      if (e.type !== "work") continue;
      if (from && e.date < from) continue;
      if (to && e.date > to) continue;
      
      const p = e.payload as any;
      const key = p.personName ?? "Unbekannt";
      const hours = Number(p.hours ?? 0);
      byPerson.set(key, (byPerson.get(key) ?? 0) + hours);
    }
    
    let arr = Array.from(byPerson, ([name, value]) => ({ 
      name: name.length > 12 ? name.substring(0, 12) + '...' : name,
      fullName: name,
      value: Number(value.toFixed(1))
    }));
    
    arr.sort((a, b) => b.value - a.value);
    if (topN && topN > 0) arr = arr.slice(0, topN);
    
    return arr;
  }, [items, from, to, topN]);

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Keine Personendaten vorhanden</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Erfasse Arbeitszeiten für verschiedene Personen!</p>
        </div>
      </div>
    );
  }

  // Verwende horizontales Layout für bessere Lesbarkeit bei Personennamen
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout="vertical"
          margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
        >
          <XAxis 
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <YAxis 
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            fill="#10B981"
            radius={[0, 6, 6, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}