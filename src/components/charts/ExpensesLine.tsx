"use client";
import { useMemo, memo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEntries } from "@/store/useEntries";
import { ExpensePayload } from "@/lib/schemas/zod";

interface ExpenseChartData {
  label: string;
  day: number;
  key: string;
  value: number;
  cumulative: number;
  isWeekend: boolean;
  isToday: boolean;
}

interface TooltipPayload {
  dataKey: string;
  value: number;
  color: string;
  payload: ExpenseChartData;
}

interface FilteredExpensesLineProps {
  from?: string;
  to?: string;
  selectedMonth?: number;
  selectedYear?: number;
}

// Custom Tooltip Component with Sony styling
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--bg-surface-elevated)] backdrop-blur-xl p-4 rounded-xl shadow-xl border border-[var(--border-emphasis)]">
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          {label}. Tag{" "}
          {data.isWeekend && (
            <span className="text-[var(--coral-red)]">(Wochenende)</span>
          )}
          {data.isToday && (
            <span className="text-[var(--accent-primary)] font-bold">
              {" "}
              (Heute)
            </span>
          )}
        </p>
        {payload?.map((entry: TooltipPayload, index: number) => (
          <div key={index} className="flex items-center gap-3 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              {entry.dataKey === "value" ? "Tagesausgaben" : "Kumuliert"}:
            </span>
            <span className="text-sm font-bold" style={{ color: entry.color }}>
              {entry.value.toFixed(2)}€
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function FilteredExpensesLine({
  from,
  to,
  selectedMonth = new Date().getMonth(),
  selectedYear = new Date().getFullYear(),
}: FilteredExpensesLineProps) {
  const items = useEntries((s) => s.items);

  const data = useMemo(() => {
    // Verwende die übergebenen Parameter oder berechne für den ausgewählten Monat
    const year = selectedYear;
    const month = selectedMonth;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth =
      today.getFullYear() === year && today.getMonth() === month;

    const arr = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNumber = i + 1;
      const date = new Date(year, month, dayNumber);
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        dayNumber
      ).padStart(2, "0")}`;

      return {
        label: String(dayNumber),
        day: dayNumber,
        key,
        value: 0,
        cumulative: 0,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isToday: isCurrentMonth && dayNumber === today.getDate(),
      };
    });

    // Filter nach Datum wenn from/to gesetzt sind
    const filteredItems = items.filter((e) => {
      if (e.type !== "expense") return false;
      if (from && e.date < from) return false;
      if (to && e.date > to) return false;

      // Zusätzlicher Filter für den ausgewählten Monat
      if (!from || !to) {
        const entryDate = new Date(e.date);
        return (
          entryDate.getFullYear() === year && entryDate.getMonth() === month
        );
      }

      return true;
    });

    // Ausgaben zu den entsprechenden Tagen hinzufügen
    for (const e of filteredItems) {
      const k = e.date.slice(0, 10);
      const row = arr.find((x) => x.key === k);
      if (row) {
        row.value += Number((e.payload as ExpensePayload).total ?? 0);
      }
    }

    // Calculate cumulative values
    let sum = 0;
    arr.forEach((row) => {
      sum += row.value;
      row.cumulative = sum;
    });

    return arr;
  }, [items, from, to, selectedMonth, selectedYear]);

  // Check if there are expenses
  const hasExpenses = data.some((d) => d.value > 0);
  const totalExpenses = data.reduce((sum, d) => sum + d.value, 0);
  const averagePerDay = totalExpenses / data.length;
  const maxSingleDay = Math.max(...data.map((d) => d.value));

  if (!hasExpenses) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[var(--coral-red)]/10 to-[var(--deep-red)]/10 border border-[var(--coral-red)]/20 flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-[var(--coral-red)]"
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
          <p className="text-[var(--text-secondary)] font-medium text-lg mb-1">
            Keine Ausgaben im gewählten Zeitraum
          </p>
          <p className="text-[var(--text-tertiary)] text-sm">
            Wähle einen anderen Monat oder füge Ausgaben hinzu!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Chart */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
          >
            <defs>
              <linearGradient
                id="expenseGradientFiltered"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--coral-red)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="50%"
                  stopColor="var(--deep-red)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="100%"
                  stopColor="var(--deep-red)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id="cumulativeGradientFiltered"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--accent-primary)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="var(--accent-secondary)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--text-tertiary)",
                fontSize: 11,
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, sans-serif",
              }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--text-tertiary)",
                fontSize: 11,
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, sans-serif",
              }}
              width={50}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "var(--accent-primary)",
                strokeWidth: 2,
                strokeDasharray: "4 4",
                strokeOpacity: 0.7,
              }}
            />

            {/* Daily Expenses Area */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--coral-red)"
              strokeWidth={3}
              fill="url(#expenseGradientFiltered)"
              dot={{
                fill: "var(--coral-red)",
                strokeWidth: 0,
                r: 4,
                filter: "drop-shadow(0 2px 4px rgba(199, 62, 29, 0.3))",
              }}
              activeDot={{
                r: 8,
                stroke: "var(--coral-red)",
                strokeWidth: 3,
                fill: "var(--bg-surface-elevated)",
                filter: "drop-shadow(0 2px 8px rgba(199, 62, 29, 0.4))",
              }}
            />

            {/* Cumulative line */}
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="var(--accent-primary)"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#cumulativeGradientFiltered)"
              dot={false}
              activeDot={{
                r: 6,
                stroke: "var(--accent-primary)",
                strokeWidth: 2,
                fill: "var(--bg-surface-elevated)",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-sm text-[var(--text-secondary)]">Gesamt</div>
          <div className="text-lg font-bold text-[var(--coral-red)]">
            {totalExpenses.toFixed(2)}€
          </div>
        </div>
        <div>
          <div className="text-sm text-[var(--text-secondary)]">Ø pro Tag</div>
          <div className="text-lg font-bold text-[var(--text-primary)]">
            {averagePerDay.toFixed(2)}€
          </div>
        </div>
        <div>
          <div className="text-sm text-[var(--text-secondary)]">
            Höchster Tag
          </div>
          <div className="text-lg font-bold text-[var(--deep-red)]">
            {maxSingleDay.toFixed(2)}€
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(FilteredExpensesLine);
