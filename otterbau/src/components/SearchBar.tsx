'use client';
import { useState } from 'react';

export default function SearchBar() {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      {/* Hauptsuchfeld */}
      <div className={`
        relative flex items-center bg-white dark:bg-slate-800 rounded-2xl
        border-2 transition-all duration-200 shadow-sm
        ${isFocused 
          ? 'border-blue-500 shadow-lg shadow-blue-500/10' 
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        }
      `}>
        {/* Such-Icon */}
        <div className="pl-4 pr-2">
          <svg className={`w-5 h-5 transition-colors ${
            isFocused ? 'text-blue-500' : 'text-slate-400'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Suche nach Einträgen, Personen, Kategorien..."
          className="flex-1 py-3 pr-4 bg-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none"
        />

        {/* Clear Button */}
        {value && (
          <button
            onClick={() => setValue('')}
            className="mr-3 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <svg className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Filter Button */}
        <button className="mr-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors group">
          <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        </button>
      </div>

      {/* Quick Filter Pills */}
      {!isFocused && !value && (
        <div className="flex items-center gap-2 mt-3">
          <span className="text-sm text-slate-500 dark:text-slate-400 mr-1">Schnellfilter:</span>
          
          {['Heute', 'Diese Woche', 'Arbeitszeit', 'Ausgaben'].map((filter) => (
            <button
              key={filter}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      {/* Suchergebnisse Preview (wenn Eingabe vorhanden) */}
      {value && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg z-50">
          <div className="p-3">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Suchergebnisse für "{value}"
            </div>
            
            {/* Mock-Ergebnisse */}
            <div className="space-y-2">
              <div className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-sm">⏰</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Arbeitszeit - Yannik</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Gestern • 8.5 Stunden</div>
                  </div>
                </div>
              </div>
              
              <div className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-sm">💰</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Werkzeug Einkauf</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">15.12. • 125,50 €</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                Alle Ergebnisse anzeigen →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}