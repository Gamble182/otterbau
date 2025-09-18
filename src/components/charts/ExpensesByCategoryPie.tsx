"use client";
import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts";
import { useEntries } from "@/store/useEntries";
import { ExpensePayload } from "@/lib/schemas/zod";

type Props = {
  from?: string;
  to?: string;
  topN?: number;
};

// Sony Dynamicron T-120 inspired color palette
const PIE_COLORS = [
  "var(--accent-primary)", // Warm Yellow
  "var(--vibrant-orange)", // Vibrant Orange
  "var(--coral-red)", // Coral Red
  "var(--deep-red)", // Deep Red
  "var(--burgundy)", // Burgundy
  "var(--dark-burgundy)", // Dark Burgundy
  "var(--accent-secondary)", // Orange blend
  "var(--charcoal)", // Charcoal
];

interface PieChartData {
  name: string;
  value: number;
  percentage: number;
  fill?: string;
}

// Custom Tooltip Component with Sony styling
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: PieChartData;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[var(--bg-surface-elevated)] backdrop-blur-xl p-4 rounded-xl shadow-xl border border-[var(--border-emphasis)]">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-4 h-4 rounded-full shadow-sm"
            style={{ backgroundColor: data.payload.fill }}
          />
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {data.name}
          </span>
        </div>
        <div className="text-lg font-bold" style={{ color: data.payload.fill }}>
          {data.value.toFixed(2)}€
        </div>
        <div className="text-xs text-[var(--text-secondary)] mt-1">
          {data.payload.percentage}% der Gesamtausgaben
        </div>
      </div>
    );
  }
  return null;
}

export default function ExpensesByCategoryPie({ from, to, topN = 8 }: Props) {
  const items = useEntries((s) => s.items);

  const data = useMemo(() => {
    const map = new Map<string, number>();

    for (const e of items) {
      if (e.type !== "expense") continue;
      if (from && e.date < from) continue;
      if (to && e.date > to) continue;

      const p = e.payload as ExpensePayload;
      const cat = (p.category ?? "Unkategorisiert").toString();
      const val = Number(p.total ?? 0);
      map.set(cat, (map.get(cat) ?? 0) + val);
    }

    let arr = Array.from(map, ([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
      percentage: 0,
    })).sort((a, b) => b.value - a.value);

    const total = arr.reduce((sum, item) => sum + item.value, 0);
    arr.forEach((item) => {
      item.percentage =
        total > 0 ? Number(((item.value / total) * 100).toFixed(1)) : 0;
    });

    if (arr.length > topN) {
      const head = arr.slice(0, topN);
      const tail = arr.slice(topN);
      const otherValue = tail.reduce((s, x) => s + x.value, 0);
      const otherPercentage = tail.reduce((s, x) => s + x.percentage, 0);

      if (otherValue > 0) {
        head.push({
          name: "Sonstige",
          value: Number(otherValue.toFixed(2)),
          percentage: Number(otherPercentage.toFixed(1)),
        });
      }
      arr = head;
    }

    return arr;
  }, [items, from, to, topN]);

  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[var(--deep-red)]/10 to-[var(--burgundy)]/10 border border-[var(--deep-red)]/20 flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-[var(--deep-red)]"
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
          </div>
          <p className="text-[var(--text-secondary)] font-medium text-lg mb-1">
            Keine Ausgabendaten vorhanden
          </p>
          <p className="text-[var(--text-tertiary)] text-sm">
            Erfasse deine ersten Ausgaben!
          </p>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Pie Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={3}
              stroke="var(--bg-primary)"
              strokeWidth={2}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend with Sony styling */}
      <div className="grid grid-cols-2 gap-3 text-xs mt-4">
        {data.map((entry, index) => (
          <div
            key={entry.name}
            className="flex items-center gap-3 min-w-0 p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <div
              className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm border border-white/20"
              style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[var(--text-secondary)] truncate font-medium">
                {entry.name}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[var(--text-primary)] font-bold">
                  {entry.value.toFixed(0)}€
                </span>
                <span className="text-[var(--text-tertiary)] text-xs">
                  {entry.percentage}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total with Sony gradient accent */}
      <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-[var(--accent-primary)]/5 to-[var(--accent-secondary)]/5 border border-[var(--accent-primary)]/10">
          <span className="text-base font-semibold text-[var(--text-primary)]">
            Gesamtausgaben
          </span>
          <span className="text-2xl font-bold text-gradient">
            {total.toFixed(2)}€
          </span>
        </div>
      </div>
    </div>
  );
}
