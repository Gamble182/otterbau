'use client';

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
};

export const usePersons = create<PersonsState>()((set, get) => ({
  items: [],
  loaded: false,

  load: async () => {
    const rows = await db.persons.orderBy("name").toArray();
    set({ items: rows, loaded: true });
  },

  add: async (name) => {
    const person: Person = { id: uuid(), name, createdAt: isoNow() };
    await db.persons.add(person);
    set({ items: [...get().items, person] });
    return person;
  },

  rename: async (id, name) => {
    await db.persons.update(id, { name });
    set({ items: get().items.map(p => p.id === id ? { ...p, name } : p) });
  },

  remove: async (id) => {
    await db.persons.delete(id);
    set({ items: get().items.filter(p => p.id !== id) });
  },
}));
