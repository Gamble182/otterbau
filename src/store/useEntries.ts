'use client';

import { create } from "zustand";
import { EntriesService } from "@/lib/supabase/entries";
import type { Entry } from "@/lib/schemas/zod";

type Filter = { type?: "work" | "expense" | "projectCost"; from?: string; to?: string };

type EntriesState = {
  items: Entry[];
  loaded: boolean;
  pendingActions: Map<string, 'add' | 'update' | 'delete'>;
  load: (filter?: Filter) => Promise<void>;
  add: (e: Omit<Entry, "id" | "createdAt" | "updatedAt">) => Promise<Entry>;
  bulkAdd: (entries: Omit<Entry, "id" | "createdAt" | "updatedAt">[]) => Promise<Entry[]>;
  update: (e: Entry) => Promise<void>;
  remove: (id: string) => Promise<void>;
  optimisticAdd: (e: Omit<Entry, "id" | "createdAt" | "updatedAt">) => Promise<Entry>;
  optimisticUpdate: (e: Entry) => Promise<void>;
  optimisticRemove: (id: string) => Promise<void>;
};

export const useEntries = create<EntriesState>()((set, get) => ({
  items: [],
  loaded: false,
  pendingActions: new Map(),

  load: async (filter) => {
    try {
      const rows = await EntriesService.load(filter);
      set({ items: rows, loaded: true });
    } catch (error) {
      console.error('Failed to load entries:', error);
      set({ items: [], loaded: true });
    }
  },

  add: async (e) => {
    try {
      const entry = await EntriesService.add(e);
      set({ items: [...get().items, entry] });
      return entry;
    } catch (error) {
      console.error('Failed to add entry:', error);
      throw error;
    }
  },

  bulkAdd: async (entries) => {
    try {
      const newEntries = await EntriesService.bulkAdd(entries);
      set({ items: [...get().items, ...newEntries] });
      return newEntries;
    } catch (error) {
      console.error('Failed to bulk add entries:', error);
      throw error;
    }
  },

  update: async (e) => {
    try {
      await EntriesService.update(e);
      set({ items: get().items.map(x => x.id === e.id ? e : x) });
    } catch (error) {
      console.error('Failed to update entry:', error);
      throw error;
    }
  },

  remove: async (id) => {
    try {
      await EntriesService.remove(id);
      set({ items: get().items.filter(x => x.id !== id) });
    } catch (error) {
      console.error('Failed to remove entry:', error);
      throw error;
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
