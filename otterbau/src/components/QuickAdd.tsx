"use client";
import { useState } from "react";
import Dialog from "./Dialog";
import { useEntries } from "@/store/useEntries";
import { usePersons } from "@/store/usePersons";
import { isoDate, isoNow } from "@/lib/utils";

export default function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"work" | "expense">("work");

  return (
    <>
      {/* Desktop Buttons */}
      <div className="hidden sm:flex gap-3">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
          onClick={() => {
            setType("work");
            setOpen(true);
          }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Arbeitszeit
        </button>

        <button
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
          onClick={() => {
            setType("expense");
            setOpen(true);
          }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
          Ausgabe
        </button>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => {
          setType("work");
          setOpen(true);
        }}
        className="sm:hidden fixed bottom-20 right-4 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl active:scale-90 transition-all z-40 flex items-center justify-center"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={type === "work" ? "Arbeitszeit erfassen" : "Ausgabe erfassen"}
        subtitle={
          type === "work"
            ? "Neue Arbeitsstunden hinzufügen"
            : "Neue Ausgabe dokumentieren"
        }
        maxWidth="lg"
      >
        {type === "work" ? (
          <WorkForm onDone={() => setOpen(false)} />
        ) : (
          <ExpenseForm onDone={() => setOpen(false)} />
        )}
      </Dialog>
    </>
  );
}

function WorkForm({ onDone }: { onDone: () => void }) {
  const persons = usePersons((s) => s.items);
  const add = useEntries((s) => s.add);
  const [personId, setPersonId] = useState(persons[0]?.id ?? "");
  const [hours, setHours] = useState("1.0");
  const [note, setNote] = useState("");
  const [project, setProject] = useState("");
  const [date, setDate] = useState(isoDate());
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    const p = persons.find((x) => x.id === personId);
    if (!p) return alert("Bitte Person wählen");

    const hrs = Number(hours.replace(",", "."));
    if (isNaN(hrs) || hrs <= 0) return alert("Bitte gültige Stunden eingeben");

    setIsSubmitting(true);
    try {
      await add({
        type: "work",
        date,
        tags: project ? [project] : [],
        payload: {
          personId: p.id,
          personName: p.name,
          hours: hrs,
          note,
          project,
        },
        createdAt: isoNow(),
        updatedAt: isoNow(),
      } as any);
      onDone();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      {/* Person & Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Person
          </label>
          <select
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Datum
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Hours & Project */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Stunden
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="z.B. 2.5"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Projekt (optional)
          </label>
          <input
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="z.B. Küche, Bad, Dach"
          />
        </div>
      </div>

      {/* Note */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Notiz (optional)
        </label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Was wurde gemacht?"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onDone}
          className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-xl font-medium transition-all disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  className="opacity-75"
                />
              </svg>
              Speichert...
            </>
          ) : (
            "Speichern"
          )}
        </button>
      </div>
    </form>
  );
}

function ExpenseForm({ onDone }: { onDone: () => void }) {
  const add = useEntries((s) => s.add);
  const [position, setPosition] = useState("");
  const [category, setCategory] = useState("Werkzeug");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [buyer, setBuyer] = useState("Yannik");
  const [date, setDate] = useState(isoDate());
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (!position.trim()) return alert("Bitte Position eingeben");

    const q = Number(qty.replace(",", "."));
    const up = Number(price.replace(",", "."));

    if (isNaN(q) || q <= 0) return alert("Bitte gültige Menge eingeben");
    if (isNaN(up) || up < 0) return alert("Bitte gültigen Preis eingeben");

    setIsSubmitting(true);
    try {
      await add({
        type: "expense",
        date,
        tags: [category],
        payload: {
          position: position.trim(),
          category,
          qty: q,
          unitPrice: up,
          total: q * up,
          currency: "EUR",
          buyer,
          note,
        },
        createdAt: isoNow(),
        updatedAt: isoNow(),
      } as any);
      onDone();
    } finally {
      setIsSubmitting(false);
    }
  }

  const total =
    Number(qty.replace(",", ".") || "0") *
    Number(price.replace(",", ".") || "0");

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      {/* Position & Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Position *
          </label>
          <input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="z.B. Bohrmaschine, Material, Farbe"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Datum
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Category & Buyer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Kategorie
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option>Werkzeug</option>
            <option>Material</option>
            <option>Baustelle</option>
            <option>Elektrik</option>
            <option>Sanitär</option>
            <option>Sonstiges</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Käufer
          </label>
          <input
            value={buyer}
            onChange={(e) => setBuyer(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Name des Käufers"
          />
        </div>
      </div>

      {/* Qty, Price & Total */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Menge
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Einzelpreis €
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Gesamt €
          </label>
          <div className="w-full px-3 py-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 font-bold text-right">
            {total.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Notiz (optional)
        </label>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Zusätzliche Informationen..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onDone}
          className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-xl font-medium transition-all disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  className="opacity-75"
                />
              </svg>
              Speichert...
            </>
          ) : (
            "Speichern"
          )}
        </button>
      </div>
    </form>
  );
}
