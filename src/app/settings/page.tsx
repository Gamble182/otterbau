"use client";

import { useState } from "react";
import { z } from "zod";
import { Card } from "@/components/ui/Card";
import AppShell from "@/components/AppShell";
import { usePersons } from "@/store/usePersons";
import { useEntries } from "@/store/useEntries";

// Import schemas
import {
  PersonSchema,
  EntrySchema,
  ExpensePayload,
  WorkPayload,
  type Person,
  type Entry,
} from "@/lib/schemas/zod";

// Enhanced import format schemas
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
  date: z.string(),
  note: z.string().optional(),
});

const SimpleExpensesImportZ = z.object({
  version: z.string().optional(),
  exportedAt: z.string().optional(),
  importType: z.string().optional(),
  expenses: z.array(SimpleExpenseSchema),
});

const CombinedImportZ = z.object({
  persons: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      createdAt: z.string(),
    })
  ),
  entries: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["work", "expense", "projectCost"]),
      date: z.string(),
      tags: z.array(z.string()),
      payload: z.record(z.string(), z.any()),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
  ),
});

const FullImportZ = z.object({
  persons: z.array(PersonSchema),
  entries: z.array(EntrySchema),
});

interface ImportProgress {
  phase: string;
  current: number;
  total: number;
  percentage: number;
}

interface PreviewData {
  format: string;
  persons: number;
  entries: number;
  duplicates?: number;
  details: any;
}

