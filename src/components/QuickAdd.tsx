"use client";

import { useState, useMemo, useEffect } from "react";
import Modal from "./Modal";
import { useEntries } from "@/store/useEntries";
import { usePersons } from "@/store/usePersons";
import { isoDate, isoNow } from "@/lib/utils";
import type { Entry, WorkPayload, ExpensePayload } from "@/lib/schemas/zod";

interface QuickAddProps {
  onClose?: () => void;
  initialType?: "work" | "expense";
}

export default function QuickAdd({
  onClose,
  initialType = "work",
}: QuickAddProps = {}) {
  // Wenn onClose prop vorhanden ist, verwende externen State
  const [isOpen, setIsOpen] = useState(!!onClose);
  const [activeType, setActiveType] = useState<"work" | "expense">(initialType);

  // Für externe Nutzung: öffne automatisch
  useEffect(() => {
    if (onClose) {
      setIsOpen(true);
      setActiveType(initialType);
    }
  }, [onClose, initialType]);

  const openModal = (type: "work" | "expense") => {
    if (onClose) return; // Externe Kontrolle
    setActiveType(type);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    if (onClose) {
      setTimeout(onClose, 150); // Kurze Delay für Animation
    }
  };

  // Wenn extern gesteuert und nicht offen, render nichts
  if (onClose && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Desktop Buttons - nur wenn NICHT extern gesteuert */}
      {!onClose && (
        <div className="hidden sm:flex gap-3">
          <button
            className="btn btn-primary animate-scale-in"
            onClick={() => openModal("work")}
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
            onClick={() => openModal("expense")}
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
      )}

      {/* Mobile FAB - nur wenn NICHT extern gesteuert */}
      {!onClose && (
        <div className="sm:hidden fixed bottom-20 right-4 flex flex-col gap-3 z-40">
          {/* Hauptbutton für Arbeitszeit (häufiger genutzt) */}
          <button
            onClick={() => openModal("work")}
            className="w-14 h-14 bg-gradient-accent text-white rounded-full shadow-xl hover:shadow-2xl active:scale-90 transition-all flex items-center justify-center backdrop-blur-sm animate-scale-in"
            style={{
              filter: "drop-shadow(0 4px 16px rgba(253, 184, 99, 0.3))",
            }}
            aria-label="Arbeitszeit erfassen"
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {/* Sekundärbutton für Ausgaben */}
          <button
            onClick={() => openModal("expense")}
            className="w-12 h-12 bg-gradient-warm text-white rounded-full shadow-lg hover:shadow-xl active:scale-90 transition-all flex items-center justify-center backdrop-blur-sm animate-scale-in"
            style={{
              animationDelay: "150ms",
              filter: "drop-shadow(0 4px 12px rgba(232, 90, 43, 0.3))",
            }}
            aria-label="Ausgabe erfassen"
          >
            <svg
              className="w-5 h-5"
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
          </button>
        </div>
      )}

      {/* Modal - immer rendern wenn isOpen */}
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          title={
            activeType === "work" ? "Arbeitszeit erfassen" : "Ausgabe erfassen"
          }
          subtitle={
            activeType === "work"
              ? "Neue Arbeitsstunden hinzufügen"
              : "Neue Ausgabe dokumentieren"
          }
          size="lg"
        >
          {activeType === "work" ? (
            <WorkForm onSuccess={closeModal} />
          ) : (
            <ExpenseForm onSuccess={closeModal} />
          )}
        </Modal>
      )}
    </>
  );
}

