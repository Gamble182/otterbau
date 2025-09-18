"use client";
import { useState } from "react";

export default function SearchBar() {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="search-container animate-slide-up">
      {/* Main Search Field */}
      <div className="relative">
        <div
          className={`
          search-input-container relative flex items-center transition-all duration-300
          ${isFocused ? "transform -translate-y-1" : ""}
        `}
        >
          {/* Search Icon */}
          <div className="search-icon">
            <svg
              className={`w-5 h-5 transition-colors duration-200 ${
                isFocused
                  ? "text-[var(--accent-primary)]"
                  : "text-[var(--text-tertiary)]"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Suche nach Einträgen, Personen, Kategorien..."
            className="search-input"
          />

          {/* Clear Button */}
          {value && (
            <button
              onClick={() => setValue("")}
              className="absolute right-4 p-2 hover:bg-[var(--bg-surface)] rounded-full transition-all duration-200 animate-scale-in"
            >
              <svg
                className="w-4 h-4 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Pills */}
      {!isFocused && !value && (
        <div className="flex items-center gap-3 mt-4 animate-fade-in">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Schnellfilter:
          </span>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "Heute", icon: "📅" },
              { label: "Diese Woche", icon: "🗓️" },
              { label: "Arbeitszeit", icon: "⏰" },
              { label: "Ausgaben", icon: "💰" },
            ].map((filter, index) => (
              <button
                key={filter.label}
                className="filter-pill animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="text-xs">{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Preview */}
      {value && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-3 animate-slide-up">
          <div className="card border-[var(--border-emphasis)] shadow-xl">
            <div className="card-body-compact">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    Suchergebnisse für "{value}"
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    3 Ergebnisse gefunden
                  </div>
                </div>
              </div>

              {/* Mock Search Results */}
              <div className="space-y-3">
                <div className="entry-item p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="entry-icon-work w-10 h-10">
                      <svg
                        className="w-5 h-5"
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
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">
                        Arbeitszeit - Yannik
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        Gestern • 8.5 Stunden • Küche
                      </div>
                    </div>
                    <div className="text-sm font-bold text-[var(--accent-primary)]">
                      8.5h
                    </div>
                  </div>
                </div>

                <div className="entry-item p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="entry-icon-expense w-10 h-10">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">
                        Werkzeug Einkauf
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        15.12. • Baumarkt • Elektrik
                      </div>
                    </div>
                    <div className="text-sm font-bold text-[var(--coral-red)]">
                      125.50€
                    </div>
                  </div>
                </div>

                <div className="entry-item p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="entry-icon-work w-10 h-10">
                      <svg
                        className="w-5 h-5"
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
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">
                        Badezimmer Renovierung
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        14.12. • 6.0 Stunden • Max
                      </div>
                    </div>
                    <div className="text-sm font-bold text-[var(--accent-primary)]">
                      6.0h
                    </div>
                  </div>
                </div>
              </div>

              {/* View All Results */}
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
                <button className="w-full text-center py-2 px-4 rounded-lg bg-gradient-accent text-white font-medium hover:transform hover:-translate-y-0.5 transition-all duration-200">
                  Alle Ergebnisse anzeigen →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