export default function SettingsPage() {
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [activeTab, setActiveTab] = useState<"import" | "export" | "data">(
    "import"
  );
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const reloadStores = async () => {
    await usePersons.getState().load();
    await useEntries.getState().load();
  };

  // Detect import format automatically
  const detectImportFormat = (data: any): string => {
    if (data.expenses && Array.isArray(data.expenses)) return "simple_expenses";
    if (data.importType === "SIMPLE_EXPENSES") return "simple_expenses";
    if (
      data.persons &&
      data.entries &&
      data.persons[0]?.id &&
      data.entries[0]?.id
    )
      return "combined";
    if (data.persons && data.entries) return "full";
    if (data.entries && !data.persons) return "simple_work";
    return "unknown";
  };

  const formatForDisplay = (format: string) => {
    const formats: Record<string, string> = {
      simple_expenses: "Einfache Ausgaben",
      combined: "Vollständige Daten (mit IDs)",
      full: "Vollständige Daten",
      simple_work: "Arbeitszeit-Daten",
      unknown: "Unbekanntes Format",
    };
    return formats[format] || format;
  };

  // Preview import file
  const previewImport = async (file: File | null) => {
    if (!file) {
      setPreviewData(null);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const format = detectImportFormat(json);

      let persons = 0;
      let entries = 0;
      let details: any = {};

      switch (format) {
        case "simple_expenses":
          entries = json.expenses?.length || 0;
          persons = [...new Set(json.expenses?.map((e: any) => e.buyer) || [])]
            .length;
          details = {
            buyers: [...new Set(json.expenses?.map((e: any) => e.buyer) || [])],
            categories: [
              ...new Set(json.expenses?.map((e: any) => e.category) || []),
            ],
            totalAmount:
              json.expenses?.reduce(
                (sum: number, e: any) => sum + (e.total || 0),
                0
              ) || 0,
            dateRange: {
              from:
                json.expenses?.reduce(
                  (min: string, e: any) => (e.date < min ? e.date : min),
                  "9999-12-31"
                ) || "",
              to:
                json.expenses?.reduce(
                  (max: string, e: any) => (e.date > max ? e.date : max),
                  "0000-01-01"
                ) || "",
            },
          };
          break;
        case "combined":
          persons = json.persons?.length || 0;
          entries = json.entries?.length || 0;
          details = {
            workEntries:
              json.entries?.filter((e: any) => e.type === "work").length || 0,
            expenseEntries:
              json.entries?.filter((e: any) => e.type === "expense").length ||
              0,
          };
          break;
        case "full":
          persons = json.persons?.length || 0;
          entries = json.entries?.length || 0;
          break;
        default:
          persons = json.persons?.length || 0;
          entries = json.entries?.length || 0;
      }

      setPreviewData({
        format,
        persons,
        entries,
        details,
      });
      setStatus("");
    } catch (error) {
      setStatus(
        `❌ Fehler beim Lesen der Datei: ${
          error instanceof Error ? error.message : "Unbekannter Fehler"
        }`
      );
      setPreviewData(null);
      setSelectedFile(null);
    }
  };

  // Main import function
  const onImportFile = async () => {
    if (!selectedFile || !previewData) return;

    setBusy(true);
    setProgress(null);
    setStatus("Analysiere Datei...");

    try {
      const text = await selectedFile.text();
      const json = JSON.parse(text);
      const format = detectImportFormat(json);

      setStatus(
        `Format erkannt: ${formatForDisplay(format)}. Starte Import...`
      );
      setProgress({
        phase: "Vorbereitung",
        current: 0,
        total: 100,
        percentage: 0,
      });

      switch (format) {
        case "simple_expenses":
          await handleSimpleExpensesImport(json);
          break;
        case "combined":
          await handleCombinedImport(json);
          break;
        case "full":
          await handleFullImport(json);
          break;
        default:
          throw new Error(`Unbekanntes Format: ${format}`);
      }

      await reloadStores();
      setProgress({
        phase: "Abgeschlossen",
        current: 100,
        total: 100,
        percentage: 100,
      });
      setStatus("✅ Import erfolgreich abgeschlossen!");
      setPreviewData(null);
      setSelectedFile(null);
    } catch (e: unknown) {
      console.error(e);
      setStatus(
        `❌ Import fehlgeschlagen: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
      setProgress(null);
    } finally {
      setBusy(false);
    }
  };

  const handleSimpleExpensesImport = async (json: any) => {
    const parsed = SimpleExpensesImportZ.parse(json);

    setProgress({
      phase: "Erstelle Personen",
      current: 10,
      total: 100,
      percentage: 10,
    });

    // Create buyers as persons
    const uniqueBuyers = [...new Set(parsed.expenses.map((e) => e.buyer))];
    for (let i = 0; i < uniqueBuyers.length; i++) {
      try {
        await usePersons.getState().add(uniqueBuyers[i]);
      } catch {
        // Person might already exist
      }
      setProgress({
        phase: "Erstelle Personen",
        current: 10 + (i / uniqueBuyers.length) * 30,
        total: 100,
        percentage: 10 + (i / uniqueBuyers.length) * 30,
      });
    }

    setProgress({
      phase: "Konvertiere Ausgaben",
      current: 40,
      total: 100,
      percentage: 40,
    });

    const entries: Omit<Entry, "id" | "createdAt" | "updatedAt">[] =
      parsed.expenses.map((expense) => ({
        type: "expense" as const,
        date: expense.date,
        tags: [expense.category],
        payload: {
          position: expense.position,
          manufacturer: expense.manufacturer || undefined,
          category: expense.category,
          type: expense.type || undefined,
          extra: expense.extra || undefined,
          apartment: expense.apartment || undefined,
          buyer: expense.buyer,
          qty: expense.qty,
          unitPrice: expense.unitPrice,
          total: expense.total,
          currency: "EUR",
          note: expense.note || undefined,
        } as ExpensePayload,
      }));

    setProgress({
      phase: "Importiere Ausgaben",
      current: 60,
      total: 100,
      percentage: 60,
    });

    // Use bulkAdd for better performance
    const entriesStore = useEntries.getState();
    await entriesStore.bulkAdd(entries);
  };

  const handleCombinedImport = async (json: any) => {
    const parsed = CombinedImportZ.parse(json);

    setProgress({
      phase: "Importiere Personen",
      current: 0,
      total: 100,
      percentage: 0,
    });

    const personMap = new Map<string, string>();

    for (let i = 0; i < parsed.persons.length; i++) {
      const person = parsed.persons[i];
      try {
        const newPerson = await usePersons.getState().add(person.name);
        personMap.set(person.id, newPerson.id);
      } catch {
        const existingPersons = usePersons.getState().items;
        const existing = existingPersons.find((p) => p.name === person.name);
        if (existing) {
          personMap.set(person.id, existing.id);
        }
      }

      setProgress({
        phase: "Importiere Personen",
        current: (i / parsed.persons.length) * 30,
        total: 100,
        percentage: (i / parsed.persons.length) * 30,
      });
    }

    setProgress({
      phase: "Konvertiere Einträge",
      current: 30,
      total: 100,
      percentage: 30,
    });

    const entries: Omit<Entry, "id" | "createdAt" | "updatedAt">[] =
      parsed.entries.map((entry) => {
        let payload = entry.payload;

        if (entry.type === "work" && payload.personId && typeof payload.personId === "string") {
          const newPersonId = personMap.get(payload.personId);
          if (newPersonId) {
            payload = { ...payload, personId: newPersonId };
          }
        }

        return {
          type: entry.type,
          date: entry.date,
          tags: entry.tags,
          payload,
        };
      });

    setProgress({
      phase: "Importiere Einträge",
      current: 50,
      total: 100,
      percentage: 50,
    });

    await useEntries.getState().bulkAdd(entries);
  };

  const handleFullImport = async (json: any) => {
    const parsed = FullImportZ.parse(json);

    setProgress({
      phase: "Importiere Personen",
      current: 0,
      total: 100,
      percentage: 0,
    });

    for (let i = 0; i < parsed.persons.length; i++) {
      try {
        await usePersons.getState().add(parsed.persons[i].name);
      } catch {
        // Person might already exist
      }
      setProgress({
        phase: "Importiere Personen",
        current: (i / parsed.persons.length) * 50,
        total: 100,
        percentage: (i / parsed.persons.length) * 50,
      });
    }

    setProgress({
      phase: "Importiere Einträge",
      current: 50,
      total: 100,
      percentage: 50,
    });

    const entriesToAdd = parsed.entries.map((entry) => ({
      type: entry.type,
      date: entry.date,
      tags: entry.tags,
      payload: entry.payload,
    }));

    await useEntries.getState().bulkAdd(entriesToAdd);
  };

  const onExportData = async () => {
    setBusy(true);
    setStatus("Exportiere Daten...");

    try {
      const persons = usePersons.getState().items;
      const entries = useEntries.getState().items;

      const exportData = {
        persons,
        entries,
        exportedAt: new Date().toISOString(),
        version: "1.0",
        metadata: {
          totalPersons: persons.length,
          totalEntries: entries.length,
          exportedBy: "Otterbau App",
        },
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
    const confirmed = confirm(
      "🚨 Wirklich ALLE Daten unwiderruflich löschen?\n\n" +
        "Dies löscht:\n" +
        "• Alle Arbeitszeit-Einträge\n" +
        "• Alle Ausgaben-Einträge\n" +
        "• Alle Personen\n\n" +
        "Diese Aktion kann NICHT rückgängig gemacht werden!"
    );

    if (!confirmed) return;

    setBusy(true);
    setStatus("Lösche alle Daten...");

    try {
      // Clear data using store methods
      const entriesStore = useEntries.getState();
      const personsStore = usePersons.getState();

      // Clear entries first, then persons
      await entriesStore.clear?.();
      await personsStore.clear?.();

      setStatus("✅ Alle Daten gelöscht. Seite wird neu geladen...");
      setTimeout(() => location.reload(), 1500);
    } catch (e: unknown) {
      console.error(e);
      setStatus(
        `❌ Fehler beim Löschen: ${e instanceof Error ? e.message : String(e)}`
      );
    } finally {
      setBusy(false);
    }
  };

  const downloadSampleFile = (type: "expenses" | "full") => {
    let sampleData;

    if (type === "expenses") {
      sampleData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        importType: "SIMPLE_EXPENSES",
        expenses: [
          {
            position: "Akkuschrauber",
            manufacturer: "Bosch",
            category: "🔧 Werkzeug",
            type: "Elektrowerkzeug",
            extra: "+ 2x 4,0mAh Akku",
            apartment: "LY",
            buyer: "Yannik",
            qty: 1.0,
            unitPrice: 280.0,
            total: 280.0,
            date: "2024-03-06",
            note: "Beispieldaten für Import-Test",
          },
          {
            position: "Fliesen",
            manufacturer: "Villeroy & Boch",
            category: "🧱 Material",
            type: "Bodenfliesen",
            extra: "30x60cm",
            apartment: "EW",
            buyer: "Lisa",
            qty: 15.0,
            unitPrice: 12.5,
            total: 187.5,
            date: "2024-03-07",
            note: "Badezimmer Renovierung",
          },
        ],
      };
    } else {
      const samplePersonId = crypto.randomUUID();
      sampleData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        persons: [
          {
            id: samplePersonId,
            name: "Yannik",
            createdAt: new Date().toISOString(),
          },
          {
            id: crypto.randomUUID(),
            name: "Max",
            createdAt: new Date().toISOString(),
          },
        ],
        entries: [
          {
            id: crypto.randomUUID(),
            type: "work",
            date: "2024-03-15",
            tags: ["Hausrenovierung"],
            payload: {
              personId: samplePersonId,
              personName: "Yannik",
              hours: 8.0,
              project: "Küche",
              note: "Beispiel Arbeitszeit-Eintrag",
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: crypto.randomUUID(),
            type: "expense",
            date: "2024-03-16",
            tags: ["🔧 Werkzeug"],
            payload: {
              position: "Stichsäge",
              manufacturer: "Makita",
              category: "🔧 Werkzeug",
              type: "Elektrowerkzeug",
              buyer: "Yannik",
              qty: 1,
              unitPrice: 89.99,
              total: 89.99,
              currency: "EUR",
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      };
    }

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `otterbau-sample-${type}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearPreview = () => {
    setPreviewData(null);
    setSelectedFile(null);
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
                onClick={() => setActiveTab(tab.id as any)}
                className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Status & Progress Display */}
        {(status || progress) && (
          <Card variant="glass" className="animate-scale-in">
            <div className="space-y-4">
              {status && (
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
              )}

              {progress && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {progress.phase}
                    </span>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {Math.round(progress.percentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-[var(--bg-secondary)] rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-accent transition-all duration-300 ease-out"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Preview Data */}
        {previewData && (
          <Card variant="glass" className="animate-scale-in">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
                  <span className="text-white font-bold">👁️</span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Datei-Vorschau
                </h3>
                <button
                  onClick={clearPreview}
                  className="ml-auto p-2 hover:bg-[var(--bg-surface)] rounded-lg transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-[var(--text-tertiary)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-[var(--bg-secondary)]">
                  <div className="text-sm text-[var(--text-secondary)]">
                    Format
                  </div>
                  <div className="font-bold text-[var(--accent-primary)]">
                    {formatForDisplay(previewData.format)}
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-[var(--bg-secondary)]">
                  <div className="text-sm text-[var(--text-secondary)]">
                    Personen
                  </div>
                  <div className="font-bold text-[var(--text-primary)]">
                    {previewData.persons}
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-[var(--bg-secondary)]">
                  <div className="text-sm text-[var(--text-secondary)]">
                    Einträge
                  </div>
                  <div className="font-bold text-[var(--text-primary)]">
                    {previewData.entries}
                  </div>
                </div>
              </div>

              {previewData.details &&
                Object.keys(previewData.details).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-[var(--text-primary)]">
                      Details:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {Object.entries(previewData.details).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between p-2 rounded bg-[var(--bg-secondary)]"
                          >
                            <span className="text-[var(--text-secondary)] capitalize">
                              {key.replace(/([A-Z])/g, " $1")}:
                            </span>
                            <span className="font-medium text-[var(--text-primary)]">
                              {Array.isArray(value)
                                ? value.length > 3
                                  ? `${value.slice(0, 3).join(", ")} +${
                                      value.length - 3
                                    } mehr`
                                  : value.join(", ")
                                : typeof value === "object" && value !== null
                                ? JSON.stringify(value, null, 2)
                                : String(value)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--border-subtle)]">
                <button onClick={clearPreview} className="btn btn-secondary">
                  Abbrechen
                </button>
                <button
                  onClick={onImportFile}
                  disabled={busy}
                  className="btn btn-primary flex-1"
                >
                  {busy ? "Importiert..." : "Import starten"}
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Content based on active tab */}
        {activeTab === "import" && (
          <div className="space-y-6">
            <Card
              title="Universeller Import"
              subtitle="Unterstützt mehrere Datenformate automatisch"
            >
              <div className="space-y-6">
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
                        Unterstützte Formate
                      </p>
                      <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                        <li>
                          • <strong>Einfache Ausgaben:</strong> JSON mit
                          "expenses" Array
                        </li>
                        <li>
                          • <strong>Vollständige Daten:</strong> Personen und
                          Einträge mit IDs
                        </li>
                        <li>
                          • <strong>Kombinierte Daten:</strong> Legacy-Format
                          mit Mappings
                        </li>
                        <li>
                          • <strong>Arbeitszeit-Daten:</strong> Nur
                          Arbeitszeit-Einträge
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block space-y-2">
                    <span className="form-label flex items-center gap-2">
                      <span className="text-lg">📁</span>
                      Datei für Import auswählen
                    </span>
                    <input
                      type="file"
                      accept="application/json,.json"
                      className="form-input"
                      onChange={(e) =>
                        previewImport(e.currentTarget.files?.[0] ?? null)
                      }
                      disabled={busy}
                    />
                  </label>

                  <div className="text-sm text-[var(--text-secondary)]">
                    Die Datei wird automatisch analysiert und das Format
                    erkannt.
                  </div>
                </div>

                {/* Sample Files */}
                <div className="space-y-4">
                  <h4 className="font-medium text-[var(--text-primary)]">
                    Beispieldateien herunterladen:
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => downloadSampleFile("expenses")}
                      className="btn btn-secondary flex-1"
                      disabled={busy}
                    >
                      📄 Ausgaben-Beispiel
                    </button>
                    <button
                      onClick={() => downloadSampleFile("full")}
                      className="btn btn-secondary flex-1"
                      disabled={busy}
                    >
                      📋 Vollständiges Beispiel
                    </button>
                  </div>
                </div>
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
              <div className="space-y-6">
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
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                        Export-Inhalt
                      </p>
                      <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                        <li>• Alle Personen mit vollständigen Informationen</li>
                        <li>• Alle Arbeitszeit- und Ausgaben-Einträge</li>
                        <li>• Metadaten und Zeitstempel für Import</li>
                        <li>• Strukturierte Daten im JSON-Format</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 rounded-xl bg-[var(--bg-secondary)]">
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                      Backup erstellen
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">
                      Erstellt eine vollständige Sicherung aller deiner Daten
                    </p>
                    <ul className="text-xs text-[var(--text-tertiary)] space-y-1">
                      <li>• {usePersons.getState().items.length} Personen</li>
                      <li>• {useEntries.getState().items.length} Einträge</li>
                      <li>• Kompatibel mit Import-Funktion</li>
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
              </div>
            </Card>
          </div>
        )}

        {activeTab === "data" && (
          <div className="space-y-6">
            {/* Statistiken */}
            <Card
              title="Datenübersicht"
              subtitle="Aktuelle Statistiken deiner gespeicherten Daten"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-[var(--bg-secondary)]">
                  <div className="text-2xl font-bold text-[var(--accent-primary)] mb-1">
                    {usePersons.getState().items.length}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    Personen
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-[var(--bg-secondary)]">
                  <div className="text-2xl font-bold text-[var(--coral-red)] mb-1">
                    {
                      useEntries
                        .getState()
                        .items.filter((e) => e.type === "work").length
                    }
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    Arbeitszeit
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-[var(--bg-secondary)]">
                  <div className="text-2xl font-bold text-[var(--vibrant-orange)] mb-1">
                    {
                      useEntries
                        .getState()
                        .items.filter((e) => e.type === "expense").length
                    }
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    Ausgaben
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-[var(--bg-secondary)]">
                  <div className="text-2xl font-bold text-[var(--deep-red)] mb-1">
                    {useEntries.getState().items.length}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    Gesamt
                  </div>
                </div>
              </div>
            </Card>

            {/* Daten zurücksetzen */}
            <Card
              title="Daten zurücksetzen"
              subtitle="Lösche alle lokalen Daten unwiderruflich"
            >
              <div className="space-y-6">
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
                        ⚠️ Gefährliche Aktion
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-500">
                        Diese Aktion kann nicht rückgängig gemacht werden.
                        Erstelle vorher ein Backup!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2">
                      Alle Daten löschen
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-500 mb-2">
                      Löscht unwiderruflich alle gespeicherten Daten:
                    </p>
                    <ul className="text-xs text-red-600 dark:text-red-500 space-y-1">
                      <li>• {usePersons.getState().items.length} Personen</li>
                      <li>
                        •{" "}
                        {
                          useEntries
                            .getState()
                            .items.filter((e) => e.type === "work").length
                        }{" "}
                        Arbeitszeit-Einträge
                      </li>
                      <li>
                        •{" "}
                        {
                          useEntries
                            .getState()
                            .items.filter((e) => e.type === "expense").length
                        }{" "}
                        Ausgaben-Einträge
                      </li>
                      <li>• Alle Einstellungen und Metadaten</li>
                    </ul>
                  </div>
                  <button
                    onClick={onResetData}
                    disabled={busy}
                    className="px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {busy ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Löscht...
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Alle Daten löschen
                      </div>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20">
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
                      <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                        💡 Empfehlung
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Erstelle vor dem Zurücksetzen ein Backup über den
                        Export-Tab. So kannst du deine Daten jederzeit
                        wiederherstellen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Info Footer */}
        <Card variant="glass" className="backdrop-blur">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6">
              <div className="status-indicator status-online">
                <div className="status-led status-led-active" />
                <span className="font-medium">App läuft offline</span>
              </div>
              <div className="status-indicator status-offline">
                <div className="status-led status-led-neutral" />
                <span className="font-medium">Daten lokal gespeichert</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[var(--text-tertiary)]">
              <span>Version 1.0</span>
              <span>•</span>
              <span>Otterbau Tracking</span>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
