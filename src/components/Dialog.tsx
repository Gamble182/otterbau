"use client";
import { useEffect } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export default function Dialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "md",
}: DialogProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
    >
      {/* Sony-Style Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        onClick={onClose}
        style={{
          zIndex: 1,
          background: `
            radial-gradient(circle at 30% 20%, rgba(253, 184, 99, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(232, 90, 43, 0.06) 0%, transparent 50%),
            rgba(42, 27, 27, 0.85)
          `,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />

      {/* Sony-Style Dialog */}
      <div
        className={`
          relative w-full ${maxWidthClasses[maxWidth]} 
          animate-scale-in
          max-h-[90vh] overflow-hidden
        `}
        onClick={(e) => e.stopPropagation()}
        style={{
          zIndex: 2,
          background: "var(--bg-surface-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          boxShadow: `
            0 25px 50px rgba(42, 27, 27, 0.25),
            0 10px 20px rgba(42, 27, 27, 0.15)
          `,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Sony-Style Header */}
        <div
          className="relative overflow-hidden"
          style={{
            padding: "var(--space-2xl) var(--space-2xl) var(--space-lg)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full border-4 border-[var(--accent-primary)] -translate-y-16 translate-x-16"></div>
          </div>

          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Icon based on title */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                }}
              >
                {title.includes("Arbeitszeit") ? (
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : title.includes("Ausgabe") ? (
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                ) : (
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1 line-height-1.3">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-[var(--text-secondary)] line-height-1.4">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Sony-Style Close Button */}
            <button
              onClick={onClose}
              className="ml-4 p-3 hover:bg-[var(--bg-surface)] rounded-xl transition-all duration-200 group flex-shrink-0"
              aria-label="Schließen"
            >
              <svg
                className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Subtle bottom border with gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)]/30 to-transparent"></div>
        </div>

        {/* Content Area */}
        <div
          className="overflow-y-auto"
          style={{
            padding: "var(--space-2xl)",
            maxHeight: "calc(90vh - 140px)",
          }}
        >
          <div className="animate-slide-up">{children}</div>
        </div>
      </div>
    </div>
  );
}
