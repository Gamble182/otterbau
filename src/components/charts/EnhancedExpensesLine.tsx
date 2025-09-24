"use client";
import { useMemo, memo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useEntries } from "@/store/useEntries";
import { ExpensePayload } from "@/lib/schemas/zod";

interface EnhancedExpenseChartData {
  label: string;
  fullDate: string;
  day: number;
  week?: number;
  month?: string;
  key: string;
  value: number;
  cumulative: number;
  isWeekend: boolean;
  isToday: boolean;
  isMonthStart?: boolean;
  periodType: 'day' | 'week' | 'month';
}

interface TooltipPayload {
  dataKey: string;
  value: number;
  color: string;
  payload: EnhancedExpenseChartData;
}

interface EnhancedExpensesLineProps {
  from?: string;
  to?: string;
  timeSpanType: 'month' | 'quarter' | 'long';
  isFiltered?: boolean;
}

// Custom Tooltip Component mit erweiterter Information
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--bg-surface-elevated)] backdrop-blur-xl p-5 rounded-2xl shadow-2xl border-2 border-[var(--border-emphasis)] max-w-xs">
        <div className="mb-3">
          <p className="text-base font-bold text-[var(--text-primary)]">
            {data.periodType === 'day' ? `Tag ${data.day}` : 
             data.periodType === 'week' ? `Woche ${data.week}` : 
             data.month}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            {data.fullDate}
            {data.isWeekend && (
              <span className="ml-2 px-2 py-0.5 bg-[var(--coral-red)]/20 text-[var(--coral-red)] text-xs rounded-full font-medium">
                Wochenende
              </span>
            )}
            {data.isToday && (
              <span className="ml-2 px-2 py-0.5 bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-xs rounded-full font-bold">
                Heute
              </span>
            )}
          </p>
        </div>

        <div className="space-y-3">
          {payload?.map((entry: TooltipPayload, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full shadow-md"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {entry.dataKey === "value" ? "Tagesausgaben" : "Kumuliert"}
                </span>
              </div>
              <span className="text-sm font-bold" style={{ color: entry.color }}>
                {entry.value.toFixed(2)}€
              </span>
            </div>
          ))}
        </div>

        {/* Zusätzliche Statistiken */}
        {data.value > 0 && (
          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
            <div className="text-xs text-[var(--text-tertiary)]">
              Anteil am Gesamtbudget: {((data.value / data.cumulative) * 100).toFixed(1)}%
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
}

function EnhancedExpensesLine({
  from,
  to,
  timeSpanType,
  isFiltered = false,
}: EnhancedExpensesLineProps) {
  const items = useEntries((s) => s.items);

  const data = useMemo(() => {
    if (!from || !to) return [];

    const fromDate = new Date(from);
    const toDate = new Date(to);
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));

    // Dynamische Datengruppierung basierend auf Zeitspanne
    let data: EnhancedExpenseChartData[] = [];

    if (timeSpanType === 'month' || daysDiff <= 31) {
      // Tägliche Ansicht
      data = Array.from({ length: daysDiff + 1 }, (_, i) => {
        const currentDate = new Date(fromDate);
        currentDate.setDate(fromDate.getDate() + i);
        const key = currentDate.toISOString().slice(0, 10);
        
        return {
          label: String(currentDate.getDate()),
          fullDate: currentDate.toLocaleDateString('de-DE'),
          day: currentDate.getDate(),
          key,
          value: 0,
          cumulative: 0,
          isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
          isToday: key === new Date().toISOString().slice(0, 10),
          isMonthStart: currentDate.getDate() === 1,
          periodType: 'day' as const,
        };
      });
    } else if (timeSpanType === 'quarter' || daysDiff <= 93) {
      // Wöchentliche Ansicht
      const weeks = Math.ceil(daysDiff / 7);
      data = Array.from({ length: weeks }, (_, i) => {
        const weekStart = new Date(fromDate);
        weekStart.setDate(fromDate.getDate() + (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return {
          label: `W${i + 1}`,
          fullDate: `${weekStart.toLocaleDateString('de-DE')} - ${weekEnd.toLocaleDateString('de-DE')}`,
          day: i + 1,
          week: i + 1,
          key: `${weekStart.getFullYear()}-W${String(i + 1).padStart(2, '0')}`,
          value: 0,
          cumulative: 0,
          isWeekend: false,
          isToday: false,
          periodType: 'week' as const,
        };
      });
    } else {
      // Monatliche Ansicht
      const monthsData: EnhancedExpenseChartData[] = [];
      const currentDate = new Date(fromDate);
      let monthIndex = 0;

      while (currentDate <= toDate) {
        const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        const monthName = currentDate.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });
        
        monthsData.push({
          label: monthName,
          fullDate: monthName,
          day: monthIndex + 1,
          month: monthName,
          key: monthKey,
          value: 0,
          cumulative: 0,
          isWeekend: false,
          isToday: false,
          periodType: 'month' as const,
        });

        currentDate.setMonth(currentDate.getMonth() + 1);
        monthIndex++;
      }
      data = monthsData;
    }

    // Ausgaben zu den entsprechenden Perioden hinzufügen
    const filteredItems = items.filter((e) => {
      if (e.type !== "expense") return false;
      if (from && e.date < from) return false;
      if (to && e.date > to) return false;
      return true;
    });

    for (const e of filteredItems) {
      const entryDate = new Date(e.date);
      const amount = Number((e.payload as ExpensePayload).total ?? 0);

      if (timeSpanType === 'month' || daysDiff <= 31) {
        // Tägliche Zuordnung
        const k = e.date.slice(0, 10);
        const row = data.find((x) => x.key === k);
        if (row) row.value += amount;
      } else if (timeSpanType === 'quarter' || daysDiff <= 93) {
        // Wöchentliche Zuordnung
        const weekNumber = Math.floor((entryDate.getTime() - fromDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        const row = data[weekNumber];
        if (row) row.value += amount;
      } else {
        // Monatliche Zuordnung
        const monthKey = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;
        const row = data.find((x) => x.key === monthKey);
        if (row) row.value += amount;
      }
    }

    // Kumulierte Werte berechnen
    let sum = 0;
    data.forEach((row) => {
      sum += row.value;
      row.cumulative = sum;
    });

    return data;
  }, [items, from, to, timeSpanType]);

  // Statistiken berechnen
  const hasExpenses = data.some((d) => d.value > 0);
  const totalExpenses = data.reduce((sum, d) => sum + d.value, 0);
  const averagePerPeriod = totalExpenses / data.length;
  const maxSinglePeriod = Math.max(...data.map((d) => d.value));

  if (!hasExpenses) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-[var(--coral-red)]/10 to-[var(--deep-red)]/10 border-2 border-[var(--coral-red)]/20 flex items-center justify-center mb-6 shadow-xl">
            <svg
              className="w-12 h-12 text-[var(--coral-red)]"
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
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Keine Ausgaben im Zeitraum
          </h3>
          <p className="text-[var(--text-secondary)] mb-1">
            {isFiltered ? 'Im gefilterten Zeitraum' : 'In der Historie'} wurden keine Ausgaben gefunden
          </p>
          <p className="text-[var(--text-tertiary)] text-sm">
            Wähle einen anderen Zeitraum oder füge Ausgaben hinzu!
          </p>
        </div>
      </div>
    );
  }

  // Rest of the component implementation would go here
  return null;
}

export default memo(EnhancedExpensesLine);