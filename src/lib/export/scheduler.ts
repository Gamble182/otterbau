"use client";

import { BackupManager } from '@/lib/backup/backup-manager';

export type ExportSchedule = 'daily' | 'weekly' | 'monthly' | 'manual';

export interface ScheduleConfig {
  frequency: ExportSchedule;
  autoDownload: boolean;
  lastExport?: string;
  nextExport?: string;
}

export class ExportScheduler {
  private static readonly SCHEDULE_KEY = 'otterbau-export-schedule';
  private static readonly LAST_EXPORT_KEY = 'otterbau-last-export';

  static getScheduleConfig(): ScheduleConfig {
    try {
      const stored = localStorage.getItem(this.SCHEDULE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fall back to default
    }

    return {
      frequency: 'manual',
      autoDownload: false,
    };
  }

  static setScheduleConfig(config: ScheduleConfig): void {
    localStorage.setItem(this.SCHEDULE_KEY, JSON.stringify(config));
    this.updateNextExportDate(config);
  }

  static updateNextExportDate(config: ScheduleConfig): void {
    if (config.frequency === 'manual') {
      config.nextExport = undefined;
      return;
    }

    const now = new Date();
    const nextExport = new Date(now);

    switch (config.frequency) {
      case 'daily':
        nextExport.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        nextExport.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        nextExport.setMonth(now.getMonth() + 1);
        break;
    }

    config.nextExport = nextExport.toISOString();
  }

  static shouldExport(): boolean {
    const config = this.getScheduleConfig();

    if (config.frequency === 'manual' || !config.nextExport) {
      return false;
    }

    const now = new Date();
    const nextExport = new Date(config.nextExport);

    return now >= nextExport;
  }

  static async performScheduledExport(): Promise<boolean> {
    try {
      const config = this.getScheduleConfig();

      if (!this.shouldExport()) {
        return false;
      }

      if (config.autoDownload) {
        await BackupManager.downloadBackup();
      } else {
        // Just create backup data for manual download later
        await BackupManager.saveAutoBackup();
      }

      // Update last export time
      config.lastExport = new Date().toISOString();
      this.updateNextExportDate(config);
      this.setScheduleConfig(config);

      return true;
    } catch (error) {
      console.error('Scheduled export failed:', error);
      return false;
    }
  }

  static getNextExportInfo(): {
    hasSchedule: boolean;
    nextExport?: Date;
    timeUntilNext?: string;
    overdue?: boolean;
  } {
    const config = this.getScheduleConfig();

    if (config.frequency === 'manual' || !config.nextExport) {
      return { hasSchedule: false };
    }

    const nextExport = new Date(config.nextExport);
    const now = new Date();
    const timeUntilMs = nextExport.getTime() - now.getTime();
    const overdue = timeUntilMs < 0;

    let timeUntilNext = '';
    const absTimeUntil = Math.abs(timeUntilMs);
    const days = Math.floor(absTimeUntil / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absTimeUntil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      timeUntilNext = `${days} Tag${days !== 1 ? 'e' : ''}`;
      if (hours > 0) {
        timeUntilNext += ` und ${hours} Stunde${hours !== 1 ? 'n' : ''}`;
      }
    } else if (hours > 0) {
      timeUntilNext = `${hours} Stunde${hours !== 1 ? 'n' : ''}`;
    } else {
      timeUntilNext = 'weniger als 1 Stunde';
    }

    if (overdue) {
      timeUntilNext = `${timeUntilNext} überfällig`;
    }

    return {
      hasSchedule: true,
      nextExport,
      timeUntilNext,
      overdue,
    };
  }

  static initializeScheduler(): void {
    // Check for scheduled exports on app start
    if (this.shouldExport()) {
      this.performScheduledExport().then((success) => {
        if (success) {
          console.log('Scheduled export completed');
        }
      });
    }

    // Set up periodic check (every hour)
    setInterval(() => {
      this.performScheduledExport();
    }, 60 * 60 * 1000); // 1 hour
  }

  static getExportHistory(): Array<{
    date: string;
    type: 'manual' | 'scheduled';
    success: boolean;
  }> {
    try {
      const history = localStorage.getItem('otterbau-export-history');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  }

  static addExportToHistory(type: 'manual' | 'scheduled', success: boolean): void {
    const history = this.getExportHistory();
    history.unshift({
      date: new Date().toISOString(),
      type,
      success,
    });

    // Keep only last 50 entries
    if (history.length > 50) {
      history.splice(50);
    }

    localStorage.setItem('otterbau-export-history', JSON.stringify(history));
  }
}