// src/hooks/useDashboardStats.ts
import { useMemo } from "react";
import { useEntries } from "@/store/useEntries";
import type { WorkPayload, ExpensePayload } from "@/lib/schemas/zod";
import type { DashboardStats, TimeFilterRange } from "@/types/dashboard";

export function useDashboardStats(
  filterDates: TimeFilterRange
): DashboardStats {
  const allEntries = useEntries((s) => s.items);

  return useMemo(() => {
    const { from, to } = filterDates;

    let totalHours = 0;
    let totalExpenses = 0;
    let workEntries = 0;
    let expenseEntries = 0;

    for (const e of allEntries) {
      // Prüfe ob das Entry im gewählten Zeitraum liegt
      if (e.date >= from && e.date <= to) {
        if (e.type === "work") {
          const payload = e.payload as WorkPayload;
          const hours = Number(payload.hours ?? 0);
          totalHours += hours;
          workEntries++;
        } else if (e.type === "expense") {
          const payload = e.payload as ExpensePayload;
          const amount = Number(payload.total ?? 0);
          totalExpenses += amount;
          expenseEntries++;
        }
      }
    }

    return {
      totalHours,
      totalExpenses,
      workEntries,
      expenseEntries,
    };
  }, [allEntries, filterDates.from, filterDates.to]);
}
