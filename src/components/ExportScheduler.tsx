"use client";

import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { ExportScheduler, type ScheduleConfig, type ExportSchedule } from '@/lib/export/scheduler';

export function ExportSchedulerComponent() {
  const [config, setConfig] = useState<ScheduleConfig>({ frequency: 'manual', autoDownload: false });
  const [nextExportInfo, setNextExportInfo] = useState<ReturnType<typeof ExportScheduler.getNextExportInfo> | null>(null);

  useEffect(() => {
    const loadConfig = () => {
      const savedConfig = ExportScheduler.getScheduleConfig();
      setConfig(savedConfig);
      setNextExportInfo(ExportScheduler.getNextExportInfo());
    };

    loadConfig();

    // Update next export info every minute
    const interval = setInterval(() => {
      setNextExportInfo(ExportScheduler.getNextExportInfo());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleFrequencyChange = (frequency: ExportSchedule) => {
    const newConfig = { ...config, frequency };
    setConfig(newConfig);
    ExportScheduler.setScheduleConfig(newConfig);
    setNextExportInfo(ExportScheduler.getNextExportInfo());
  };

  const handleAutoDownloadChange = (autoDownload: boolean) => {
    const newConfig = { ...config, autoDownload };
    setConfig(newConfig);
    ExportScheduler.setScheduleConfig(newConfig);
  };

  const handleManualExport = async () => {
    try {
      await ExportScheduler.performScheduledExport();
      ExportScheduler.addExportToHistory('manual', true);
      setNextExportInfo(ExportScheduler.getNextExportInfo());
    } catch (error) {
      ExportScheduler.addExportToHistory('manual', false);
      console.error('Manual export failed:', error);
    }
  };

  const frequencyOptions: { value: ExportSchedule; label: string; description: string }[] = [
    { value: 'manual', label: 'Manuell', description: 'Nur auf Anfrage exportieren' },
    { value: 'daily', label: 'Täglich', description: 'Automatisch jeden Tag' },
    { value: 'weekly', label: 'Wöchentlich', description: 'Automatisch jede Woche' },
    { value: 'monthly', label: 'Monatlich', description: 'Automatisch jeden Monat' },
  ];

  return (
    <div className="space-y-6">
      {/* Schedule Configuration */}
      <Card title="Export-Zeitplan" className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
              Export-Häufigkeit
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {frequencyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFrequencyChange(option.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    config.frequency === option.value
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-emphasis)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-[var(--text-primary)]">
                      {option.label}
                    </span>
                    {config.frequency === option.value && (
                      <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {config.frequency !== 'manual' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg">
                <div>
                  <h4 className="font-medium text-[var(--text-primary)]">
                    Automatischer Download
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Backup-Dateien automatisch herunterladen
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoDownload}
                    onChange={(e) => handleAutoDownloadChange(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--bg-tertiary)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-accent"></div>
                </label>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Next Export Info */}
      {nextExportInfo?.hasSchedule && (
        <Card title="Nächster Export" className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg">
            <div>
              <div className="font-medium text-[var(--text-primary)]">
                {nextExportInfo.overdue ? 'Export überfällig' : 'Geplant in'}
              </div>
              <div className={`text-sm ${
                nextExportInfo.overdue
                  ? 'text-[var(--coral-red)]'
                  : 'text-[var(--text-secondary)]'
              }`}>
                {nextExportInfo.timeUntilNext}
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              nextExportInfo.overdue
                ? 'bg-[var(--coral-red)] animate-pulse'
                : 'bg-[var(--accent-primary)]'
            }`} />
          </div>

          {nextExportInfo.overdue && (
            <button
              onClick={handleManualExport}
              className="w-full px-4 py-3 bg-[var(--coral-red)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Jetzt exportieren
            </button>
          )}
        </Card>
      )}

      {/* Manual Export */}
      <Card title="Sofortiger Export" className="space-y-4">
        <p className="text-[var(--text-secondary)]">
          Erstelle sofort einen Export, unabhängig vom Zeitplan.
        </p>

        <button
          onClick={handleManualExport}
          className="w-full px-4 py-3 bg-gradient-accent text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Jetzt exportieren
        </button>
      </Card>

      {/* Info */}
      <Card variant="glass" className="backdrop-blur">
        <div className="flex items-start gap-3 p-4">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/20 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-[var(--accent-primary)]"
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
              Automatische Exports
            </h4>
            <div className="text-sm text-[var(--text-secondary)] space-y-1">
              <p>
                • <strong>Mit Download:</strong> Backup-Dateien werden automatisch heruntergeladen
              </p>
              <p>
                • <strong>Ohne Download:</strong> Backups werden lokal gespeichert für manuellen Download
              </p>
              <p>
                • Exports laufen im Hintergrund und beeinträchtigen deine Arbeit nicht
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}