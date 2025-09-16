"use client";

import Image from "next/image";
import DashboardCards from "@/components/DashboardCards";
import EntryList from "@/components/EntryList";
import { usePersons } from "@/store/usePersons";
import { isoDate, isoNow } from "@/lib/utils";
import QuickAdd from "@/components/QuickAdd";
import { useMemo, useState } from "react";
import Filters, { type FilterState } from "@/components/Filters";
import { exportCSV } from "@/lib/export/csv";
import { exportJSON } from "@/lib/export/json";
import { useEntries } from "@/store/useEntries";

export default function Home() {
  const addEntry = useEntries((s) => s.add);
  const persons = usePersons((s) => s.items);

  async function addWork() {
    const y = persons.find((p) => p.name === "Yannik") ?? persons[0];
    if (!y) return alert("Keine Person vorhanden");
    await addEntry({
      type: "work",
      date: isoDate(),
      tags: [],
      payload: {
        personId: y.id,
        personName: y.name,
        hours: 1.5,
        note: "Schnellerfassung",
      },
      createdAt: isoNow(),
      updatedAt: isoNow(),
    } as any);
  }

  const all = useEntries((s) => s.items);
  const [filter, setFilter] = useState<FilterState>({ type: "" });
  const filtered = useMemo(
    () =>
      all.filter((e) => {
        if (filter.type && e.type !== filter.type) return false;
        if (filter.from && e.date < filter.from) return false;
        if (filter.to && e.date > filter.to) return false;
        return true;
      }),
    [all, filter]
  );

  async function addExpense() {
    await addEntry({
      type: "expense",
      date: isoDate(),
      tags: ["Test"],
      payload: {
        position: "Material",
        category: "Baustelle",
        qty: 1,
        unitPrice: 25,
        total: 25,
        currency: "EUR",
        buyer: "Yannik",
      },
      createdAt: isoNow(),
      updatedAt: isoNow(),
    } as any);
  }

  return (
    <div className="min-h-screen p-8 grid gap-8">
      <main className="mx-auto w-full max-w-3xl grid gap-6">
        <Image
          className="mx-auto dark:invert"
          src="/next.svg"
          alt="Next.js"
          width={120}
          height={26}
        />
        <h1 className="text-2xl font-semibold text-center">Otterbau</h1>
        <p className="text-center opacity-80">
          Arbeitsstunden & Ausgaben – MVP
        </p>

        <DashboardCards />

        <QuickAdd />

        <Filters onChange={setFilter} />

        <div className="flex gap-3">
          <button
            className="px-3 py-2 rounded bg-white/10"
            onClick={() => exportCSV(filtered)}
          >
            Export CSV
          </button>
          <button
            className="px-3 py-2 rounded bg-white/10"
            onClick={() => exportJSON(filtered)}
          >
            Export JSON
          </button>
        </div>

        <EntryList filter={filter} />
      </main>
    </div>
  );
}
