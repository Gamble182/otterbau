'use client';
import { useEffect } from "react";
import { usePersons } from "@/store/usePersons";
import { useEntries } from "@/store/useEntries";
import { useSettings } from "@/store/useSettings";

export function InitStores() {
  const loadPersons = usePersons((s) => s.load);
  const loadEntries = useEntries((s) => s.load);
  const loadSettings = useSettings((s) => s.load);

  useEffect(() => {
    loadPersons();
    loadEntries();
    loadSettings();
  }, [loadPersons, loadEntries, loadSettings]);

  return null;
}
