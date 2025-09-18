"use client";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { useEntries } from "@/store/useEntries";
import { WorkPayload } from "@/lib/schemas/zod";

type Props = {
  from?: string;
  to?: string;
  topN?: number;
};

interface PersonWorkData {
  name: string;
  fullName: string;
  value: number;
}

// Custom Tooltip Component with Sony styling
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: PersonWorkData;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--bg-surface-elevated)] backdrop-blur-xl p-4 rounded-xl shadow-xl border border-[var(--border-emphasis)]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-gradient-accent"></div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {data.fullName}
          </span>
        </div>
        <div className="text-lg font-bold text-[var(--accent-primary)]">
          {data.value}h gesamt
        </div>
        <div className="text-xs text-[var(--text-secondary)] mt-1">
          Arbeitszeit-Beitrag
        </div>
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

      const p = e.payload as WorkPayload;
      const key = p.personName ?? "Unbekannt";
      const hours = Number(p.hours ?? 0);
      byPerson.set(key, (byPerson.get(key) ?? 0) + hours);
    }

    let arr = Array.from(byPerson, ([name, value]) => ({
      name: name.length > 12 ? name.substring(0, 12) + "..." : name,
      fullName: name,
      value: Number(value.toFixed(1)),
    }));

    arr.sort((a, b) => b.value - a.value);
    if (topN && topN > 0) arr = arr.slice(0, topN);

    return arr;
  }, [items, from, to, topN]);

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[var(--vibrant-orange)]/10 to-[var(--coral-red)]/10 border border-[var(--vibrant-orange)]/20 flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-[var(--vibrant-orange)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <p className="text-[var(--text-secondary)] font-medium text-lg mb-1">
            Keine Personendaten vorhanden
          </p>
          <p className="text-[var(--text-tertiary)] text-sm">
            Erfasse Arbeitszeiten für verschiedene Personen!
          </p>
        </div>
      </div>
    );
  }

  // Use horizontal layout for better readability of person names
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
            tick={{
              fill: "var(--text-tertiary)",
              fontSize: 11,
              fontFamily:
                "-apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, sans-serif",
            }}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "var(--text-secondary)",
              fontSize: 12,
              fontWeight: 500,
              fontFamily:
                "-apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, sans-serif",
            }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => {
              // Different colors for different persons
              const colors = [
                "url(#personGradient1)",
                "url(#personGradient2)",
                "url(#personGradient3)",
                "url(#personGradient4)",
                "url(#personGradient5)",
              ];

              return (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              );
            })}
          </Bar>

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="personGradient1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent-primary)" />
              <stop offset="100%" stopColor="var(--accent-secondary)" />
            </linearGradient>
            <linearGradient id="personGradient2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--coral-red)" />
              <stop offset="100%" stopColor="var(--deep-red)" />
            </linearGradient>
            <linearGradient id="personGradient3" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--vibrant-orange)" />
              <stop offset="100%" stopColor="var(--coral-red)" />
            </linearGradient>
            <linearGradient id="personGradient4" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--deep-red)" />
              <stop offset="100%" stopColor="var(--burgundy)" />
            </linearGradient>
            <linearGradient id="personGradient5" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent-secondary)" />
              <stop offset="100%" stopColor="var(--vibrant-orange)" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
