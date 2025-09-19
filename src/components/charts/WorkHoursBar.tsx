"use client";
import { useMemo, memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useEntries } from "@/store/useEntries";
import { WorkPayload } from "@/lib/schemas/zod";

// Custom Tooltip Component with Sony colors
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--bg-surface-elevated)] backdrop-blur-xl p-4 rounded-xl shadow-xl border border-[var(--border-emphasis)]">
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-accent"></div>
          <span className="text-sm font-bold text-[var(--accent-primary)]">
            {payload[0].value}h gearbeitet
          </span>
        </div>
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

function WorkHoursBar() {
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
        isToday: key === now.toISOString().slice(0, 10),
        isWeekend: i >= 5,
      };
    });

    for (const e of items.filter((e) => e.type === "work")) {
      const k = e.date.slice(0, 10);
      const d = days.find((x) => x.key === k);
      if (d) d.value += (e.payload as WorkPayload).hours ?? 0;
    }

    return days;
  }, [items]);

  // Check if there's data
  const totalHours = data.reduce((sum, d) => sum + d.value, 0);

  if (totalHours === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20 flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-[var(--accent-primary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-[var(--text-secondary)] font-medium text-lg mb-1">
            Noch keine Arbeitszeit erfasst
          </p>
          <p className="text-[var(--text-tertiary)] text-sm">
            Starte mit deiner ersten Stunde!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
        >
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "var(--text-secondary)",
              fontSize: 12,
              fontWeight: 500,
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
            width={35}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(253, 184, 99, 0.05)", radius: 8 }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.isToday
                    ? "url(#todayGradient)"
                    : entry.isWeekend
                    ? "url(#weekendGradient)"
                    : "url(#defaultGradient)"
                }
              />
            ))}
          </Bar>

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="defaultGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-primary)" />
              <stop offset="100%" stopColor="var(--accent-secondary)" />
            </linearGradient>
            <linearGradient id="todayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--coral-red)" />
              <stop offset="100%" stopColor="var(--deep-red)" />
            </linearGradient>
            <linearGradient id="weekendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--vibrant-orange)" />
              <stop offset="100%" stopColor="var(--coral-red)" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(WorkHoursBar);
