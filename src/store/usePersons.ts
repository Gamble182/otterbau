"use client";

import { create } from "zustand";
import { db } from "@/lib/db/dexie";
import type { Person } from "@/lib/schemas/zod";
import { isoNow } from "@/lib/utils";
import { v4 as uuid } from "uuid";

type PersonsState = {
  items: Person[];
  loaded: boolean;
  load: () => Promise<void>;
  add: (name: string) => Promise<Person>;
  rename: (id: string, name: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  createDefaults: () => Promise<void>;
};

// Default-Personen die beim ersten Start erstellt werden
const DEFAULT_PERSONS = ["Yannik", "Max", "Anna", "Team"];

export const usePersons = create<PersonsState>()((set, get) => ({
  items: [],
  loaded: false,

  load: async () => {
    try {
      const rows = await db.persons.orderBy("name").toArray();

      // Falls keine Personen vorhanden sind, erstelle Default-Personen
      if (rows.length === 0) {
        console.log("Keine Personen gefunden, erstelle Default-Personen...");
        await get().createDefaults();
        // Nach dem Erstellen der Defaults nochmal laden
        const newRows = await db.persons.orderBy("name").toArray();
        set({ items: newRows, loaded: true });
      } else {
        set({ items: rows, loaded: true });
      }
    } catch (error) {
      console.error("Fehler beim Laden der Personen:", error);
      set({ items: [], loaded: true });
    }
  },

  createDefaults: async () => {
    try {
      const defaultPersons: Person[] = DEFAULT_PERSONS.map((name) => ({
        id: uuid(),
        name,
        createdAt: isoNow(),
      }));

      await db.persons.bulkAdd(defaultPersons);
      console.log(
        `${defaultPersons.length} Default-Personen erstellt:`,
        DEFAULT_PERSONS
      );
    } catch (error) {
      console.error("Fehler beim Erstellen der Default-Personen:", error);
    }
  },

  add: async (name) => {
    try {
      // Prüfe ob Person bereits existiert
      const existing = get().items.find(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      );
      if (existing) {
        throw new Error(`Person "${name}" existiert bereits`);
      }

      const person: Person = {
        id: uuid(),
        name: name.trim(),
        createdAt: isoNow(),
      };

      await db.persons.add(person);

      // Sortiert einfügen
      const currentItems = get().items;
      const newItems = [...currentItems, person].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      set({ items: newItems });

      return person;
    } catch (error) {
      console.error("Fehler beim Hinzufügen der Person:", error);
      throw error;
    }
  },

  rename: async (id, name) => {
    try {
      const trimmedName = name.trim();
      if (!trimmedName) {
        throw new Error("Name darf nicht leer sein");
      }

      // Prüfe ob Name bereits existiert (außer bei der aktuellen Person)
      const existing = get().items.find(
        (p) => p.id !== id && p.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (existing) {
        throw new Error(`Person "${trimmedName}" existiert bereits`);
      }

      await db.persons.update(id, { name: trimmedName });

      // Sortiert aktualisieren
      const newItems = get()
        .items.map((p) => (p.id === id ? { ...p, name: trimmedName } : p))
        .sort((a, b) => a.name.localeCompare(b.name));

      set({ items: newItems });
    } catch (error) {
      console.error("Fehler beim Umbenennen der Person:", error);
      throw error;
    }
  },

  remove: async (id) => {
    try {
      // Warnung wenn Person noch in Einträgen verwendet wird
      const entries = await db.entries.where("type").equals("work").toArray();
      const hasEntries = entries.some((entry) => {
        const payload = entry.payload as { personId?: string };
        return payload.personId === id;
      });

      if (hasEntries) {
        const confirmed = confirm(
          "Diese Person hat bereits Arbeitszeit-Einträge. Wirklich löschen? " +
            "Die Einträge bleiben erhalten, aber die Person-Verknüpfung geht verloren."
        );
        if (!confirmed) return;
      }

      await db.persons.delete(id);
      set({ items: get().items.filter((p) => p.id !== id) });
    } catch (error) {
      console.error("Fehler beim Löschen der Person:", error);
      throw error;
    }
  },
}));
