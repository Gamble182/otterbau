// src/hooks/useMonthYearFilter.ts
import { useMemo } from "react";
import type { TimeFilterRange, MonthYearFilter } from "@/types/dashboard";

export function useMonthYearFilter(filter: MonthYearFilter): TimeFilterRange {
  return useMemo(() => {
    const { month, year } = filter;

    // Erster Tag des Monats
    const fromDate = new Date(year, month, 1);
    const from = fromDate.toISOString().slice(0, 10);

    // Letzter Tag des Monats
    const toDate = new Date(year, month + 1, 0);
    const to = toDate.toISOString().slice(0, 10);

    return { from, to };
  }, [filter.month, filter.year]);
}

// Hook für Dashboard-Statistiken mit Monats-/Jahresfilter
export function useMonthYearStats(month: number, year: number) {
  const filterDates = useMonthYearFilter({ month, year });

  return useMemo(() => {
    return {
      filterDates,
      displayName: getMonthYearDisplayName(month, year),
      isCurrentMonth: isCurrentMonth(month, year),
    };
  }, [filterDates, month, year]);
}

// Helper functions
function getMonthYearDisplayName(month: number, year: number): string {
  const monthNames = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];

  return `${monthNames[month]} ${year}`;
}

function isCurrentMonth(month: number, year: number): boolean {
  const now = new Date();
  return month === now.getMonth() && year === now.getFullYear();
}
