"use client";

import { useState } from "react";
import { z } from "zod";
import { db } from "@/lib/db/dexie";
import { Card } from "@/components/ui/Card";
import { usePersons } from "@/store/usePersons";
import { useEntries } from "@/store/useEntries";

// ---- Zod-Schemas & Typen aus deiner Datei ----
import {
  PersonSchema,
  EntrySchema,
  type Person,
  type Entry,
} from "@/lib/schemas/zod";

// ---- Import-Format: exakt deine Typen ----
const ImportFileZ = z.object({
  persons: z.array(PersonSchema),
  entries: z.array(EntrySchema),
});
type ImportFile = z.infer<typeof ImportFileZ>;

export default function SettingsPage() {
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const reloadStores = async () => {
    await usePersons.getState().load();
    await useEntries.getState().load();
  };

  const onImportFile = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    setStatus("Lese Datei…");

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const parsed = ImportFileZ.parse(json) as ImportFile;

      // ---- Upsert in Dexie (bulkPut) – Typen passen exakt zu deinen Tables ----
      setStatus("Schreibe Personen…");
      if (parsed.persons.length > 0) {
        await db.persons.bulkPut(parsed.persons as Person[]);
      }

      setStatus("Schreibe Einträge…");
      if (parsed.entries.length > 0) {
        await db.entries.bulkPut(parsed.entries as Entry[]);
      }

      await reloadStores();
      setStatus(
        `Import fertig: ${parsed.persons.length} Personen, ${parsed.entries.length} Einträge.`
      );
    } catch (e: any) {
      console.error(e);
      setStatus(`Import fehlgeschlagen: ${e?.message ?? String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const onResetData = async () => {
    if (!confirm("Wirklich ALLE lokalen Daten (DB, Cache, Storage) löschen?"))
      return;
    setBusy(true);
    setStatus("Lösche Datenbank…");

    try {
      // Dexie DB löschen
      await db.delete();

      // SW-Caches (best effort)
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }

      // Local-/Session-Storage
      localStorage.clear();
      sessionStorage.clear();

      setStatus("Zurückgesetzt. Seite wird neu geladen…");
      setTimeout(() => location.reload(), 600);
    } catch (e: any) {
      console.error(e);
      setStatus(`Fehler beim Zurücksetzen: ${e?.message ?? String(e)}`);
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Einstellungen</h1>
      <p className="text-sm text-gray-500">
        Importiere historische Daten (JSON) oder setze die lokalen Daten zurück.
      </p>

      <Card title="JSON-Import (Persons & Entries)">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Erwartetes Format entspricht deinen Zod-Typen <code>Person</code>{" "}
            und <code>Entry</code>:
            <span className="ml-1 font-medium">persons[]</span> und{" "}
            <span className="font-medium">entries[]</span>.
          </p>
          <label className="block">
            <span className="text-sm text-gray-700">Datei auswählen</span>
            <input
              type="file"
              accept="application/json"
              className="mt-1 block w-full text-sm"
              onChange={(e) => onImportFile(e.currentTarget.files?.[0] ?? null)}
              disabled={busy}
            />
          </label>
          <div className="text-sm text-gray-700">{status}</div>
        </div>
      </Card>

      <Card title="Zurücksetzen">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            Löscht die lokale Datenbank (IndexedDB), Caches &amp; Storage.
            Danach Reload.
          </p>
          <button
            onClick={onResetData}
            disabled={busy}
            className="rounded-xl bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700 active:bg-red-800"
          >
            Daten zurücksetzen
          </button>
        </div>
      </Card>
    </div>
  );
}
