// Type definitions for sorting functionality
export type SortableValue = string | number | Date;

export interface SortConfig<T extends string> {
  key: T;
  direction: 'asc' | 'desc';
}

export type WorkSortKey = 'date' | 'createdAt' | 'value' | 'name';
export type ExpenseSortKey = 'date' | 'createdAt' | 'value' | 'name';

export type WorkSortConfig = SortConfig<WorkSortKey>;
export type ExpenseSortConfig = SortConfig<ExpenseSortKey>;

// Helper function for type-safe sorting
export function getSortableValue(
  key: WorkSortKey | ExpenseSortKey,
  entry: { date: string; createdAt: string },
  payload: { hours?: number; total?: number; personName?: string; buyer?: string }
): SortableValue {
  switch (key) {
    case 'date':
      return entry.date;
    case 'createdAt':
      return entry.createdAt;
    case 'value':
      return payload.hours || payload.total || 0;
    case 'name':
      return payload.personName || payload.buyer || '';
    default:
      return '';
  }
}