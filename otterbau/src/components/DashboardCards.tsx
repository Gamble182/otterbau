"use client";
import { Card } from "@/components/ui/Card";
import { useEntries } from "@/store/useEntries";
import { useMemo } from "react";

export default function DashboardCards() {
  const items = useEntries((s) => s.items);
  const { todayHours, weekHours, monthHours, weekExpenses, monthExpenses } =
    useMemo(() => {
      const now = new Date();
      const isoToday = now.toISOString().slice(0, 10);
      const startOfWeek = new Date(now);
      const day = (startOfWeek.getDay() + 6) % 7;
      startOfWeek.setDate(startOfWeek.getDate() - day);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      let th = 0,
        wh = 0,
        mh = 0,
        we = 0,
        me = 0;
      for (const e of items) {
        const d = new Date(e.date);
        if (e.type === "work") {
          const h = Number((e.payload as any).hours ?? 0);
          if (e.date.startsWith(isoToday)) th += h;
          if (d >= startOfWeek) wh += h;
          if (d >= startOfMonth) mh += h;
        } else if (e.type === "expense") {
          const v = Number((e.payload as any).total ?? 0);
          if (d >= startOfWeek) we += v;
          if (d >= startOfMonth) me += v;
        }
      }
      return {
        todayHours: th,
        weekHours: wh,
        monthHours: mh,
        weekExpenses: we,
        monthExpenses: me,
      };
    }, [items]);

  const Item = ({ label, value }: { label: string; value: string }) => (
    <Card title={label}>
      <p className="text-lg font-semibold">{value}</p>
    </Card>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <Item label="Arbeitszeit (heute)" value={`${todayHours.toFixed(1)} h`} />
      <Item label="Arbeitszeit (Woche)" value={`${weekHours.toFixed(1)} h`} />
      <Item label="Ausgaben (Woche)" value={`${weekExpenses.toFixed(2)} €`} />
      <Item label="Arbeitszeit (Monat)" value={`${monthHours.toFixed(1)} h`} />
      <Item label="Ausgaben (Monat)" value={`${monthExpenses.toFixed(2)} €`} />
    </div>
  );
}
