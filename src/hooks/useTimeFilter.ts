// src/hooks/useTimeFilter.ts
import { useMemo } from "react";
import type { TimeFilterType, TimeFilterRange } from "@/types/dashboard";

export function useTimeFilter(timeFilter: TimeFilterType): TimeFilterRange {
  return useMemo(() => {
    const now = new Date();
    let from: string, to: string;

    if (timeFilter === "month") {
      from = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .slice(0, 10);
    } else {
      from = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
      to = new Date(now.getFullYear(), 11, 31).toISOString().slice(0, 10);
    }

    return { from, to };
  }, [timeFilter]);
}