// Work Form Component
function WorkForm({ onSuccess }: { onSuccess: () => void }) {
  const persons = usePersons((s) => s.items);
  const add = useEntries((s) => s.add);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    personId: "",
    hours: "8",
    note: "",
    project: "",
    date: isoDate(),
  });

  // Auto-select "Yannik" when persons load
  useEffect(() => {
    if (persons.length > 0 && !formData.personId) {
      const yannik = persons.find((p) => p.name === "Yannik");
      const defaultPerson = yannik || persons[0];
      setFormData((prev) => ({ ...prev, personId: defaultPerson.id }));
    }
  }, [persons, formData.personId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const person = persons.find((x) => x.id === formData.personId);
    if (!person) {
      alert("Bitte Person wählen");
      return;
    }

    const hours = Number(formData.hours);
    if (isNaN(hours) || hours <= 0) {
      alert("Bitte gültige Stunden eingeben");
      return;
    }

    setIsSubmitting(true);
    try {
      await add({
        type: "work",
        date: formData.date,
        tags: formData.project ? [formData.project] : [],
        payload: {
          personId: person.id,
          personName: person.name,
          hours,
          note: formData.note,
          project: formData.project,
        } as WorkPayload,
        createdAt: isoNow(),
        updatedAt: isoNow(),
      } as Omit<Entry, "id">);

      onSuccess();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Fehler beim Speichern");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (persons.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-[var(--text-tertiary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          Keine Personen vorhanden
        </h3>
        <p className="text-[var(--text-secondary)] mb-4">
          Füge erst eine Person in den Einstellungen hinzu.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Person & Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">
              <span className="text-lg">👤</span>
              Person
            </span>
          </label>
          <select
            value={formData.personId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, personId: e.target.value }))
            }
            className="form-select"
            required
          >
            <option value="">Person wählen...</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              Datum
            </span>
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
            className="form-input"
            required
          />
        </div>
      </div>

      {/* Hours & Project */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">
              <span className="text-lg">⏰</span>
              Stunden
            </span>
          </label>
          <input
            type="number"
            step="1"
            min="0"
            max="16"
            value={formData.hours}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, hours: e.target.value }))
            }
            className="form-input text-lg font-semibold"
            placeholder="z.B. 8"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">
              <span className="text-lg">🏗️</span>
              Projekt{" "}
              <span className="text-[var(--text-tertiary)] text-xs font-normal">
                (optional)
              </span>
            </span>
          </label>
          <input
            value={formData.project}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, project: e.target.value }))
            }
            className="form-input"
            placeholder="z.B. Küche, Bad, Dach"
          />
        </div>
      </div>

      {/* Note */}
      <div className="space-y-2">
        <label className="form-label">
          <span className="flex items-center gap-2">
            <span className="text-lg">📝</span>
            Notiz{" "}
            <span className="text-[var(--text-tertiary)] text-xs font-normal">
              (optional)
            </span>
          </span>
        </label>
        <textarea
          rows={3}
          value={formData.note}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, note: e.target.value }))
          }
          className="form-textarea"
          placeholder="Was wurde gemacht?"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={onSuccess}
          className="btn btn-secondary order-2 sm:order-1"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary order-1 sm:order-2 flex-1 sm:flex-initial"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Speichert...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
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

