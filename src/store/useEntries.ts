// src/store/useEntries.ts - Enhanced version
"use client";

import { create } from "zustand";
import { EntriesService } from "@/lib/supabase/entries";
import type { Entry } from "@/lib/schemas/zod";

type Filter = {
  type?: "work" | "expense" | "projectCost";
  from?: string;
  to?: string;
};

interface BulkAddOptions {
  batchSize?: number;
  onProgress?: (completed: number, total: number) => void;
  skipDuplicates?: boolean;
}

type EntriesState = {
  items: Entry[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  pendingActions: Map<string, "add" | "update" | "delete">;

  // Actions
  load: (filter?: Filter) => Promise<void>;
  add: (e: Omit<Entry, "id" | "createdAt" | "updatedAt">) => Promise<Entry>;
  bulkAdd: (
    entries: Omit<Entry, "id" | "createdAt" | "updatedAt">[],
    options?: BulkAddOptions
  ) => Promise<Entry[]>;
  update: (e: Entry) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  clearError: () => void;

  // Enhanced methods
  getStats: (filter?: { from?: string; to?: string }) => Promise<any>;
  checkDuplicates: (
    entries: Omit<Entry, "id" | "createdAt" | "updatedAt">[]
  ) => Promise<any>;

  // Optimistic updates
  optimisticAdd: (
    e: Omit<Entry, "id" | "createdAt" | "updatedAt">
  ) => Promise<Entry>;
  optimisticUpdate: (e: Entry) => Promise<void>;
  optimisticRemove: (id: string) => Promise<void>;
};

export const useEntries = create<EntriesState>()((set, get) => ({
  items: [],
  loaded: false,
  loading: false,
  error: null,
  pendingActions: new Map(),

  clearError: () => set({ error: null }),

  load: async (filter) => {
    set({ loading: true, error: null });

    try {
      const rows = await EntriesService.load(filter);
      set({
        items: rows,
        loaded: true,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to load entries:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Fehler beim Laden der Einträge",
        items: [],
        loaded: true,
        loading: false,
      });
    }
  },

  add: async (e) => {
    set({ loading: true, error: null });

    try {
      const entry = await EntriesService.add(e);
      set({
        items: [...get().items, entry],
        loading: false,
      });
      return entry;
    } catch (error) {
      console.error("Failed to add entry:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Fehler beim Hinzufügen des Eintrags",
        loading: false,
      });
      throw error;
    }
  },

  bulkAdd: async (entries, options = {}) => {
    if (entries.length === 0) return [];

    set({ loading: true, error: null });

    try {
      const newEntries = await EntriesService.bulkAdd(entries, options);

      // Merge with existing items and sort by date
      const allEntries = [...get().items, ...newEntries].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      set({
        items: allEntries,
        loading: false,
      });

      return newEntries;
    } catch (error) {
      console.error("Failed to bulk add entries:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Fehler beim Bulk-Import der Einträge",
        loading: false,
      });
      throw error;
    }
  },

  update: async (e) => {
    set({ loading: true, error: null });

    try {
      await EntriesService.update(e);
      set({
        items: get().items.map((x) => (x.id === e.id ? e : x)),
        loading: false,
      });
    } catch (error) {
      console.error("Failed to update entry:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Fehler beim Aktualisieren des Eintrags",
        loading: false,
      });
      throw error;
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });

    try {
      await EntriesService.remove(id);
      set({
        items: get().items.filter((x) => x.id !== id),
        loading: false,
      });
    } catch (error) {
      console.error("Failed to remove entry:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Fehler beim Löschen des Eintrags",
        loading: false,
      });
      throw error;
    }
  },

  clear: async () => {
    set({ loading: true, error: null });

    try {
      await EntriesService.clear();
      set({
        items: [],
        loading: false,
      });
    } catch (error) {
      console.error("Failed to clear entries:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Fehler beim Zurücksetzen der Einträge",
        loading: false,
      });
      throw error;
    }
  },

  getStats: async (filter) => {
    try {
      return await EntriesService.getStats(filter);
    } catch (error) {
      console.error("Failed to get stats:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Fehler beim Laden der Statistiken",
      });
      throw error;
    }
  },

  checkDuplicates: async (entries) => {
    try {
      return await EntriesService.checkDuplicates(entries);
    } catch (error) {
      console.error("Failed to check duplicates:", error);
      // Bei Fehler alle als sicher markieren
      return { duplicates: [], safe: entries };
    }
  },

  // Optimistic update methods (simplified for Supabase)
  optimisticAdd: async (e) => {
    return await get().add(e);
  },

  optimisticUpdate: async (e) => {
    return await get().update(e);
  },

  optimisticRemove: async (id) => {
    return await get().remove(id);
  },
}));
