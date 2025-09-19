'use client';

import { create } from "zustand";
import { db } from "@/lib/db/dexie";
import type { Entry } from "@/lib/schemas/zod";
import { isoNow } from "@/lib/utils";
import { v4 as uuid } from "uuid";

type Filter = { type?: "work" | "expense" | "projectCost"; from?: string; to?: string };

type EntriesState = {
  items: Entry[];
  loaded: boolean;
  pendingActions: Map<string, 'add' | 'update' | 'delete'>;
  load: (filter?: Filter) => Promise<void>;
  add: (e: Omit<Entry, "id" | "createdAt" | "updatedAt">) => Promise<Entry>;
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

  // ✅ Fix: keine .toCollection() auf einer Collection
  load: async (filter) => {
    let rows: Entry[];

    if (filter?.type) {
      // per Index 'type' filtern und nach 'date' sortieren
      rows = await db.entries.where("type").equals(filter.type).sortBy("date");
    } else {
      // schneller: direkt nach 'date' indexiert sortieren
      rows = await db.entries.orderBy("date").toArray();
    }

    if (filter?.from) rows = rows.filter(r => r.date >= filter.from!);
    if (filter?.to) rows = rows.filter(r => r.date <= filter.to!);

    set({ items: rows, loaded: true });
  },

  add: async (e) => {
    const now = isoNow();
    const entry: Entry = { id: uuid(), createdAt: now, updatedAt: now, ...e };
    await db.entries.add(entry);
    set({ items: [...get().items, entry] });
    return entry;
  },

  update: async (e) => {
    const updated = { ...e, updatedAt: isoNow() };
    await db.entries.put(updated);
    set({ items: get().items.map(x => x.id === e.id ? updated : x) });
  },

  remove: async (id) => {
    await db.entries.delete(id);
    set({ items: get().items.filter(x => x.id !== id) });
  },

  // Optimistic update methods
  optimisticAdd: async (e) => {
    const now = isoNow();
    const entry: Entry = { id: uuid(), createdAt: now, updatedAt: now, ...e };

    // Add optimistically
    const currentPending = get().pendingActions;
    const newPending = new Map(currentPending);
    newPending.set(entry.id, 'add');

    set({
      items: [...get().items, entry],
      pendingActions: newPending
    });

    try {
      await db.entries.add(entry);
      // Remove from pending on success
      const updatedPending = new Map(get().pendingActions);
      updatedPending.delete(entry.id);
      set({ pendingActions: updatedPending });
      return entry;
    } catch (error) {
      // Revert on error
      const revertedItems = get().items.filter(x => x.id !== entry.id);
      const revertedPending = new Map(get().pendingActions);
      revertedPending.delete(entry.id);
      set({
        items: revertedItems,
        pendingActions: revertedPending
      });
      throw error;
    }
  },

  optimisticUpdate: async (e) => {
    const updated = { ...e, updatedAt: isoNow() };
    const originalItem = get().items.find(x => x.id === e.id);

    // Update optimistically
    const currentPending = get().pendingActions;
    const newPending = new Map(currentPending);
    newPending.set(e.id, 'update');

    set({
      items: get().items.map(x => x.id === e.id ? updated : x),
      pendingActions: newPending
    });

    try {
      await db.entries.put(updated);
      // Remove from pending on success
      const updatedPending = new Map(get().pendingActions);
      updatedPending.delete(e.id);
      set({ pendingActions: updatedPending });
    } catch (error) {
      // Revert on error
      if (originalItem) {
        const revertedItems = get().items.map(x => x.id === e.id ? originalItem : x);
        const revertedPending = new Map(get().pendingActions);
        revertedPending.delete(e.id);
        set({
          items: revertedItems,
          pendingActions: revertedPending
        });
      }
      throw error;
    }
  },

  optimisticRemove: async (id) => {
    const originalItem = get().items.find(x => x.id === id);

    // Remove optimistically
    const currentPending = get().pendingActions;
    const newPending = new Map(currentPending);
    newPending.set(id, 'delete');

    set({
      items: get().items.filter(x => x.id !== id),
      pendingActions: newPending
    });

    try {
      await db.entries.delete(id);
      // Remove from pending on success
      const updatedPending = new Map(get().pendingActions);
      updatedPending.delete(id);
      set({ pendingActions: updatedPending });
    } catch (error) {
      // Revert on error
      if (originalItem) {
        const revertedItems = [...get().items, originalItem];
        const revertedPending = new Map(get().pendingActions);
        revertedPending.delete(id);
        set({
          items: revertedItems,
          pendingActions: revertedPending
        });
      }
      throw error;
    }
  },
}));
