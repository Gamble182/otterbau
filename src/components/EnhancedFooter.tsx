"use client";

import { useState, useEffect } from "react";
import { useEntries } from "@/store/useEntries";
import { usePersons } from "@/store/usePersons";
import { Card } from "@/components/ui/Card";

interface FooterStats {
  totalEntries: number;
  totalPersons: number;
  lastEntryDate?: string;
  dataSource: 'local' | 'database';
  storageSize?: string;
}

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

function useStorageSize() {
  const [storageSize, setStorageSize] = useState<string>('');

  useEffect(() => {
    try {
      // Schätzung der localStorage Größe
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      
      // Konvertiere zu KB/MB
      if (total < 1024) {
        setStorageSize(`${total}B`);
      } else if (total < 1024 * 1024) {
        setStorageSize(`${(total / 1024).toFixed(1)}KB`);
      } else {
        setStorageSize(`${(total / 1024 / 1024).toFixed(1)}MB`);
      }
    } catch {
      setStorageSize('N/A');
    }
  }, []);

  return storageSize;
}

export function EnhancedFooter({ displayName, isFiltered }: { 
  displayName: string; 
  isFiltered: boolean; 
}) {
  const entries = useEntries((s) => s.items);
  const persons = usePersons((s) => s.items);
  const isOnline = useOnlineStatus();
  const storageSize = useStorageSize();
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const footerStats: FooterStats = {
    totalEntries: entries.length,
    totalPersons: persons.length,
    lastEntryDate: entries.length > 0 
      ? new Date(Math.max(...entries.map(e => new Date(e.date).getTime()))).toLocaleDateString('de-DE')
      : undefined,
    dataSource: 'database', // Da wir Supabase verwenden
    storageSize,
  };

  return (
    <Card variant="glass" className="backdrop-blur mt-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
        {/* Online/Offline Status */}
        <div className={`status-indicator ${isOnline ? 'status-online' : 'status-offline'}`}>
          <div className={`status-led ${isOnline ? 'status-led-active' : 'status-led-inactive animate-pulse'}`} />
          <div className="flex flex-col">
            <span className="font-semibold">{isOnline ? 'Online' : 'Offline'}</span>
            <span className="text-xs text-[var(--text-tertiary)]">
              {isOnline ? 'Verbunden' : 'Getrennt'}
            </span>
          </div>
        </div>

        {/* Datenquelle */}
        <div className="status-indicator status-neutral">
          <div className="status-led status-led-database" />
          <div className="flex flex-col">
            <span className="font-semibold">
              {footerStats.dataSource === 'database' ? 'Datenbank' : 'Lokal'}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              {footerStats.dataSource === 'database' ? 'Supabase' : 'IndexedDB'}
            </span>
          </div>
        </div>

        {/* Einträge Anzahl */}
        <div className="status-indicator status-info">
          <div className="status-led status-led-data" />
          <div className="flex flex-col">
            <span className="font-semibold">{footerStats.totalEntries} Einträge</span>
            <span className="text-xs text-[var(--text-tertiary)]">
              {footerStats.totalPersons} Person{footerStats.totalPersons !== 1 ? 'en' : ''}
            </span>
          </div>
        </div>

        {/* Zeitraum Info */}
        <div className="status-indicator status-neutral">
          <div className="status-led status-led-time" />
          <div className="flex flex-col">
            <span className="font-semibold">
              {displayName}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              {isFiltered ? 'Gefiltert' : 'Alle Daten'}
            </span>
          </div>
        </div>

        {/* System Info */}
        <div className="status-indicator status-neutral col-span-2 sm:col-span-3 lg:col-span-1">
          <div className="status-led status-led-system" />
          <div className="flex flex-col">
            <span className="font-semibold text-xs">
              {currentTime.toLocaleTimeString('de-DE', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              Cache: {storageSize}
            </span>
          </div>
        </div>
      </div>

      {/* Zusätzliche Info Zeile */}
      {footerStats.lastEntryDate && (
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] text-center">
          <span className="text-xs text-[var(--text-tertiary)]">
            Letzter Eintrag: {footerStats.lastEntryDate} • 
            PWA Version: 1.0 • 
            {isOnline ? 'Sync aktiv' : 'Offline Modus'}
          </span>
        </div>
      )}
    </Card>
  );
}