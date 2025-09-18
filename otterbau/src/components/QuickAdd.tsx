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
      {/* Desktop Buttons - Sony Style */}
      <div className="hidden sm:flex gap-3">
        <button
          className="btn btn-primary animate-scale-in"
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
              strokeWidth={2.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Arbeitszeit
        </button>

        <button
          className="btn btn-success animate-scale-in"
          style={{ animationDelay: "100ms" }}
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
              strokeWidth={2.5}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
          Ausgabe
        </button>
      </div>

      {/* Mobile FAB - Sony Style */}
      <button
        onClick={() => {
          setType("work");
          setOpen(true);
        }}
        className="sm:hidden fixed bottom-20 right-4 w-14 h-14 bg-gradient-accent text-white rounded-full shadow-xl hover:shadow-2xl active:scale-90 transition-all z-40 flex items-center justify-center backdrop-blur-sm animate-scale-in"
        style={{
          filter: "drop-shadow(0 4px 16px rgba(253, 184, 99, 0.3))",
        }}
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
            strokeWidth={2.5}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>

      {/* Dialog - Updated für Sony Design */}
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
      className="space-y-6 animate-fade-in"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      {/* Person & Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">👤 Person</span>
          </label>
          <select
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            className="form-select"
          >
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">📅 Datum</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {/* Hours & Project */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">⏰ Stunden</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="form-input"
            placeholder="z.B. 2.5"
          />
        </div>

        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">
              🏗️ Projekt{" "}
              <span className="text-[var(--text-tertiary)] text-xs">
                (optional)
              </span>
            </span>
          </label>
          <input
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="form-input"
            placeholder="z.B. Küche, Bad, Dach"
          />
        </div>
      </div>

      {/* Note */}
      <div className="space-y-2">
        <label className="form-label">
          <span className="flex items-center gap-2">
            📝 Notiz{" "}
            <span className="text-[var(--text-tertiary)] text-xs">
              (optional)
            </span>
          </span>
        </label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="form-textarea"
          placeholder="Was wurde gemacht?"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
        <button type="button" onClick={onDone} className="btn btn-ghost">
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn btn-primary ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Speichert...
            </div>
          ) : (
            <div className="flex items-center gap-2">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Speichern
            </div>
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
      className="space-y-6 animate-fade-in"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      {/* Position & Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">🏷️ Position *</span>
          </label>
          <input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="form-input"
            placeholder="z.B. Bohrmaschine, Material, Farbe"
          />
        </div>

        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">📅 Datum</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {/* Category & Buyer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">📂 Kategorie</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-select"
          >
            <option>🔧 Werkzeug</option>
            <option>🧱 Material</option>
            <option>🏗️ Baustelle</option>
            <option>⚡ Elektrik</option>
            <option>🚿 Sanitär</option>
            <option>📦 Sonstiges</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">👤 Käufer</span>
          </label>
          <input
            value={buyer}
            onChange={(e) => setBuyer(e.target.value)}
            className="form-input"
            placeholder="Name des Käufers"
          />
        </div>
      </div>

      {/* Qty, Price & Total */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">📊 Menge</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">💰 Einzelpreis €</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">💸 Gesamt €</span>
          </label>
          <div className="w-full px-4 py-3 rounded-xl border-2 border-[var(--coral-red)]/20 bg-gradient-to-r from-[var(--coral-red)]/5 to-[var(--deep-red)]/5 font-bold text-right text-lg text-[var(--coral-red)]">
            {total.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="space-y-2">
        <label className="form-label">
          <span className="flex items-center gap-2">
            📝 Notiz{" "}
            <span className="text-[var(--text-tertiary)] text-xs">
              (optional)
            </span>
          </span>
        </label>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="form-textarea"
          placeholder="Zusätzliche Informationen..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
        <button type="button" onClick={onDone} className="btn btn-ghost">
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn btn-success ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Speichert...
            </div>
          ) : (
            <div className="flex items-center gap-2">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Speichern
            </div>
          )}
        </button>
      </div>
    </form>
  );
}
