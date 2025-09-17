"use client";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { useEntries } from "@/store/useEntries";

// Custom Tooltip Component
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label}
        </p>
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          {payload[0].value}h gearbeitet
        </p>
      </div>
    );
  }
  return null;
}

function startOfWeek(d: Date) {
  const c = new Date(d);
  const day = (c.getDay() + 6) % 7;
  c.setDate(c.getDate() - day);
  c.setHours(0, 0, 0, 0);
  return c;
}

export default function WorkHoursBar() {
  const items = useEntries((s) => s.items);
  
  const data = useMemo(() => {
    const now = new Date();
    const sow = startOfWeek(now);
    
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sow);
      d.setDate(sow.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      return {
        key,
        label: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"][i],
        value: 0,
        isToday: key === now.toISOString().slice(0, 10)
      };
    });
    
    for (const e of items.filter((e) => e.type === "work")) {
      const k = e.date.slice(0, 10);
      const d = days.find((x) => x.key === k);
      if (d) d.value += (e.payload as any).hours ?? 0;
    }
    
    return days;
  }, [items]);

  // Prüfen ob Daten vorhanden sind
  const totalHours = data.reduce((sum, d) => sum + d.value, 0);
  
  if (totalHours === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Noch keine Arbeitszeit erfasst</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Starte mit deiner ersten Stunde!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <XAxis 
            dataKey="label" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            width={30}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
          />
          <Bar 
            dataKey="value" 
            radius={[6, 6, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isToday ? '#10B981' : '#3B82F6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}