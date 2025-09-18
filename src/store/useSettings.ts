'use client';

import { create } from "zustand";
import { db } from "@/lib/db/dexie";
import type { Settings } from "@/lib/schemas/zod";

type SettingsState = {
  value: Settings | null;
  loaded: boolean;
  load: () => Promise<void>;
  set: (patch: Partial<Settings>) => Promise<void>;
};

export const useSettings = create<SettingsState>()((set, get) => ({
  value: null,
  loaded: false,

  load: async () => {
    const all = await db.settings.toArray();
    const s = all[0] ?? { defaultCurrency: "EUR", weekStart: 1, exportFormat: "csv", backupPolicy: "manual" } as Settings;
    if (!all[0]) await db.settings.add(s as any);
    set({ value: s, loaded: true });
  },

  set: async (patch) => {
    const curr = get().value ?? { defaultCurrency: "EUR", weekStart: 1, exportFormat: "csv", backupPolicy: "manual" } as Settings;
    const next = { ...curr, ...patch };
    const rows = await db.settings.toArray();
    if (rows[0]) {
      await db.settings.update(rows[0] as any, next as any);
    } else {
      await db.settings.add(next as any);
    }
    set({ value: next });
  },
}));
