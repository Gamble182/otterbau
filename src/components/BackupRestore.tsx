"use client";

import { useState, useRef } from 'react';
import { Card } from './ui/Card';
import { BackupManager } from '@/lib/backup/backup-manager';
import type { BackupData } from '@/lib/backup/backup-manager';

interface BackupRestoreProps {
  onBackupComplete?: () => void;
  onRestoreComplete?: () => void;
}

export function BackupRestore({ onBackupComplete, onRestoreComplete }: BackupRestoreProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [backupStats, setBackupStats] = useState<BackupData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateBackup = async () => {
    setIsProcessing(true);
    setStatus('Backup wird erstellt...');

    try {
      await BackupManager.downloadBackup();
      setStatus('Backup erfolgreich heruntergeladen!');
      onBackupComplete?.();
    } catch (error) {
      setStatus(`Fehler beim Backup: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatus('Backup-Datei wird analysiert...');

    try {
      const backupData = await BackupManager.loadBackupFromFile(file);

      setStatus(`Backup-Datei geladen: ${backupData.entries.length} Einträge, ${backupData.persons.length} Personen`);
      setBackupStats(backupData);
    } catch (error) {
      setStatus(`Fehler beim Laden: ${error instanceof Error ? error.message : 'Ungültige Datei'}`);
      setBackupStats(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async (clearExisting: boolean = false) => {
    if (!backupStats) return;

    setIsProcessing(true);
    setStatus(clearExisting ? 'Daten werden ersetzt...' : 'Daten werden wiederhergestellt...');

    try {
      await BackupManager.restoreBackup(backupStats, { clearExisting });
      setStatus('Backup erfolgreich wiederhergestellt! Seite wird neu geladen...');

      onRestoreComplete?.();

      // Reload page to refresh all data
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setStatus(`Fehler beim Wiederherstellen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Backup Section */}
      <Card title="Backup erstellen" className="space-y-4">
        <p className="text-[var(--text-secondary)]">
          Erstelle eine vollständige Sicherung aller deiner Daten. Das Backup enthält alle Einträge,
          Personen und Einstellungen.
        </p>

        <button
          onClick={handleCreateBackup}
          disabled={isProcessing}
          className="w-full px-4 py-3 bg-gradient-accent text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Backup wird erstellt...' : 'Backup herunterladen'}
        </button>
      </Card>

      {/* Restore Section */}
      <Card title="Backup wiederherstellen" className="space-y-4">
        <p className="text-[var(--text-secondary)]">
          Lade eine Backup-Datei hoch, um deine Daten wiederherzustellen.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={handleFileSelect}
          disabled={isProcessing}
          className="w-full px-4 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-tertiary)] transition-colors border border-[var(--border-subtle)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Datei wird geladen...' : 'Backup-Datei auswählen'}
        </button>

        {/* Backup Preview */}
        {backupStats && (
          <div className="space-y-4 p-4 bg-[var(--bg-secondary)] rounded-lg">
            <h4 className="font-semibold text-[var(--text-primary)]">Backup-Inhalt:</h4>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[var(--text-tertiary)]">Erstellt am:</span>
                <div className="font-medium text-[var(--text-primary)]">
                  {new Date(backupStats.timestamp).toLocaleString('de-DE')}
                </div>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)]">Version:</span>
                <div className="font-medium text-[var(--text-primary)]">
                  {backupStats.version}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Einträge:</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {backupStats.entries.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Personen:</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {backupStats.persons.length}
                </span>
              </div>
              {backupStats.settings && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Einstellungen:</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {backupStats.settings.length}
                  </span>
                </div>
              )}
            </div>

            {/* Restore Options */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => handleRestore(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-gradient-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Daten hinzufügen
              </button>
              <button
                onClick={() => handleRestore(true)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-[var(--coral-red)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Daten ersetzen
              </button>
            </div>

            <div className="text-xs text-[var(--text-tertiary)] space-y-1">
              <p><strong>Hinzufügen:</strong> Behält vorhandene Daten und fügt Backup-Daten hinzu</p>
              <p><strong>Ersetzen:</strong> Löscht alle vorhandenen Daten und ersetzt sie durch das Backup</p>
            </div>
          </div>
        )}
      </Card>

      {/* Status Display */}
      {status && (
        <Card className={`p-4 ${status.includes('Fehler') ? 'bg-[var(--coral-red)]/10 border-[var(--coral-red)]/20' : 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/20'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${status.includes('Fehler') ? 'bg-[var(--coral-red)]' : 'bg-[var(--accent-primary)]'} ${isProcessing ? 'animate-pulse' : ''}`} />
            <span className={`text-sm font-medium ${status.includes('Fehler') ? 'text-[var(--coral-red)]' : 'text-[var(--accent-primary)]'}`}>
              {status}
            </span>
          </div>
        </Card>
      )}

      {/* Warning */}
      <Card variant="glass" className="backdrop-blur">
        <div className="flex items-start gap-3 p-4">
          <div className="w-8 h-8 rounded-lg bg-[var(--vibrant-orange)]/20 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-[var(--vibrant-orange)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--text-primary)] mb-1">
              Wichtiger Hinweis
            </h4>
            <p className="text-sm text-[var(--text-secondary)]">
              Backup-Dateien enthalten alle deine Daten im Klartext. Bewahre sie sicher auf und
              teile sie nur mit vertrauenswürdigen Personen. Bei der Option &quot;Daten ersetzen&quot; werden
              alle vorhandenen Daten unwiderruflich gelöscht.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}