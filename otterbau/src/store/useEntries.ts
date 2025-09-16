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
  load: (filter?: Filter) => Promise<void>;
  add: (e: Omit<Entry, "id" | "createdAt" | "updatedAt">) => Promise<Entry>;
  update: (e: Entry) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useEntries = create<EntriesState>()((set, get) => ({
  items: [],
  loaded: false,

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
}));
