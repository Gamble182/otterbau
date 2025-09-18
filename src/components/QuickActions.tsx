"use client";
import { Card } from "@/components/ui/Card";

export default function QuickActions({
  onAddWork,
  onAddExpense,
}: {
  onAddWork: () => void;
  onAddExpense: () => void;
}) {
  return (
    <Card title="Schnell erfassen" className="relative">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full border-4 border-[var(--accent-primary)] -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full border-2 border-[var(--coral-red)] translate-y-10 -translate-x-10"></div>
      </div>

      <div className="relative space-y-4">
        {/* Primary Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Arbeitszeit Button */}
          <button
            onClick={onAddWork}
            className="quick-action-card quick-action-work group"
          >
            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-lg font-semibold mb-1">Arbeitszeit</div>
                  <div className="text-sm opacity-90">1 Stunde erfassen</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold opacity-60">+1h</div>
              </div>
            </div>
          </button>

          {/* Ausgaben Button */}
          <button
            onClick={onAddExpense}
            className="quick-action-card quick-action-expense group"
          >
            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-lg font-semibold mb-1">Ausgabe</div>
                  <div className="text-sm opacity-90">25€ hinzufügen</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold opacity-60">+25€</div>
              </div>
            </div>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="btn btn-secondary btn-sm group">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            <span>Detailerfassung</span>
          </button>

          <button className="btn btn-secondary btn-sm group">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Timer starten</span>
          </button>
        </div>

        {/* Info Banner */}
        <div className="relative mt-6 p-4 rounded-xl bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[var(--accent-primary)] flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                Schneller Tipp
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Quick-Add verwendet Standardwerte für eine schnelle Erfassung.
                Für detaillierte Eingaben nutze die "Detailerfassung".
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
