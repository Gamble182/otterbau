import Dexie, { type Table } from "dexie";
import type { Entry, Person, Settings } from "@/lib/schemas/zod";

class OtterbauDB extends Dexie {
  persons!: Table<Person, string>;
  entries!: Table<Entry, string>;
  settings!: Table<Settings, number>; // single-row mit auto-id
  constructor() {
    super("otterbau-db");

    // v1 – Grundschema
    this.version(1).stores({
      persons: "id, name, createdAt",
      entries: "id, type, date, updatedAt",
      settings: "++id"
    });
  }
}

export const db = new OtterbauDB();
