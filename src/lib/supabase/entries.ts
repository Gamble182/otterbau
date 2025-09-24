// src/lib/supabase/entries.ts - Enhanced version
import { supabase, handleSupabaseError } from "./client";
import type { Entry } from "@/lib/schemas/zod";

export class EntriesService {
  // Load entries with optional filtering
  static async load(filter?: {
    type?: "work" | "expense" | "projectCost";
    from?: string;
    to?: string;
  }): Promise<Entry[]> {
    try {
      let query = supabase
        .from("entries")
        .select("*")
        .order("date", { ascending: true });

      // Apply filters
      if (filter?.type) {
        query = query.eq("type", filter.type);
      }

      if (filter?.from) {
        query = query.gte("date", filter.from);
      }

      if (filter?.to) {
        query = query.lte("date", filter.to);
      }

      const { data, error } = await query;

      if (error) {
        handleSupabaseError(error, "load entries");
      }

      // Transform to match our Entry type
      return (data || []).map((row: any) => ({
        id: row.id,
        type: row.type,
        date: row.date,
        tags: row.tags || [],
        payload: row.payload as any,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      handleSupabaseError(error, "load entries");
      return [];
    }
  }

  // Add new entry
  static async add(
    entry: Omit<Entry, "id" | "createdAt" | "updatedAt">
  ): Promise<Entry> {
    try {
      const { data, error } = await supabase
        .from("entries")
        .insert({
          type: entry.type,
          date: entry.date,
          tags: entry.tags,
          payload: entry.payload as any,
        })
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, "add entry");
      }

      return {
        id: data!.id,
        type: data!.type,
        date: data!.date,
        tags: data!.tags || [],
        payload: data!.payload as any,
        createdAt: data!.created_at,
        updatedAt: data!.updated_at,
      };
    } catch (error) {
      handleSupabaseError(error, "add entry");
      throw error;
    }
  }

  // Enhanced bulk add with better error handling and progress tracking
  static async bulkAdd(
    entries: Omit<Entry, "id" | "createdAt" | "updatedAt">[],
    options: {
      batchSize?: number;
      onProgress?: (completed: number, total: number) => void;
      skipDuplicates?: boolean;
    } = {}
  ): Promise<Entry[]> {
    const { batchSize = 100, onProgress, skipDuplicates = true } = options;

    if (entries.length === 0) return [];

    try {
      const results: Entry[] = [];

      // Process in batches for large imports
      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);

        const insertData = batch.map((entry) => ({
          type: entry.type,
          date: entry.date,
          tags: entry.tags,
          payload: entry.payload as any,
        }));

        const { data, error } = await supabase
          .from("entries")
          .insert(insertData)
          .select();

        if (error) {
          if (skipDuplicates && error.message.includes("duplicate")) {
            console.warn(
              `Skipping duplicate entries in batch ${i / batchSize + 1}`
            );
            continue;
          }
          handleSupabaseError(
            error,
            `bulk add entries batch ${i / batchSize + 1}`
          );
        }

        const batchResults = (data || []).map((row: any) => ({
          id: row.id,
          type: row.type,
          date: row.date,
          tags: row.tags || [],
          payload: row.payload as any,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));

        results.push(...batchResults);

        // Report progress
        onProgress?.(Math.min(i + batchSize, entries.length), entries.length);
      }

      return results;
    } catch (error) {
      handleSupabaseError(error, "bulk add entries");
      throw error;
    }
  }

  // Update existing entry
  static async update(entry: Entry): Promise<void> {
    try {
      const { error } = await supabase
        .from("entries")
        .update({
          type: entry.type,
          date: entry.date,
          tags: entry.tags,
          payload: entry.payload as any,
        })
        .eq("id", entry.id);

      if (error) {
        handleSupabaseError(error, "update entry");
      }
    } catch (error) {
      handleSupabaseError(error, "update entry");
      throw error;
    }
  }

