import { z } from "zod";

export const EntryType = z.enum(["work", "expense", "projectCost"]);

export const PersonSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  createdAt: z.string(),
});
export type Person = z.infer<typeof PersonSchema>;

// --- Payloads ---
export const WorkPayload = z.object({
  personId: z.string().uuid(),
  personName: z.string(),
  hours: z.number().nonnegative(),
  project: z.string().optional(),
  note: z.string().optional(),
});
export type WorkPayload = z.infer<typeof WorkPayload>;

// ERWEITERTE ExpensePayload mit allen benötigten Feldern
export const ExpensePayload = z.object({
  position: z.string(), // Position ✅
  manufacturer: z.string().optional(), // Hersteller ✅
  category: z.string(), // Kategorie ✅
  type: z.string().optional(), // Art (neu im UI)
  extra: z.string().optional(), // Zusatz (neu im UI)
  apartment: z.string().optional(), // Wohnung (komplett neu)
  buyer: z.string(), // Käufer ✅
  qty: z.number().positive().default(1), // Menge ✅
  unitPrice: z.number().nonnegative(), // Preis pro Stück ✅
  total: z.number().nonnegative(), // Summe ✅
  currency: z.string().length(3).default("EUR"),
  note: z.string().optional(),
});
export type ExpensePayload = z.infer<typeof ExpensePayload>;

export const ProjectCostPayload = z.object({
  position: z.string(),
  category: z.string(),
  note: z.string().optional(),
  amount: z.number().nonnegative(),
  paidDate: z.string().optional(), // ISO
});
export type ProjectCostPayload = z.infer<typeof ProjectCostPayload>;

// --- Entry ---
export const EntrySchema = z.object({
  id: z.string().uuid(),
  type: EntryType,
  date: z.string(), // ISO yyyy-mm-dd
  tags: z.array(z.string()).default([]),
  payload: z.union([
    WorkPayload,
    ExpensePayload,
    ProjectCostPayload,
    z.record(z.string(), z.unknown()), // future-proof
  ]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Entry = z.infer<typeof EntrySchema>;

export const SettingsSchema = z.object({
  defaultCurrency: z.string().length(3).default("EUR"),
  weekStart: z.number().min(0).max(6).default(1),
  exportFormat: z.enum(["csv", "json"]).default("csv"),
  backupPolicy: z.enum(["manual", "on-online", "daily"]).default("manual"),
});
export type Settings = z.infer<typeof SettingsSchema>;
