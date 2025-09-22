// src/hooks/useEnhancedTimeFilter.ts
import { useMemo } from "react";

export interface EnhancedTimeFilterState {
  selectedOption: "gesamt" | "custom";
  fromMonth?: number;
  fromYear?: number;
  toMonth?: number;
  toYear?: number;
}

export interface TimeFilterRange {
  from: string;
  to: string;
}

export function useEnhancedTimeFilter(state: EnhancedTimeFilterState): {
  filterDates: TimeFilterRange;
  displayName: string;
  isFiltered: boolean;
} {
  return useMemo(() => {
    if (state.selectedOption === "gesamt") {
      // Gesamte Historie - sehr weiter Zeitraum
      return {
        filterDates: {
          from: "2020-01-01",
          to: "2030-12-31",
        },
        displayName: "Gesamte Historie",
        isFiltered: false,
      };
    }

    // Custom Zeitraum
    if (
      state.fromMonth !== undefined &&
      state.fromYear !== undefined &&
      state.toMonth !== undefined &&
      state.toYear !== undefined
    ) {
      // Erster Tag des Von-Monats
      const fromDate = new Date(state.fromYear, state.fromMonth, 1);
      const from = fromDate.toISOString().slice(0, 10);

      // Letzter Tag des Bis-Monats
      const toDate = new Date(state.toYear, state.toMonth + 1, 0);
      const to = toDate.toISOString().slice(0, 10);

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

      const fromText = `${monthNames[state.fromMonth]} ${state.fromYear}`;
      const toText = `${monthNames[state.toMonth]} ${state.toYear}`;

      let displayName: string;
      if (
        state.fromMonth === state.toMonth &&
        state.fromYear === state.toYear
      ) {
        displayName = fromText; // Nur ein Monat
      } else {
        displayName = `${fromText} - ${toText}`;
      }

      return {
        filterDates: { from, to },
        displayName,
        isFiltered: true,
      };
    }

    // Fallback wenn custom aber nicht vollständig konfiguriert
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    return {
      filterDates: { from, to },
      displayName: "Aktueller Monat",
      isFiltered: true,
    };
  }, [state]);
}
