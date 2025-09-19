"use client";

import { useState } from "react";
import { z } from "zod";
import { db } from "@/lib/db/dexie";
import { Card } from "@/components/ui/Card";
import AppShell from "@/components/AppShell";
import { usePersons } from "@/store/usePersons";
import { useEntries } from "@/store/useEntries";

// ---- Zod-Schemas & Typen ----
import {
  PersonSchema,
  EntrySchema,
  ExpensePayload,
  type Person,
  type Entry,
} from "@/lib/schemas/zod";

// ---- Import-Format: exakt deine Typen ----
const ImportFileZ = z.object({
  persons: z.array(PersonSchema),
  entries: z.array(EntrySchema),
});
type ImportFile = z.infer<typeof ImportFileZ>;

// Einfaches Ausgaben-JSON Format
const SimpleExpenseSchema = z.object({
  position: z.string(),
  manufacturer: z.string().optional(),
  category: z.string(),
  type: z.string().optional(),
  extra: z.string().optional(),
  apartment: z.string().optional(),
  buyer: z.string(),
  qty: z.number().positive().default(1),
  unitPrice: z.number().nonnegative(),
  total: z.number().nonnegative(),
  date: z.string(), // ISO date
  note: z.string().optional(),
});

const SimpleExpensesImportZ = z.object({
  expenses: z.array(SimpleExpenseSchema),
});

