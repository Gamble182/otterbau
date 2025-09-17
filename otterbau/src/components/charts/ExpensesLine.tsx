"use client";
import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEntries } from "@/store/useEntries";

// Custom Tooltip Component
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label}. des Monats
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.dataKey === 'value' ? 'Tagesausgaben' : 'Kumuliert'}: {entry.value.toFixed(2)}€
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function ExpensesLine() {
  const items = useEntries((s) => s.items);
  
  const data = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const arr = Array.from({ length: daysInMonth }, (_, i) => ({
      label: String(i + 1),
      key: `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
      value: 0,
      cumulative: 0
    }));
    
    for (const e of items.filter((e) => e.type === "expense")) {
      const k = e.date.slice(0, 10);
      const row = arr.find((x) => x.key === k);
      if (row) row.value += Number((e.payload as any).total ?? 0);
    }
    
    // Kumulative Werte berechnen
    let sum = 0;
    arr.forEach(row => {
      sum += row.value;
      row.cumulative = sum;
    });
    
    // Nur bis heute + 3 Tage anzeigen
    return arr.filter((_, i) => i < now.getDate() + 3);
  }, [items]);

  // Prüfen ob Daten vorhanden sind
  const hasExpenses = data.some(d => d.value > 0);
  
  if (!hasExpenses) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Noch keine Ausgaben erfasst</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Füge deine ersten Ausgaben hinzu!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <XAxis 
            dataKey="label" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            width={40}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: "3 3" }}
          />
          
          {/* Tägliche Ausgaben */}
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#10B981" 
            strokeWidth={3}
            dot={{ fill: '#10B981', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
          />
          
          {/* Kumulative Linie */}
          <Line 
            type="monotone" 
            dataKey="cumulative" 
            stroke="#F59E0B" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 4, stroke: '#F59E0B', strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}