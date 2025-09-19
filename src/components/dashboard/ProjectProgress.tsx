"use client";

import { Card } from "@/components/ui/Card";
import { useProjectProgress } from "@/hooks/useProjectProgress";

export default function ProjectProgress() {
  const projectProgress = useProjectProgress();

  return (
    <Card variant="glass">
      <div className="space-y-6 px-2 sm:px-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--burgundy)] to-[var(--dark-burgundy)] flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <div>
              <div className="text-lg font-semibold text-[var(--text-primary)]">
                Projektfortschritt
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                01.07.2023 → 18.12.2025
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-[var(--text-primary)]">
              {projectProgress.progress}%
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              {projectProgress.remainingDays} Tage verbleibend
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--bg-secondary)] rounded-full h-4 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-[var(--burgundy)] via-[var(--deep-red)] to-[var(--coral-red)] transition-all duration-1000 ease-out rounded-full relative overflow-hidden"
            style={{
              width: `${Math.min(projectProgress.progress, 100)}%`,
            }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-pulse"></div>
          </div>

          {/* Today marker */}
          <div
            className="absolute top-0 w-1 h-full bg-[var(--text-primary)] opacity-60"
            style={{ left: `${projectProgress.progress}%` }}
          >
            <div className="absolute -top-2 -left-2 w-5 h-5 bg-[var(--text-primary)] rounded-full border-2 border-[var(--bg-primary)]"></div>
          </div>
        </div>

        <div className="flex justify-between text-xs text-[var(--text-tertiary)] px-2">
          <span>Start: 01.07.2023</span>
          <span className="hidden sm:inline">
            Heute: {projectProgress.elapsedDays} von {projectProgress.totalDays}{" "}
            Tagen
          </span>
          <span className="sm:hidden">Tag {projectProgress.elapsedDays}</span>
          <span>Ziel: 18.12.2025</span>
        </div>
      </div>
    </Card>
  );
}