export default function SettingsPage() {
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<"import" | "export" | "data">(
    "import"
  );

  const reloadStores = async () => {
    await usePersons.getState().load();
    await useEntries.getState().load();
  };

  const onImportFullData = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    setStatus("Lese vollständige Daten...");

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const parsed = ImportFileZ.parse(json) as ImportFile;

      setStatus("Schreibe Personen...");
      if (parsed.persons.length > 0) {
        await db.persons.bulkPut(parsed.persons as Person[]);
      }

      setStatus("Schreibe Einträge...");
      if (parsed.entries.length > 0) {
        await db.entries.bulkPut(parsed.entries as Entry[]);
      }

      await reloadStores();
      setStatus(
        `✅ Import erfolgreich: ${parsed.persons.length} Personen, ${parsed.entries.length} Einträge.`
      );
    } catch (e: unknown) {
      console.error(e);
      setStatus(
        `❌ Import fehlgeschlagen: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    } finally {
      setBusy(false);
    }
  };

  const onImportExpenses = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    setStatus("Lese Ausgaben-Daten...");

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const parsed = SimpleExpensesImportZ.parse(json);

      setStatus("Konvertiere und speichere Ausgaben...");
      const entries: Entry[] = parsed.expenses.map((expense) => ({
        id: crypto.randomUUID(),
        type: "expense" as const,
        date: expense.date,
        tags: [expense.category],
        payload: {
          position: expense.position,
          manufacturer: expense.manufacturer,
          category: expense.category,
          type: expense.type,
          extra: expense.extra,
          apartment: expense.apartment,
          buyer: expense.buyer,
          qty: expense.qty,
          unitPrice: expense.unitPrice,
          total: expense.total,
          currency: "EUR",
          note: expense.note,
        } as ExpensePayload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      if (entries.length > 0) {
        await db.entries.bulkPut(entries);
      }

      await reloadStores();
      setStatus(
        `✅ Ausgaben-Import erfolgreich: ${entries.length} Ausgaben hinzugefügt.`
      );
    } catch (e: unknown) {
      console.error(e);
      setStatus(
        `❌ Ausgaben-Import fehlgeschlagen: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    } finally {
      setBusy(false);
    }
  };

  const onExportData = async () => {
    setBusy(true);
    setStatus("Exportiere Daten...");

    try {
      const persons = await db.persons.toArray();
      const entries = await db.entries.toArray();

      const exportData = {
        persons,
        entries,
        exportedAt: new Date().toISOString(),
        version: "1.0",
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `otterbau-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setStatus("✅ Export erfolgreich heruntergeladen!");
    } catch (e: unknown) {
      console.error(e);
      setStatus(
        `❌ Export fehlgeschlagen: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    } finally {
      setBusy(false);
    }
  };

  const onResetData = async () => {
    if (
      !confirm(
        "🚨 Wirklich ALLE lokalen Daten (DB, Cache, Storage) unwiderruflich löschen?"
      )
    )
      return;
    setBusy(true);
    setStatus("Lösche Datenbank...");

    try {
      await db.delete();

      // SW-Caches (best effort)
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }

      // Local-/Session-Storage
      localStorage.clear();
      sessionStorage.clear();

      setStatus("✅ Zurückgesetzt. Seite wird neu geladen...");
      setTimeout(() => location.reload(), 1000);
    } catch (e: unknown) {
      console.error(e);
      setStatus(
        `❌ Fehler beim Zurücksetzen: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-lg">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              Einstellungen
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Daten verwalten, importieren und exportieren
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <Card variant="glass">
          <div className="tab-container">
            {[
              { id: "import", label: "Import", icon: "📥" },
              { id: "export", label: "Export", icon: "📤" },
              { id: "data", label: "Daten", icon: "🗃️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "import" | "export" | "data")}
                className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Status Display */}
        {status && (
          <Card variant="glass" className="animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center flex-shrink-0">
                {busy ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : status.startsWith("✅") ? (
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : status.startsWith("❌") ? (
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-[var(--text-primary)] mb-1">
                  Status
                </div>
                <div className="text-[var(--text-secondary)]">{status}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Content basierend auf aktivem Tab */}
        {activeTab === "import" && (
          <div className="space-y-6">
            {/* Vollständiger Datenimport */}
            <Card
              title="Vollständiger Import"
              subtitle="Importiere Personen und alle Einträge aus einer JSON-Backup-Datei"
            >
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--accent-primary)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                        Erwartetes Format
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        JSON mit{" "}
                        <code className="font-mono bg-[var(--bg-secondary)] px-1 rounded">
                          persons[]
                        </code>{" "}
                        und{" "}
                        <code className="font-mono bg-[var(--bg-secondary)] px-1 rounded">
                          entries[]
                        </code>{" "}
                        Arrays
                      </p>
                    </div>
                  </div>
                </div>

                <label className="block space-y-2">
                  <span className="form-label">Backup-Datei wählen</span>
                  <input
                    type="file"
                    accept="application/json,.json"
                    className="form-input"
                    onChange={(e) =>
                      onImportFullData(e.currentTarget.files?.[0] ?? null)
                    }
                    disabled={busy}
                  />
                </label>
              </div>
            </Card>

            {/* Ausgaben-Import */}
            <Card
              title="Ausgaben-Import"
              subtitle="Importiere nur Ausgaben aus einer vereinfachten JSON-Datei"
            >
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--coral-red)]/10 to-[var(--deep-red)]/10 border border-[var(--coral-red)]/20">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--coral-red)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                        Vereinfachtes Format
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        JSON mit{" "}
                        <code className="font-mono bg-[var(--bg-secondary)] px-1 rounded">
                          expenses[]
                        </code>{" "}
                        Array.{" "}
                        <button
                          onClick={() => {
                            const example = {
                              expenses: [
                                {
                                  position: "Bohrmaschine",
                                  manufacturer: "Bosch",
                                  category: "🔧 Werkzeug",
                                  type: "Elektrowerkzeug",
                                  buyer: "Yannik",
                                  qty: 1,
                                  unitPrice: 149.99,
                                  total: 149.99,
                                  date: "2024-12-18",
                                  note: "Für Badezimmer",
                                },
                              ],
                            };
                            const blob = new Blob(
                              [JSON.stringify(example, null, 2)],
                              { type: "application/json" }
                            );
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "expenses-example.json";
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="text-[var(--coral-red)] hover:underline"
                        >
                          Beispiel herunterladen
                        </button>
                      </p>
                    </div>
                  </div>
                </div>

                <label className="block space-y-2">
                  <span className="form-label">Ausgaben-Datei wählen</span>
                  <input
                    type="file"
                    accept="application/json,.json"
                    className="form-input"
                    onChange={(e) =>
                      onImportExpenses(e.currentTarget.files?.[0] ?? null)
                    }
                    disabled={busy}
                  />
                </label>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "export" && (
          <div className="space-y-6">
            <Card
              title="Vollständiger Export"
              subtitle="Lade alle Daten als JSON-Backup herunter"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">
                    Erstellt eine vollständige Sicherung aller Personen und
                    Einträge
                  </p>
                  <ul className="text-xs text-[var(--text-tertiary)] space-y-1">
                    <li>• Alle Personen und Arbeitszeiten</li>
                    <li>• Alle Ausgaben und Projektkosten</li>
                    <li>• Metadaten und Zeitstempel</li>
                  </ul>
                </div>
                <button
                  onClick={onExportData}
                  disabled={busy}
                  className="btn btn-primary"
                >
                  {busy ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Exportiert...
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
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Jetzt exportieren
                    </div>
                  )}
                </button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "data" && (
          <div className="space-y-6">
            <Card
              title="Daten zurücksetzen"
              subtitle="Lösche alle lokalen Daten unwiderruflich"
            >
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                        Gefährliche Aktion
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-500">
                        Diese Aktion kann nicht rückgängig gemacht werden. Alle
                        Daten gehen verloren.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)] mb-1">
                      Löscht unwiderruflich:
                    </p>
                    <ul className="text-xs text-[var(--text-tertiary)] space-y-1">
                      <li>• Lokale Datenbank (IndexedDB)</li>
                      <li>• Service Worker Caches</li>
                      <li>• Local- und SessionStorage</li>
                    </ul>
                  </div>
                  <button
                    onClick={onResetData}
                    disabled={busy}
                    className="px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {busy ? "Löscht..." : "Alle Daten löschen"}
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
