// src/hooks/useProjectProgress.ts
import { useMemo } from "react";
import type { ProjectProgressData } from "@/types/dashboard";

const PROJECT_START = new Date("2023-07-01");
const PROJECT_END = new Date("2025-12-18");

export function useProjectProgress(): ProjectProgressData {
  return useMemo(() => {
    const now = new Date();
    const totalDays = Math.ceil(
      (PROJECT_END.getTime() - PROJECT_START.getTime()) / (1000 * 60 * 60 * 24)
    );
    const elapsedDays = Math.ceil(
      (now.getTime() - PROJECT_START.getTime()) / (1000 * 60 * 60 * 24)
    );
    const remainingDays = Math.ceil(
      (PROJECT_END.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const progress = Math.max(
      0,
      Math.min(100, (elapsedDays / totalDays) * 100)
    );

    return {
      progress: Math.round(progress * 10) / 10,
      remainingDays: Math.max(0, remainingDays),
      totalDays,
      elapsedDays: Math.max(0, elapsedDays),
    };
  }, []);
}
