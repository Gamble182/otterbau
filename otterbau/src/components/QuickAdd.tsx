"use client";
import { useState } from "react";
import Dialog from "./Dialog";
import { useEntries } from "@/store/useEntries";
import { usePersons } from "@/store/usePersons";
import { isoDate, isoNow } from "@/lib/utils";
import Fab from "@/components/Fab";

export default function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"work" | "expense">("work");
  return (
    <>
      <div className="flex gap-3">
        <button
          className="px-3 py-2 rounded bg-white/10"
          onClick={() => {
            setType("work");
            setOpen(true);
          }}
        >
          + Arbeit
        </button>
        <button
          className="px-3 py-2 rounded bg-white/10"
          onClick={() => {
            setType("expense");
            setOpen(true);
          }}
        >
          + Ausgabe
        </button>
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={type === "work" ? "Arbeit erfassen" : "Ausgabe erfassen"}
      >
        {type === "work" ? (
          <WorkForm onDone={() => setOpen(false)} />
        ) : (
          <ExpenseForm onDone={() => setOpen(false)} />
        )}
      </Dialog>

      {/* Desktop-Buttons bleiben, mobil zusätzlich: */}
      <Fab
        onClick={() => {
          setType("work");
          setOpen(true);
        }}
        label="+ Erfassen"
      />
    </>
  );
}

function WorkForm({ onDone }: { onDone: () => void }) {
  const persons = usePersons((s) => s.items);
  const add = useEntries((s) => s.add);
  const [personId, setPersonId] = useState(persons[0]?.id ?? "");
  const [hours, setHours] = useState("1.0");
  const [note, setNote] = useState("");

  async function submit() {
    const p = persons.find((x) => x.id === personId);
    if (!p) return alert("Bitte Person wählen");
    const hrs = Number(hours.replace(",", "."));
    if (isNaN(hrs) || hrs < 0) return alert("Stunden ungültig");
    await add({
      type: "work",
      date: isoDate(),
      tags: [],
      payload: { personId: p.id, personName: p.name, hours: hrs, note },
      createdAt: isoNow(),
      updatedAt: isoNow(),
    } as any);
    onDone();
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <label className="grid gap-1">
        <span className="text-sm opacity-80">Person</span>
        <select
          value={personId}
          onChange={(e) => setPersonId(e.target.value)}
          className="bg-zinc-800 rounded px-3 py-2"
        >
          {persons.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1">
        <span className="text-sm opacity-80">Stunden</span>
        <input
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="bg-zinc-800 rounded px-3 py-2"
          placeholder="z. B. 2.5"
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm opacity-80">Notiz</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="bg-zinc-800 rounded px-3 py-2"
        />
      </label>
      <button type="submit" className="mt-2 px-3 py-2 rounded bg-emerald-600">
        Speichern
      </button>
    </form>
  );
}

function ExpenseForm({ onDone }: { onDone: () => void }) {
  const add = useEntries((s) => s.add);
  const [position, setPosition] = useState("");
  const [category, setCategory] = useState("Werkzeug");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("0");
  const [buyer, setBuyer] = useState("Yannik");

  async function submit() {
    const q = Number(qty.replace(",", "."));
    const up = Number(price.replace(",", "."));
    if (isNaN(q) || q <= 0) return alert("Menge ungültig");
    if (isNaN(up) || up < 0) return alert("Preis ungültig");
    await add({
      type: "expense",
      date: isoDate(),
      tags: [category],
      payload: {
        position: position || "Position",
        category,
        qty: q,
        unitPrice: up,
        total: q * up,
        currency: "EUR",
        buyer,
      },
      createdAt: isoNow(),
      updatedAt: isoNow(),
    } as any);
    onDone();
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <label className="grid gap-1">
        <span className="text-sm opacity-80">Position</span>
        <input
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="bg-zinc-800 rounded px-3 py-2"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1">
          <span className="text-sm opacity-80">Kategorie</span>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-zinc-800 rounded px-3 py-2"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm opacity-80">Käufer</span>
          <input
            value={buyer}
            onChange={(e) => setBuyer(e.target.value)}
            className="bg-zinc-800 rounded px-3 py-2"
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1">
          <span className="text-sm opacity-80">Menge</span>
          <input
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="bg-zinc-800 rounded px-3 py-2"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm opacity-80">Preis/Einheit (€)</span>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="bg-zinc-800 rounded px-3 py-2"
          />
        </label>
      </div>
      <button type="submit" className="mt-2 px-3 py-2 rounded bg-emerald-600">
        Speichern
      </button>
    </form>
  );
}