// Expense Form Component - Verbesserte Version
function ExpenseForm({ onSuccess }: { onSuccess: () => void }) {
  const add = useEntries((s) => s.add);
  const entries = useEntries((s) => s.items);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    position: "",
    manufacturer: "",
    category: "🔧 Werkzeug",
    type: "",
    extra: "",
    apartment: "",
    buyer: "Yannik",
    qty: "1",
    price: "",
    date: isoDate(),
  });

  // Autofill-Optionen aus bestehenden Einträgen generieren
  const { manufacturerOptions, typeOptions, categoryOptions } = useMemo(() => {
    const manufacturers = new Set<string>();
    const types = new Set<string>();
    const categories = new Set<string>();

    entries.forEach((entry) => {
      if (entry.type === "expense") {
        const payload = entry.payload as ExpensePayload;
        if (payload.manufacturer) manufacturers.add(payload.manufacturer);
        if (payload.type) types.add(payload.type);
        if (payload.category) categories.add(payload.category);
      }
    });

    return {
      manufacturerOptions: Array.from(manufacturers).sort(),
      typeOptions: Array.from(types).sort(),
      categoryOptions: Array.from(categories).sort(),
    };
  }, [entries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.position.trim()) {
      alert("Bitte Position eingeben");
      return;
    }

    const qty = Number(formData.qty.replace(",", "."));
    const unitPrice = Number(formData.price.replace(",", "."));

    if (isNaN(qty) || qty <= 0) {
      alert("Bitte gültige Menge eingeben");
      return;
    }
    if (isNaN(unitPrice) || unitPrice < 0) {
      alert("Bitte gültigen Preis eingeben");
      return;
    }

    setIsSubmitting(true);
    try {
      await add({
        type: "expense",
        date: formData.date,
        tags: [formData.category],
        payload: {
          position: formData.position.trim(),
          manufacturer: formData.manufacturer.trim() || undefined,
          category: formData.category,
          type: formData.type.trim() || undefined,
          extra: formData.extra.trim() || undefined,
          apartment: formData.apartment || undefined,
          qty,
          unitPrice,
          total: qty * unitPrice,
          currency: "EUR",
          buyer: formData.buyer,
        } as ExpensePayload,
        createdAt: isoNow(),
        updatedAt: isoNow(),
      } as Omit<Entry, "id">);

      onSuccess();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Fehler beim Speichern");
    } finally {
      setIsSubmitting(false);
    }
  };

  const total =
    Number(formData.qty.replace(",", ".") || "0") *
    Number(formData.price.replace(",", ".") || "0");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Position & Hersteller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">
              <span className="text-lg">🏷️</span>
              Position *
            </span>
          </label>
          <input
            value={formData.position}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, position: e.target.value }))
            }
            className="form-input text-lg font-semibold"
            placeholder="z.B. Bohrmaschine, Material, Farbe"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">
              <span className="text-lg">🏭</span>
              Hersteller{" "}
              <span className="text-[var(--text-tertiary)] text-xs font-normal">
                (optional)
              </span>
            </span>
          </label>
          <input
            list="manufacturer-options"
            value={formData.manufacturer}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))
            }
            className="form-input"
            placeholder="z.B. Bosch, Makita, Festool"
          />
          <datalist id="manufacturer-options">
            {manufacturerOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Kategorie & Art */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">
              <span className="text-lg">📂</span>
              Kategorie
            </span>
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
            className="form-select"
          >
            {/* Benutzte Kategorien zuerst */}
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            {/* Standard-Kategorien falls noch nicht verwendet */}
            {!categoryOptions.includes("🔧 Werkzeug") && (
              <option>🔧 Werkzeug</option>
            )}
            {!categoryOptions.includes("🧱 Material") && (
              <option>🧱 Material</option>
            )}
            {!categoryOptions.includes("🏗️ Baustelle") && (
              <option>🏗️ Baustelle</option>
            )}
            {!categoryOptions.includes("⚡ Elektrik") && (
              <option>⚡ Elektrik</option>
            )}
            {!categoryOptions.includes("🚿 Sanitär") && (
              <option>🚿 Sanitär</option>
            )}
            {!categoryOptions.includes("🎨 Farbe & Lack") && (
              <option>🎨 Farbe & Lack</option>
            )}
            {!categoryOptions.includes("🚪 Türen & Fenster") && (
              <option>🚪 Türen & Fenster</option>
            )}
            {!categoryOptions.includes("🔩 Schrauben & Befestigung") && (
              <option>🔩 Schrauben & Befestigung</option>
            )}
            {!categoryOptions.includes("📦 Sonstiges") && (
              <option>📦 Sonstiges</option>
            )}
          </select>
        </div>

        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">
              <span className="text-lg">🏷️</span>
              Art{" "}
              <span className="text-[var(--text-tertiary)] text-xs font-normal">
                (optional)
              </span>
            </span>
          </label>
          <input
            list="type-options"
            value={formData.type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, type: e.target.value }))
            }
            className="form-input"
            placeholder="z.B. Elektrowerkzeug, Handwerkzeug"
          />
          <datalist id="type-options">
            {typeOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Zusatz & Wohnung */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">
              <span className="text-lg">➕</span>
              Zusatz{" "}
              <span className="text-[var(--text-tertiary)] text-xs font-normal">
                (optional)
              </span>
            </span>
          </label>
          <input
            value={formData.extra}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, extra: e.target.value }))
            }
            className="form-input"
            placeholder="z.B. + 2x 4,0Ah Akku"
          />
        </div>

        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">
              <span className="text-lg">🏠</span>
              Wohnung{" "}
              <span className="text-[var(--text-tertiary)] text-xs font-normal">
                (optional)
              </span>
            </span>
          </label>
          <select
            value={formData.apartment}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, apartment: e.target.value }))
            }
            className="form-select"
          >
            <option value="">Wohnung wählen...</option>
            <option value="LY">LY</option>
            <option value="EW">EW</option>
          </select>
        </div>
      </div>

      {/* Datum & Käufer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              Datum
            </span>
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
            className="form-input"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="form-label">
            <span className="flex items-center gap-2">
              <span className="text-lg">👤</span>
              Käufer
            </span>
          </label>
          <select
            value={formData.buyer}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, buyer: e.target.value }))
            }
            className="form-select"
            required
          >
            <option value="Yannik">Yannik</option>
            <option value="Lisa">Lisa</option>
            <option value="Gemeinsam">Gemeinsam</option>
            <option value="Thomas">Thomas</option>
          </select>
        </div>
      </div>

      {/* Menge, Preis pro Stück & Summe */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="form-label text-sm">
            <span className="flex items-center gap-1">
              <span>📊</span>
              Menge
            </span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.qty}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, qty: e.target.value }))
            }
            className="form-input text-center font-semibold"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="form-label text-sm">
            <span className="flex items-center gap-1">
              <span>💰</span>
              Preis €
            </span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, price: e.target.value }))
            }
            className="form-input text-center font-semibold"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="form-label text-sm">
            <span className="flex items-center gap-1">
              <span>💸</span>
              Summe €
            </span>
          </label>
          <div className="w-full px-3 py-3 rounded-xl border-2 border-[var(--coral-red)]/30 bg-gradient-to-r from-[var(--coral-red)]/10 to-[var(--deep-red)]/10 font-bold text-center text-lg text-[var(--coral-red)]">
            {total.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={onSuccess}
          className="btn btn-secondary order-2 sm:order-1"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-success order-1 sm:order-2 flex-1 sm:flex-initial"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Speichert...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
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
