"use client";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";
import { useEntries } from "@/store/useEntries";

type Props = {
  from?: string; // yyyy-mm-dd (optional)
  to?: string; // yyyy-mm-dd (optional)
  topN?: number; // optional: z.B. 10
};

export default function WorkByPersonBar({ from, to, topN }: Props) {
  const items = useEntries((s) => s.items);

  const data = useMemo(() => {
    // nur Work-Einträge + Zeitraum
    const byPerson = new Map<string, number>();
    for (const e of items) {
      if (e.type !== "work") continue;
      if (from && e.date < from) continue;
      if (to && e.date > to) continue;
      const p = e.payload as any;
      const key = p.personName ?? "Unbekannt";
      const add = Number(p.hours ?? 0);
      byPerson.set(key, (byPerson.get(key) ?? 0) + add);
    }
    // in Array umwandeln und sortieren
    let arr = Array.from(byPerson, ([name, value]) => ({ name, value }));
    arr.sort((a, b) => b.value - a.value);
    if (topN && topN > 0) arr = arr.slice(0, topN);
    return arr;
  }, [items, from, to, topN]);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 p-4">
        <div className="text-sm opacity-70 mb-2">Arbeitsstunden pro Person</div>
        <p className="opacity-70">Keine Daten im ausgewählten Zeitraum.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 p-4">
      <div className="text-sm opacity-70 mb-2">
        Arbeitsstunden pro Person (Summe)
      </div>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
          >
            <XAxis
              dataKey="name"
              angle={-20}
              textAnchor="end"
              interval={0}
              height={50}
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
            <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
