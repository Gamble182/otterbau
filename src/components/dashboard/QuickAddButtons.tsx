"use client";

import { Card } from "@/components/ui/Card";
import type { QuickAddButtonsProps } from "@/types/dashboard";

export default function QuickAddButtons({
  onWorkClick,
  onExpenseClick,
}: QuickAddButtonsProps) {
  return (
    <Card variant="glass">
      <div className="flex justify-center px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Arbeitszeit CTA */}
          <button
            onClick={onWorkClick}
            className="group relative px-6 py-8 sm:px-8 sm:py-10 bg-gradient-accent text-white rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 overflow-hidden"
          >
            {/* Subtiler iOS-Glanz */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/30 rounded-t-2xl opacity-60"></div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <svg
                  className="w-7 h-7"
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

              <div className="text-center">
                <div className="text-xl font-semibold mb-1">Arbeitszeit</div>
                <div className="text-sm opacity-90 font-medium">erfassen</div>
              </div>
            </div>

            {/* iOS-typischer subtiler Shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></div>
          </button>

          {/* Ausgaben CTA */}
          <button
            onClick={onExpenseClick}
            className="group relative px-6 py-8 sm:px-8 sm:py-10 bg-gradient-warm text-white rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 overflow-hidden"
          >
            {/* Subtiler iOS-Glanz */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/30 rounded-t-2xl opacity-60"></div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <svg
                  className="w-7 h-7"
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

              <div className="text-center">
                <div className="text-xl font-semibold mb-1">Ausgabe</div>
                <div className="text-sm opacity-90 font-medium">erfassen</div>
              </div>
            </div>

            {/* iOS-typischer subtiler Shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></div>
          </button>
        </div>
      </div>
    </Card>
  );
}
