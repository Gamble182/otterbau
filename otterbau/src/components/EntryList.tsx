"use client";
import type { FilterState } from "./Filters";
import { useFilteredEntries } from "./Filters";

export default function EntryList({ filter }: { filter: FilterState }) {
  const items = useFilteredEntries(filter).slice().reverse();
  return (
    <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
      {items.map((e) => {
        const p = e.payload as any;
        const label =
          e.type === "work"
            ? `🛠️ ${p.personName} • ${p.hours} h`
            : e.type === "expense"
            ? `💶 ${p.position} • ${Number(p.total).toFixed(2)} €`
            : `📑 ${p.position} • ${Number(p.amount).toFixed(2)} €`;
        return (
          <li key={e.id} className="p-3 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-sm opacity-70">{e.date}</span>
          </li>
        );
      })}
    </ul>
  );
}
