// src/store/usePersons.ts
"use client";

import { create } from "zustand";
import { PersonsService } from "@/lib/supabase/persons";
import type { Person } from "@/lib/schemas/zod";

type PersonsState = {
  items: Person[];
  loaded: boolean;
  loading: boolean;
  error: string | null;

  load: () => Promise<void>;
  add: (name: string) => Promise<Person>;
  rename: (id: string, name: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  createDefaults: () => Promise<void>;
  bulkAdd: (persons: Omit<Person, "id" | "createdAt">[]) => Promise<Person[]>;
  clear: () => Promise<void>;
  clearError: () => void;
};

export const usePersons = create<PersonsState>()((set, get) => ({
  items: [],
  loaded: false,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  load: async () => {
    set({ loading: true, error: null });

    try {
      const rows = await PersonsService.load();

      // Falls keine Personen vorhanden sind, erstelle Default-Personen
      if (rows.length === 0) {
        console.log("Keine Personen gefunden, erstelle Default-Personen...");
        await get().createDefaults();
        // Nach dem Erstellen der Defaults nochmal laden
        const newRows = await PersonsService.load();
        set({ items: newRows, loaded: true, loading: false });
      } else {
        set({ items: rows, loaded: true, loading: false });
      }
    } catch (error) {
      console.error("Fehler beim Laden der Personen:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Fehler beim Laden der Personen",
        items: [],
        loaded: true,
        loading: false,
      });
    }
  },

  createDefaults: async () => {
    set({ error: null });

    try {
      const defaultPersons = await PersonsService.createDefaults();
      console.log(`${defaultPersons.length} Default-Personen erstellt`);
    } catch (error) {
      console.error("Fehler beim Erstellen der Default-Personen:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Fehler beim Erstellen der Default-Personen",
      });
    }
  },

  add: async (name) => {
    set({ loading: true, error: null });

    try {
      const person = await PersonsService.add(name);

      // Sortiert einfügen
      const currentItems = get().items;
      const newItems = [...currentItems, person].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      set({
        items: newItems,
        loading: false,
      });

      return person;
    } catch (error) {
      console.error("Fehler beim Hinzufügen der Person:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Fehler beim Hinzufügen der Person",
        loading: false,
      });
      throw error;
    }
  },

  rename: async (id, name) => {
    set({ loading: true, error: null });

    try {
      await PersonsService.rename(id, name);

      // Sortiert aktualisieren
      const newItems = get()
        .items.map((p) => (p.id === id ? { ...p, name: name.trim() } : p))
        .sort((a, b) => a.name.localeCompare(b.name));

      set({
        items: newItems,
        loading: false,
      });
    } catch (error) {
      console.error("Fehler beim Umbenennen der Person:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Fehler beim Umbenennen der Person",
        loading: false,
      });
      throw error;
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });

    try {
      await PersonsService.remove(id);
      set({
        items: get().items.filter((p) => p.id !== id),
        loading: false,
      });
    } catch (error) {
      console.error("Fehler beim Löschen der Person:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Fehler beim Löschen der Person",
        loading: false,
      });
      throw error;
    }
  },

  // Bulk operations for migration
  bulkAdd: async (persons) => {
    set({ loading: true, error: null });

    try {
      const savedPersons = await PersonsService.bulkAdd(persons);

      // Merge with existing and sort
      const allPersons = [...get().items, ...savedPersons].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      set({
        items: allPersons,
        loading: false,
      });

      return savedPersons;
    } catch (error) {
      console.error("Fehler beim Bulk-Import der Personen:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Fehler beim Bulk-Import der Personen",
        loading: false,
      });
      throw error;
    }
  },

  clear: async () => {
    set({ loading: true, error: null });

    try {
      await PersonsService.clear();
      set({
        items: [],
        loading: false,
      });
    } catch (error) {
      console.error("Fehler beim Zurücksetzen der Personen:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Fehler beim Zurücksetzen der Personen",
        loading: false,
      });
      throw error;
    }
  },
}));