  // Delete entry
  static async remove(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("entries").delete().eq("id", id);

      if (error) {
        handleSupabaseError(error, "delete entry");
      }
    } catch (error) {
      handleSupabaseError(error, "delete entry");
      throw error;
    }
  }

  // Get statistics for dashboard
  static async getStats(filter?: { from?: string; to?: string }): Promise<{
    totalEntries: number;
    workEntries: number;
    expenseEntries: number;
    totalHours: number;
    totalExpenses: number;
    categoriesBreakdown: Array<{
      category: string;
      count: number;
      total: number;
    }>;
  }> {
    try {
      let query = supabase.from("entries").select("type, payload, tags");

      if (filter?.from) {
        query = query.gte("date", filter.from);
      }

      if (filter?.to) {
        query = query.lte("date", filter.to);
      }

      const { data, error } = await query;

      if (error) {
        handleSupabaseError(error, "get stats");
      }

      const stats = {
        totalEntries: data?.length || 0,
        workEntries: 0,
        expenseEntries: 0,
        totalHours: 0,
        totalExpenses: 0,
        categoriesBreakdown: [] as Array<{
          category: string;
          count: number;
          total: number;
        }>,
      };

      const categoryMap = new Map<string, { count: number; total: number }>();

      data?.forEach((entry: any) => {
        if (entry.type === "work") {
          stats.workEntries++;
          stats.totalHours += entry.payload?.hours || 0;
        } else if (entry.type === "expense") {
          stats.expenseEntries++;
          const total = entry.payload?.total || 0;
          stats.totalExpenses += total;

          const category = entry.payload?.category || "Unbekannt";
          const current = categoryMap.get(category) || { count: 0, total: 0 };
          categoryMap.set(category, {
            count: current.count + 1,
            total: current.total + total,
          });
        }
      });

      stats.categoriesBreakdown = Array.from(categoryMap.entries())
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.total - a.total);

      return stats;
    } catch (error) {
      handleSupabaseError(error, "get stats");
      throw error;
    }
  }

  // Check for potential duplicates before import
  static async checkDuplicates(
    entries: Omit<Entry, "id" | "createdAt" | "updatedAt">[]
  ): Promise<{
    duplicates: Array<{ entry: (typeof entries)[0]; reason: string }>;
    safe: typeof entries;
  }> {
    try {
      // Get existing entries from the same date range
      const dateRange = entries.map((e) => e.date);
      const minDate = Math.min(...dateRange.map((d) => new Date(d).getTime()));
      const maxDate = Math.max(...dateRange.map((d) => new Date(d).getTime()));

      const { data: existing } = await supabase
        .from("entries")
        .select("type, date, payload")
        .gte("date", new Date(minDate).toISOString().split("T")[0])
        .lte("date", new Date(maxDate).toISOString().split("T")[0]);

      const duplicates: Array<{ entry: (typeof entries)[0]; reason: string }> =
        [];
      const safe: typeof entries = [];

      entries.forEach((entry) => {
        const isDuplicate = existing?.some((existingEntry: any) => {
          if (
            existingEntry.type !== entry.type ||
            existingEntry.date !== entry.date
          ) {
            return false;
          }

          // Check payload similarity
          if (entry.type === "work") {
            return (
              existingEntry.payload?.personName ===
                (entry.payload as any)?.personName &&
              existingEntry.payload?.hours === (entry.payload as any)?.hours
            );
          } else if (entry.type === "expense") {
            return (
              existingEntry.payload?.position ===
                (entry.payload as any)?.position &&
              existingEntry.payload?.total === (entry.payload as any)?.total &&
              existingEntry.payload?.buyer === (entry.payload as any)?.buyer
            );
          }

          return false;
        });

        if (isDuplicate) {
          duplicates.push({
            entry,
            reason: `Ähnlicher ${entry.type} Eintrag vom ${entry.date} bereits vorhanden`,
          });
        } else {
          safe.push(entry);
        }
      });

      return { duplicates, safe };
    } catch (error) {
      console.warn("Duplikate-Check fehlgeschlagen:", error);
      // Bei Fehler alle als sicher markieren
      return { duplicates: [], safe: entries };
    }
  }

  // Clear all entries (for reset functionality)
  static async clear(): Promise<void> {
    try {
      const { error } = await supabase
        .from("entries")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (error) {
        handleSupabaseError(error, "clear entries");
      }
    } catch (error) {
      handleSupabaseError(error, "clear entries");
      throw error;
    }
  }
}
