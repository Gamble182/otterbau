'use client';
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useEntries } from "@/store/useEntries";

function startOfWeek(d: Date){const c=new Date(d);const day=(c.getDay()+6)%7;c.setDate(c.getDate()-day);c.setHours(0,0,0,0);return c;}

export default function WorkHoursBar(){
  const items = useEntries(s=>s.items);
  const data = useMemo(()=>{
    const now = new Date();
    const sow = startOfWeek(now); // Mo
    const days = Array.from({length:7},(_,i)=> {
      const d = new Date(sow); d.setDate(sow.getDate()+i);
      const key = d.toISOString().slice(0,10);
      return { key, label: ["Mo","Di","Mi","Do","Fr","Sa","So"][i], value: 0 };
    });
    for (const e of items.filter(e=>e.type==="work")){
      const k = e.date.slice(0,10);
      const d = days.find(x=>x.key===k);
      if (d) d.value += (e.payload as any).hours ?? 0;
    }
    return days;
  },[items]);

  return (
    <div className="rounded-xl border border-white/10 p-4">
      <div className="text-sm opacity-70 mb-2">Arbeitszeit diese Woche (h)</div>
      <div style={{width:"100%", height:240}}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
