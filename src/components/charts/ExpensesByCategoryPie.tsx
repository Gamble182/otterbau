"use client";
import { useMemo, memo } from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts";
import { useEntries } from "@/store/useEntries";
import { ExpensePayload } from "@/lib/schemas/zod";

type Props = {
  from?: string;
  to?: string;
  topN?: number;
};

// Sony Dynamicron T-120 inspired color palette - erweitert für mehr Kategorien
const PIE_COLORS = [
  "var(--accent-primary)", // Warm Yellow
  "var(--vibrant-orange)", // Vibrant Orange
  "var(--coral-red)", // Coral Red
  "var(--deep-red)", // Deep Red
  "var(--burgundy)", // Burgundy
  "var(--dark-burgundy)", // Dark Burgundy
  "var(--accent-secondary)", // Orange blend
  "var(--charcoal)", // Charcoal
  "#e67e22", // Orange
  "#f39c12", // Yellow Orange
  "#d35400", // Dark Orange
  "#8e44ad", // Purple
  "#9b59b6", // Light Purple
  "#3498db", // Blue
  "#2980b9", // Dark Blue
  "#1abc9c", // Teal
  "#16a085", // Dark Teal
  "#27ae60", // Green
  "#2ecc71", // Light Green
  "#95a5a6", // Gray
];

interface PieChartData {
  name: string;
  value: number;
  percentage: number;
  fill?: string;
}

// Custom Tooltip Component mit erweiterten Informationen
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
      <div className="bg-[var(--bg-surface-elevated)] backdrop-blur-xl p-6 rounded-2xl shadow-2xl border-2 border-[var(--border-emphasis)] max-w-xs">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-8 h-8 rounded-xl shadow-lg border-2 border-white/20"
            style={{ backgroundColor: data.payload.fill }}
          />
          <span className="text-lg font-bold text-[var(--text-primary)]">
            {data.name}
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">
              Betrag:
            </span>
            <div
              className="text-2xl font-bold"
              style={{ color: data.payload.fill }}
            >
              {data.value.toFixed(2)}€
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">
              Anteil:
            </span>
            <div className="text-xl font-bold text-[var(--text-primary)]">
              {data.payload.percentage}%
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)] text-center">
            von Gesamtausgaben
          </div>
        </div>
      </div>
    );
  }
  return null;
}

// Custom Label Renderer für Prozentangaben
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  // Nur bei größeren Segmenten Labels anzeigen (>5%)
  if (percent < 0.05) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-sm font-bold drop-shadow-lg"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function ExpensesByCategoryPie({ from, to, topN = 20 }: Props) {
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
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-[var(--deep-red)]/10 to-[var(--burgundy)]/10 border border-[var(--deep-red)]/20 flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-[var(--deep-red)]"
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
          <p className="text-[var(--text-secondary)] font-medium text-xl mb-2">
            Keine Ausgabendaten vorhanden
          </p>
          <p className="text-[var(--text-tertiary)]">
            Erfasse deine ersten Ausgaben!
          </p>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Vergrößerter Donut Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {/* Shadow Filter für 3D Effekt */}
              <filter
                id="donutShadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="4"
                  stdDeviation="8"
                  floodColor="rgba(42, 27, 27, 0.2)"
                />
              </filter>
            </defs>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={180}
              innerRadius={90} // Donut-Loch größer für bessere Optik
              paddingAngle={3}
              stroke="var(--bg-primary)"
              strokeWidth={3}
              filter="url(#donutShadow)"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </Pie>

            {/* Zentraler Text im Donut */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-2xl font-bold fill-[var(--text-primary)]"
            >
              {total.toFixed(0)}€
            </text>
            <text
              x="50%"
              y="50%"
              dy="25"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm fill-[var(--text-secondary)]"
            >
              Gesamt
            </text>

            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Legend mit Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 text-sm mt-6">
        {data.map((entry, index) => (
          <div
            key={entry.name}
            className="flex items-center gap-3 min-w-0 p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors border border-[var(--border-subtle)] hover:border-[var(--border-emphasis)] hover:shadow-md group"
          >
            <div
              className="w-6 h-6 rounded-lg flex-shrink-0 shadow-md border border-white/20 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[var(--text-primary)] font-semibold truncate text-base">
                {entry.name}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[var(--text-primary)] font-bold text-lg">
                  {entry.value.toFixed(0)}€
                </span>
                <span className="text-[var(--accent-primary)] font-bold text-sm">
                  {entry.percentage}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Total Section mit Statistiken */}
      <div className="mt-8 pt-6 border-t-2 border-[var(--border-subtle)]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20">
            <div className="text-sm text-[var(--text-tertiary)] uppercase tracking-wider font-semibold mb-1">
              Gesamtausgaben
            </div>
            <div className="text-3xl font-bold text-gradient mb-1">
              {total.toFixed(2)}€
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              {data.length} Kategorie{data.length !== 1 ? "n" : ""}
            </div>
          </div>

          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-[var(--coral-red)]/10 to-[var(--deep-red)]/10 border border-[var(--coral-red)]/20">
            <div className="text-sm text-[var(--text-tertiary)] uppercase tracking-wider font-semibold mb-1">
              Größte Kategorie
            </div>
            <div className="text-xl font-bold text-[var(--coral-red)] mb-1">
              {data[0]?.percentage}%
            </div>
            <div className="text-xs text-[var(--text-secondary)] truncate">
              {data[0]?.name}
            </div>
          </div>

          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-[var(--vibrant-orange)]/10 to-[var(--coral-red)]/10 border border-[var(--vibrant-orange)]/20">
            <div className="text-sm text-[var(--text-tertiary)] uppercase tracking-wider font-semibold mb-1">
              Durchschnitt
            </div>
            <div className="text-xl font-bold text-[var(--vibrant-orange)] mb-1">
              {(total / data.length).toFixed(0)}€
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              pro Kategorie
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ExpensesByCategoryPie);
