"use client";
import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts";
import { useEntries } from "@/store/useEntries";

type Props = {
  from?: string;
  to?: string;
  topN?: number;
};

// Moderne Farbpalette
const PIE_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#6366F1", // indigo
  "#14B8A6", // teal
];

// Custom Tooltip Component
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {data.name}
        </p>
        <p className="text-sm font-bold" style={{ color: data.payload.fill }}>
          {data.value.toFixed(2)}€ ({data.payload.percentage}%)
        </p>
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

      const p: any = e.payload;
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
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-slate-400"
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
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Keine Ausgabendaten vorhanden
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
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
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs mt-4">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2 min-w-0">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
            />
            <span className="text-slate-600 dark:text-slate-400 truncate flex-1">
              {entry.name}
            </span>
            <span className="text-slate-900 dark:text-white font-semibold">
              {entry.value.toFixed(0)}€
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Gesamt
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {total.toFixed(2)}€
          </span>
        </div>
      </div>
    </div>
  );
}
