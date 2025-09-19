"use client";

import { db } from '@/lib/db/dexie';
import type { Entry, Person, Settings } from '@/lib/schemas/zod';

export interface BackupData {
  version: string;
  timestamp: string;
  entries: Entry[];
  persons: Person[];
  settings: Settings[];
  metadata: {
    totalEntries: number;
    totalPersons: number;
    exportedBy: string;
  };
}

export class BackupManager {
  private static readonly VERSION = '1.0.0';
  private static readonly BACKUP_KEY = 'otterbau-auto-backup';

  static async createBackup(): Promise<BackupData> {
    try {
      const [entries, persons, settings] = await Promise.all([
        db.entries.toArray(),
        db.persons.toArray(),
        db.settings.toArray(),
      ]);

      const backup: BackupData = {
        version: this.VERSION,
        timestamp: new Date().toISOString(),
        entries,
        persons,
        settings,
        metadata: {
          totalEntries: entries.length,
          totalPersons: persons.length,
          exportedBy: 'Otterbau App',
        },
      };

      return backup;
    } catch (error) {
      console.error('Fehler beim Erstellen des Backups:', error);
      throw new Error('Backup konnte nicht erstellt werden');
    }
  }

  static async exportBackup(): Promise<string> {
    const backup = await this.createBackup();
    return JSON.stringify(backup, null, 2);
  }

  static async downloadBackup(filename?: string): Promise<void> {
    try {
      const backupData = await this.exportBackup();
      const defaultFilename = `otterbau-backup-${new Date().toISOString().split('T')[0]}.json`;

      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename || defaultFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Fehler beim Download des Backups:', error);
      throw new Error('Backup-Download fehlgeschlagen');
    }
  }

  static async validateBackup(data: unknown): Promise<BackupData> {
    if (!data || typeof data !== 'object') {
      throw new Error('Ungültiges Backup-Format');
    }

    const backup = data as Partial<BackupData>;

    if (!backup.version || !backup.timestamp || !backup.entries || !backup.persons) {
      throw new Error('Backup-Datei ist unvollständig');
    }

    if (!Array.isArray(backup.entries) || !Array.isArray(backup.persons)) {
      throw new Error('Backup-Daten haben falsches Format');
    }

    return backup as BackupData;
  }

  static async restoreBackup(backupData: BackupData, options: {
    clearExisting?: boolean;
    skipValidation?: boolean;
  } = {}): Promise<void> {
    const { clearExisting = false, skipValidation = false } = options;

    try {
      if (!skipValidation) {
        await this.validateBackup(backupData);
      }

      // Transaction to ensure data consistency
      await db.transaction('rw', [db.entries, db.persons, db.settings], async () => {
        if (clearExisting) {
          await Promise.all([
            db.entries.clear(),
            db.persons.clear(),
            db.settings.clear(),
          ]);
        }

        // Restore data
        if (backupData.entries.length > 0) {
          await db.entries.bulkAdd(backupData.entries);
        }

        if (backupData.persons.length > 0) {
          await db.persons.bulkAdd(backupData.persons);
        }

        if (backupData.settings && backupData.settings.length > 0) {
          await db.settings.bulkAdd(backupData.settings);
        }
      });

      console.log('Backup erfolgreich wiederhergestellt:', {
        entries: backupData.entries.length,
        persons: backupData.persons.length,
        settings: backupData.settings?.length || 0,
      });
    } catch (error) {
      console.error('Fehler beim Wiederherstellen des Backups:', error);
      throw new Error('Backup-Wiederherstellung fehlgeschlagen');
    }
  }

  static async loadBackupFromFile(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const data = JSON.parse(content);
          const validatedBackup = this.validateBackup(data);
          resolve(validatedBackup);
        } catch {
          reject(new Error('Fehler beim Lesen der Backup-Datei'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Datei konnte nicht gelesen werden'));
      };

      reader.readAsText(file);
    });
  }

  // Auto-backup functionality
  static async saveAutoBackup(): Promise<void> {
    try {
      const backup = await this.createBackup();
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));
      localStorage.setItem(`${this.BACKUP_KEY}-timestamp`, backup.timestamp);
    } catch (error) {
      console.warn('Auto-Backup konnte nicht gespeichert werden:', error);
    }
  }

  static getAutoBackupInfo(): { exists: boolean; timestamp?: string; size?: number } {
    try {
      const backupData = localStorage.getItem(this.BACKUP_KEY);
      const timestamp = localStorage.getItem(`${this.BACKUP_KEY}-timestamp`);

      if (!backupData || !timestamp) {
        return { exists: false };
      }

      return {
        exists: true,
        timestamp,
        size: new Blob([backupData]).size,
      };
    } catch {
      return { exists: false };
    }
  }

  static async restoreAutoBackup(): Promise<BackupData | null> {
    try {
      const backupData = localStorage.getItem(this.BACKUP_KEY);
      if (!backupData) return null;

      const backup = JSON.parse(backupData);
      await this.validateBackup(backup);
      return backup;
    } catch {
      console.warn('Auto-Backup konnte nicht geladen werden');
      return null;
    }
  }

  static clearAutoBackup(): void {
    localStorage.removeItem(this.BACKUP_KEY);
    localStorage.removeItem(`${this.BACKUP_KEY}-timestamp`);
  }

  // Statistics
  static async getBackupStats(): Promise<{
    totalSize: number;
    entriesByType: Record<string, number>;
    dateRange: { oldest?: string; newest?: string };
  }> {
    try {
      const backup = await this.createBackup();
      const backupSize = new Blob([JSON.stringify(backup)]).size;

      const entriesByType = backup.entries.reduce((acc, entry) => {
        acc[entry.type] = (acc[entry.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const dates = backup.entries.map(e => e.date).sort();
      const dateRange = {
        oldest: dates[0],
        newest: dates[dates.length - 1],
      };

      return {
        totalSize: backupSize,
        entriesByType,
        dateRange,
      };
    } catch {
      console.error('Fehler beim Berechnen der Backup-Statistiken');
      return {
        totalSize: 0,
        entriesByType: {},
        dateRange: {},
      };
    }
  }
}