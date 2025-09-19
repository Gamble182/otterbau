"use client";

import { useState } from 'react';
import { Card } from './ui/Card';
import Modal from './Modal';
import type { KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';
import { formatShortcut } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({
  shortcuts,
  isOpen,
  onClose,
}: KeyboardShortcutsHelpProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'Allgemein';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const categories = Object.keys(groupedShortcuts).sort();

  const displayShortcuts = selectedCategory
    ? groupedShortcuts[selectedCategory] || []
    : shortcuts;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tastenkürzel">
      <div className="space-y-6">
        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-gradient-accent text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              Alle
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-gradient-accent text-white'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Shortcuts List */}
        <div className="space-y-3">
          {displayShortcuts.map((shortcut, index) => (
            <div
              key={`${shortcut.key}-${index}`}
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <div className="flex-1">
                <div className="text-[var(--text-primary)] font-medium">
                  {shortcut.description}
                </div>
                {shortcut.category && selectedCategory === null && (
                  <div className="text-[var(--text-tertiary)] text-xs mt-1">
                    {shortcut.category}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                {formatShortcut(shortcut).split(' + ').map((key, keyIndex) => (
                  <span key={keyIndex} className="flex items-center">
                    <kbd className="px-2 py-1 text-xs font-mono bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded shadow-sm text-[var(--text-secondary)]">
                      {key}
                    </kbd>
                    {keyIndex < formatShortcut(shortcut).split(' + ').length - 1 && (
                      <span className="mx-1 text-[var(--text-tertiary)]">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {displayShortcuts.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-[var(--accent-primary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 012 2v4a2 2 0 012 2v5a2 2 0 01-2 2h-5z"
                />
              </svg>
            </div>
            <p className="text-[var(--text-secondary)] font-medium">
              Keine Tastenkürzel verfügbar
            </p>
          </div>
        )}

        {/* Pro Tip */}
        <Card variant="glass" className="backdrop-blur">
          <div className="flex items-start gap-3 p-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center flex-shrink-0">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                Pro-Tipp
              </h4>
              <p className="text-sm text-[var(--text-secondary)]">
                Tastenkürzel funktionieren nicht, wenn du gerade in einem Eingabefeld tippst.
                Drücke <kbd className="px-1 py-0.5 text-xs bg-[var(--bg-tertiary)] rounded">Escape</kbd> oder
                klicke außerhalb des Feldes, um Tastenkürzel zu aktivieren.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
}