"use client";
import { useEffect, useState } from "react";
import { usePersons } from "@/store/usePersons";
import { useEntries } from "@/store/useEntries";
import { useSettings } from "@/store/useSettings";

export function InitStores() {
  const [isClient, setIsClient] = useState(false);
  const loadPersons = usePersons((s) => s.load);
  const loadEntries = useEntries((s) => s.load);
  const loadSettings = useSettings((s) => s.load);

  // Ensure we only run on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      loadPersons();
      loadEntries();
      loadSettings();
    }
  }, [isClient, loadPersons, loadEntries, loadSettings]);

  // Don't render anything - this is just for side effects
  return null;
}
