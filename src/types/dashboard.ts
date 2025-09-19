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
