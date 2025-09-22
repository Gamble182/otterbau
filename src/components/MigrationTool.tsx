// src/components/MigrationTool.tsx
"use client";

import { useState } from "react";
import { Card } from "./ui/Card";
import { db } from "@/lib/db/dexie";
import { usePersons } from "@/store/usePersons";
import { useEntries } from "@/store/useEntries";

interface MigrationStats {
  indexedDbPersons: number;
  indexedDbEntries: number;
  supabasePersons: number;
  supabaseEntries: number;
}

export function MigrationTool() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [migrationComplete, setMigrationComplete] = useState(false);

  const supabasePersons = usePersons((s) => s.items);
  const supabaseEntries = useEntries((s) => s.items);
  const loadPersons = usePersons((s) => s.load);
  const loadEntries = useEntries((s) => s.load);
  const bulkAddPersons = usePersons((s) => s.bulkAdd);
  const bulkAddEntries = useEntries((s) => s.bulkAdd);

  const analyzeDatabases = async () => {
    setIsLoading(true);
    setStatus("Analysiere Datenbanken...");

    try {
      // IndexedDB Daten laden
      const indexedDbPersons = await db.persons.count();
      const indexedDbEntries = await db.entries.count();

      // Supabase Daten laden
      await loadPersons();
      await loadEntries();

      const migrationStats: MigrationStats = {
        indexedDbPersons,
        indexedDbEntries,
        supabasePersons: supabasePersons.length,
        supabaseEntries: supabaseEntries.length,
      };

      setStats(migrationStats);
      setStatus(`Analyse abgeschlossen. IndexedDB: ${indexedDbPersons} Personen, ${indexedDbEntries} Einträge. Supabase: ${supabasePersons.length} Personen, ${supabaseEntries.length} Einträge.`);
    } catch (error) {
      console.error("Analyse-Fehler:", error);
      setStatus(`Fehler bei der Analyse: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const migrateData = async () => {
    if (!stats) {
      setStatus("Erst Analyse durchführen!");
      return;
    }

    if (stats.indexedDbPersons === 0 && stats.indexedDbEntries === 0) {
      setStatus("Keine Daten in IndexedDB vorhanden!");
      return;
    }

    setIsLoading(true);
    setStatus("Migration gestartet...");

    try {
      let migratedPersons = 0;
      let migratedEntries = 0;

      // 1. Personen migrieren
      if (stats.indexedDbPersons > 0) {
        setStatus("Migriere Personen...");
        const indexedDbPersonsData = await db.persons.toArray();
        
        // Filter Personen die noch nicht in Supabase sind
        const existingNames = new Set(supabasePersons.map(p => p.name));
        const newPersons = indexedDbPersonsData.filter(p => !existingNames.has(p.name));

        if (newPersons.length > 0) {
          await bulkAddPersons(newPersons.map(p => ({ name: p.name })));
          migratedPersons = newPersons.length;
        }
      }

      // 2. Personen neu laden für ID-Mapping
      await loadPersons();
      const updatedSupabasePersons = usePersons.getState().items;
      const personNameToId = new Map(updatedSupabasePersons.map(p => [p.name, p.id]));

      // 3. Einträge migrieren
      if (stats.indexedDbEntries > 0) {
        setStatus("Migriere Einträge...");
        const indexedDbEntriesData = await db.entries.toArray();

        // Konvertiere IndexedDB Einträge zu Supabase Format
        const entriesToMigrate = indexedDbEntriesData.map(entry => {
          let payload = entry.payload;

          // Aktualisiere personId in work entries falls nötig
          if (entry.type === 'work' && typeof payload === 'object' && payload !== null) {
            const workPayload = payload as Record<string, unknown>;
            if (typeof workPayload.personName === 'string' && personNameToId.has(workPayload.personName)) {
              payload = {
                ...workPayload,
                personId: personNameToId.get(workPayload.personName)
              };
            }
          }

          return {
            type: entry.type,
            date: entry.date,
            tags: entry.tags,
            payload,
          };
        });

        // Filter Einträge die noch nicht in Supabase sind (basierend auf date + type + payload)
        const existingEntries = new Set(
          supabaseEntries.map(e => `${e.date}_${e.type}_${JSON.stringify(e.payload)}`)
        );
        
        const newEntries = entriesToMigrate.filter(e => 
          !existingEntries.has(`${e.date}_${e.type}_${JSON.stringify(e.payload)}`)
        );

        if (newEntries.length > 0) {
          await bulkAddEntries(newEntries);
          migratedEntries = newEntries.length;
        }
      }

      setStatus(`Migration abgeschlossen! ${migratedPersons} Personen und ${migratedEntries} Einträge migriert.`);
      setMigrationComplete(true);

      // Daten neu laden für aktuelle Anzeige
      await loadPersons();
      await loadEntries();

    } catch (error) {
      console.error("Migrations-Fehler:", error);
      setStatus(`Fehler bei der Migration: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const exportIndexedDbData = async () => {
    setIsLoading(true);
    setStatus("Exportiere IndexedDB Daten...");

    try {
      const persons = await db.persons.toArray();
      const entries = await db.entries.toArray();

      const exportData = {
        persons,
        entries,
        exportedAt: new Date().toISOString(),
        version: "1.0",
        source: "IndexedDB",
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `otterbau-indexeddb-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setStatus("IndexedDB Daten erfolgreich exportiert!");
    } catch (error) {
      console.error("Export-Fehler:", error);
      setStatus(`Fehler beim Export: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Daten-Migration" subtitle="IndexedDB → Supabase Migration">
      <div className="space-y-6">
        {/* Status */}
        {status && (
          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <div className="flex items-start gap-3">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mt-0.5"></div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-[var(--accent-primary)] mt-0.5"></div>
              )}
              <div>
                <div className="font-medium text-[var(--text-primary)]">Status</div>
                <div className="text-sm text-[var(--text-secondary)] mt-1">{status}</div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <Card title="IndexedDB (Lokal)" className="text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-[var(--accent-primary)]">
                  {stats.indexedDbPersons}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">Personen</div>
                <div className="text-2xl font-bold text-[var(--coral-red)]">
                  {stats.indexedDbEntries}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">Einträge</div>
              </div>
            </Card>

            <Card title="Supabase (Cloud)" className="text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-[var(--accent-primary)]">
                  {stats.supabasePersons}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">Personen</div>
                <div className="text-2xl font-bold text-[var(--coral-red)]">
                  {stats.supabaseEntries}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">Einträge</div>
              </div>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={analyzeDatabases}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            📊 Analysieren
          </button>

          <button
            onClick={exportIndexedDbData}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            💾 Export (Backup)
          </button>

          <button
            onClick={migrateData}
            disabled={isLoading || !stats || migrationComplete}
            className={`btn ${migrationComplete ? 'btn-success' : 'btn-primary'}`}
          >
            {migrationComplete ? '✅ Migriert' : '🚀 Migrieren'}
          </button>
        </div>

        {/* Info */}
        <div className="p-4 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[var(--accent-primary)] flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-1">Migration Info</h4>
              <div className="text-sm text-[var(--text-secondary)] space-y-1">
                <p>• <strong>Analysieren:</strong> Prüft beide Datenbanken</p>
                <p>• <strong>Export:</strong> Erstellt Backup deiner lokalen Daten</p>
                <p>• <strong>Migrieren:</strong> Überträgt Daten zu Supabase (Cloud)</p>
                <p>• Duplikate werden automatisch übersprungen</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}