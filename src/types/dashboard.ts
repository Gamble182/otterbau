// src/types/dashboard.ts
export type TimeFilterType = "month" | "year";

export interface TimeFilterRange {
  from: string;
  to: string;
}

export interface DashboardStats {
  totalHours: number;
  totalExpenses: number;
  workEntries: number;
  expenseEntries: number;
}

export interface ProjectProgressData {
  progress: number;
  remainingDays: number;
  totalDays: number;
  elapsedDays: number;
}

export interface QuickAddButtonsProps {
  onWorkClick: () => void;
  onExpenseClick: () => void;
}

export interface TimeFilterProps {
  timeFilter: TimeFilterType;
  onTimeFilterChange: (filter: TimeFilterType) => void;
}

export interface DashboardStatsProps {
  stats: DashboardStats;
  timeFilter: TimeFilterType;
}

// Neue erweiterte Filter-Interfaces
export interface MonthYearFilter {
  month: number; // 0-11 (JavaScript Monate)
  year: number;
}

export interface EnhancedTimeFilterProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export interface EnhancedDashboardStatsProps {
  stats: DashboardStats;
  selectedMonth: number;
  selectedYear: number;
}
