"use client";
import { useMemo } from "react";
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
  key: string;
  value: number;
  cumulative: number;
}

interface TooltipPayload {
  dataKey: string;
  value: number;
  color: string;
  payload: ExpenseChartData;
}

// Custom Tooltip Component with Sony styling
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--bg-surface-elevated)] backdrop-blur-xl p-4 rounded-xl shadow-xl border border-[var(--border-emphasis)]">
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          {label}. des Monats
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

export default function ExpensesLine() {
  const items = useEntries((s) => s.items);

  const data = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const arr = Array.from({ length: daysInMonth }, (_, i) => ({
      label: String(i + 1),
      key: `${year}-${String(month + 1).padStart(2, "0")}-${String(
        i + 1
      ).padStart(2, "0")}`,
      value: 0,
      cumulative: 0,
    }));

    for (const e of items.filter((e) => e.type === "expense")) {
      const k = e.date.slice(0, 10);
      const row = arr.find((x) => x.key === k);
      if (row) row.value += Number((e.payload as ExpensePayload).total ?? 0);
    }

    // Calculate cumulative values
    let sum = 0;
    arr.forEach((row) => {
      sum += row.value;
      row.cumulative = sum;
    });

    // Show only up to today + 3 days
    return arr.filter((_, i) => i < now.getDate() + 3);
  }, [items]);

  // Check if there are expenses
  const hasExpenses = data.some((d) => d.value > 0);

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
            Noch keine Ausgaben erfasst
          </p>
          <p className="text-[var(--text-tertiary)] text-sm">
            Füge deine ersten Ausgaben hinzu!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--coral-red)"
                stopOpacity={0.3}
              />
              <stop
                offset="50%"
                stopColor="var(--deep-red)"
                stopOpacity={0.1}
              />
              <stop offset="100%" stopColor="var(--deep-red)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--accent-primary)"
                stopOpacity={0.2}
              />
              <stop
                offset="100%"
                stopColor="var(--accent-secondary)"
                stopOpacity={0}
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
            width={40}
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
            fill="url(#expenseGradient)"
            dot={{
              fill: "var(--coral-red)",
              strokeWidth: 0,
              r: 4,
              filter: "drop-shadow(0 2px 4px rgba(199, 62, 29, 0.3))",
            }}
            activeDot={{
              r: 6,
              stroke: "var(--coral-red)",
              strokeWidth: 3,
              fill: "var(--bg-surface-elevated)",
              filter: "drop-shadow(0 2px 8px rgba(199, 62, 29, 0.4))",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
