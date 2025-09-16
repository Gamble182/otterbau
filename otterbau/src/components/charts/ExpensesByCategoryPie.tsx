"use client";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Label,
} from "recharts";
import { Legend as RechartsLegend } from "recharts";

import { useEntries } from "@/store/useEntries";

type Props = {
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
  topN?: number; // z.B. 8 – Rest wird als "Sonstige" aggregiert
};

const palette = [
  "#60a5fa",
  "#34d399",
  "#f472b6",
  "#f59e0b",
  "#a78bfa",
  "#fb7185",
  "#22d3ee",
  "#c084fc",
  "#4ade80",
  "#fca5a5",
];

export default function ExpensesByCategoryPie({ from, to, topN = 8 }: Props) {
  const items = useEntries((s) => s.items);

  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of items) {
      if (e.type !== "expense") continue;
      if (from && e.date < from) continue;
      if (to && e.date > to) continue;
      const p = e.payload as any;
      const cat = (p.category ?? "Unkategorisiert").toString();
      const val = Number(p.total ?? 0);
      map.set(cat, (map.get(cat) ?? 0) + val);
    }
    let arr = Array.from(map, ([name, value]) => ({ name, value }));
    arr.sort((a, b) => b.value - a.value);
    if (arr.length > topN) {
      const head = arr.slice(0, topN);
      const tailSum = arr.slice(topN).reduce((s, x) => s + x.value, 0);
      if (tailSum > 0) head.push({ name: "Sonstige", value: tailSum });
      arr = head;
    }
    return arr;
  }, [items, from, to, topN]);

  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  if (!data.length) {
    return (
      <div className="rounded-xl border border-white/10 p-4">
        <div className="text-sm opacity-70 mb-2">Ausgaben pro Kategorie</div>
        <p className="opacity-70">Keine Daten im ausgewählten Zeitraum.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 p-4">
      <div className="text-sm opacity-70 mb-2">Ausgaben pro Kategorie</div>
      <div style={{ width: "100%", height: 340 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={120}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={palette[i % palette.length]} />
              ))}
              <Label
                value={`${total.toFixed(2)} €`}
                position="center"
                className="text-base"
              />
            </Pie>
            <Tooltip formatter={(v: number) => `${v.toFixed(2)} €`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded"
              style={{ background: palette[i % palette.length] }}
            />
            <span className="truncate">{d.name}</span>
            <span className="ml-auto tabular-nums">{d.value.toFixed(2)} €</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
