"use client";

import { useEffect, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  category?: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, preventDefault = true } = options;
  const shortcutsRef = useRef(shortcuts);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      const matchedShortcut = shortcutsRef.current.find((shortcut) => {
        return (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!event.ctrlKey === !!shortcut.ctrlKey &&
          !!event.altKey === !!shortcut.altKey &&
          !!event.shiftKey === !!shortcut.shiftKey &&
          !!event.metaKey === !!shortcut.metaKey
        );
      });

      if (matchedShortcut) {
        if (preventDefault) {
          event.preventDefault();
        }
        matchedShortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, preventDefault]);

  return shortcutsRef.current;
}

// Helper function to format keyboard shortcuts for display
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.metaKey) parts.push('Cmd');

  parts.push(shortcut.key.toUpperCase());

  return parts.join(' + ');
}

// Common shortcuts that can be reused
export const createCommonShortcuts = (callbacks: {
  onSearch?: () => void;
  onNewEntry?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onSettings?: () => void;
  onHelp?: () => void;
}): KeyboardShortcut[] => [
  {
    key: '/',
    description: 'Suche öffnen',
    action: callbacks.onSearch || (() => {}),
    category: 'Navigation',
  },
  {
    key: 'n',
    ctrlKey: true,
    description: 'Neuen Eintrag erstellen',
    action: callbacks.onNewEntry || (() => {}),
    category: 'Aktionen',
  },
  {
    key: 's',
    ctrlKey: true,
    description: 'Speichern',
    action: callbacks.onSave || (() => {}),
    category: 'Aktionen',
  },
  {
    key: 'e',
    ctrlKey: true,
    shiftKey: true,
    description: 'Daten exportieren',
    action: callbacks.onExport || (() => {}),
    category: 'Daten',
  },
  {
    key: ',',
    ctrlKey: true,
    description: 'Einstellungen öffnen',
    action: callbacks.onSettings || (() => {}),
    category: 'Navigation',
  },
  {
    key: '?',
    shiftKey: true,
    description: 'Hilfe anzeigen',
    action: callbacks.onHelp || (() => {}),
    category: 'Hilfe',
  },
];