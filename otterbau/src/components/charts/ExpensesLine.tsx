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

export default function ExpensesLine() {
  const items = useEntries((s) => s.items);
  const data = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear(),
      month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr = Array.from({ length: daysInMonth }, (_, i) => ({
      label: String(i + 1).padStart(2, "0"),
      key: `${year}-${String(month + 1).padStart(2, "0")}-${String(
        i + 1
      ).padStart(2, "0")}`,
      value: 0,
    }));
    for (const e of items.filter((e) => e.type === "expense")) {
      const k = e.date.slice(0, 10);
      const row = arr.find((x) => x.key === k);
      if (row) row.value += Number((e.payload as any).total ?? 0);
    }
    return arr;
  }, [items]);

  return (
    <div className="rounded-xl border border-white/10 p-4">
      <div className="text-sm opacity-70 mb-2">
        Ausgaben (aktueller Monat, €)
      </div>
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis
              width={40}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              dot={false}
              stroke="#2563eb"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
