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
      if (e.date >= from && e.date <= to) {
        if (e.type === "work") {
          const payload = e.payload as WorkPayload;
          const h = Number(payload.hours ?? 0);
          totalHours += h;
          workEntries++;
        } else if (e.type === "expense") {
          const payload = e.payload as ExpensePayload;
          const v = Number(payload.total ?? 0);
          totalExpenses += v;
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
  }, [allEntries, filterDates]);
}
