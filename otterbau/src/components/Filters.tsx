'use client';
import { useState, useMemo } from "react";
import { useEntries } from "@/store/useEntries";

export type FilterState = { type: ""|"work"|"expense"|"projectCost"; from?: string; to?: string };

export default function Filters({onChange}:{onChange:(f:FilterState)=>void}) {
  const [type,setType] = useState<FilterState["type"]>("");
  const [from,setFrom] = useState<string>("");
  const [to,setTo] = useState<string>("");

  useMemo(()=>onChange({type, from: from||undefined, to: to||undefined}),[type,from,to,onChange]);

  return (
    <div className="grid sm:grid-cols-4 gap-3 items-end">
      <label className="grid gap-1">
        <span className="text-sm opacity-80">Typ</span>
        <select value={type} onChange={e=>setType(e.target.value as any)} className="bg-zinc-800 rounded px-3 py-2">
          <option value="">Alle</option>
          <option value="work">Arbeit</option>
          <option value="expense">Ausgabe</option>
          <option value="projectCost">Projektkosten</option>
        </select>
      </label>
      <label className="grid gap-1">
        <span className="text-sm opacity-80">Von</span>
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="bg-zinc-800 rounded px-3 py-2" />
      </label>
      <label className="grid gap-1">
        <span className="text-sm opacity-80">Bis</span>
        <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="bg-zinc-800 rounded px-3 py-2" />
      </label>
      <ClearBtn onClick={()=>{setType("");setFrom("");setTo("");}} />
    </div>
  );
}

function ClearBtn({onClick}:{onClick:()=>void}) {
  return <button onClick={onClick} className="px-3 py-2 rounded bg-white/10">Reset</button>;
}

// Hilfsselector: gefilterte Items aus Store (clientseitig)
export function useFilteredEntries(f: FilterState){
  const items = useEntries(s=>s.items);
  return useMemo(()=>{
    return items.filter(e=>{
      if (f.type && e.type!==f.type) return false;
      if (f.from && e.date < f.from) return false;
      if (f.to && e.date > f.to) return false;
      return true;
    }).slice().sort((a,b)=>a.date.localeCompare(b.date));
  },[items,f.type,f.from,f.to]);
}
