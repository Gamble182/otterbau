"use client";

import { memo } from 'react';

interface OptimisticUpdatesIndicatorProps {
  isPending: boolean;
  pendingCount: number;
  className?: string;
}

export const OptimisticUpdatesIndicator = memo(function OptimisticUpdatesIndicator({
  isPending,
  pendingCount,
  className = '',
}: OptimisticUpdatesIndicatorProps) {
  if (!isPending) return null;

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
      <span className="text-[var(--text-secondary)]">
        {pendingCount === 1
          ? 'Änderung wird gespeichert...'
          : `${pendingCount} Änderungen werden gespeichert...`}
      </span>
    </div>
  );
});

interface OptimisticItemProps {
  isPending?: boolean;
  hasError?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const OptimisticItem = memo(function OptimisticItem({
  isPending,
  hasError,
  children,
  className = '',
}: OptimisticItemProps) {
  const baseClass = `transition-all duration-200 ${className}`;

  if (hasError) {
    return (
      <div className={`${baseClass} opacity-50 bg-[var(--coral-red)]/10 border border-[var(--coral-red)]/20 rounded-lg`}>
        {children}
        <div className="mt-2 text-xs text-[var(--coral-red)] flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Fehler beim Speichern
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className={`${baseClass} opacity-70 bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20 rounded-lg`}>
        {children}
        <div className="mt-2 text-xs text-[var(--accent-primary)] flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[var(--accent-primary)] animate-pulse" />
          Wird gespeichert...
        </div>
      </div>
    );
  }

  return <div className={baseClass}>{children}</div>;
});

// Loading skeleton for optimistic updates
export const OptimisticSkeleton = memo(function OptimisticSkeleton({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-3">
        <div className="h-4 bg-[var(--bg-tertiary)] rounded w-3/4"></div>
        <div className="h-3 bg-[var(--bg-tertiary)] rounded w-1/2"></div>
        <div className="h-3 bg-[var(--bg-tertiary)] rounded w-2/3"></div>
      </div>
    </div>
  );
});

// Success feedback component
export const OptimisticSuccess = memo(function OptimisticSuccess({
  message = 'Gespeichert!',
  duration = 2000,
  onComplete,
}: {
  message?: string;
  duration?: number;
  onComplete?: () => void;
}) {
  // Auto-hide after duration
  if (duration > 0) {
    setTimeout(() => {
      onComplete?.();
    }, duration);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-[var(--accent-primary)] text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
});