'use client';
import { useMemo } from "react";
import { useEntries } from "@/store/useEntries";
import { format } from "date-fns";
import { de } from "date-fns/locale";

function isSameDay(a:string,b:Date){return a.slice(0,10)===b.toISOString().slice(0,10);}
function startOfWeek(d:Date){const c=new Date(d);const day=(c.getDay()+6)%7;c.setDate(c.getDate()-day);c.setHours(0,0,0,0);return c;}
function endOfWeek(d:Date){const s=startOfWeek(d);const e=new Date(s);e.setDate(s.getDate()+6);e.setHours(23,59,59,999);return e;}

export default function DashboardCards() {
  const items = useEntries(s=>s.items);
  const now = new Date();
  const sow = startOfWeek(now), eow = endOfWeek(now);

  const {workToday, workWeek, expToday, expWeek, workMonth, expMonth} = useMemo(()=>{
    let wt=0, ww=0, et=0, ew=0, wm=0, em=0;
    for (const e of items){
      if (e.type==="work"){
        const hrs = (e.payload as any).hours ?? 0;
        if (isSameDay(e.date, now)) wt+=hrs;
        const d=new Date(e.date);
        if (d>=sow && d<=eow) ww+=hrs;
        if (d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear()) wm+=hrs;
      } else if (e.type==="expense"){
        const sum = (e.payload as any).total ?? 0;
        if (isSameDay(e.date, now)) et+=sum;
        const d=new Date(e.date);
        if (d>=sow && d<=eow) ew+=sum;
        if (d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear()) em+=sum;
      }
    }
    return {workToday:wt, workWeek:ww, expToday:et, expWeek:ew, workMonth:wm, expMonth:em};
  },[items]);

  const monthLabel = format(now, "LLLL yyyy", {locale:de});

  return (
    <section className="grid gap-3 sm:grid-cols-3 w-full">
      <Card title="Arbeitszeit heute" value={`${workToday.toFixed(2)} h`} />
      <Card title="Arbeitszeit Woche" value={`${workWeek.toFixed(2)} h`} />
      <Card title="Ausgaben Woche" value={`${expWeek.toFixed(2)} €`} />
      <Card title={`Arbeitszeit ${monthLabel}`} value={`${workMonth.toFixed(2)} h`} />
      <Card title={`Ausgaben ${monthLabel}`} value={`${expMonth.toFixed(2)} €`} />
      <Card title="Ausgaben heute" value={`${expToday.toFixed(2)} €`} />
    </section>
  );
}

function Card({title,value}:{title:string;value:string}) {
  return (
    <div className="rounded-xl border border-white/10 p-4 bg-white/5">
      <div className="text-sm opacity-70">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
