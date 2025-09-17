'use client';
import { Card } from '@/components/ui/Card';

export default function QuickActions({ onAddWork, onAddExpense }:{
  onAddWork: ()=>void; 
  onAddExpense: ()=>void;
}) {
  return (
    <Card title="Schnell erfassen" className="relative overflow-hidden">
      {/* Hintergrund Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-emerald-50 dark:from-blue-950/20 dark:via-slate-800 dark:to-emerald-950/20" />
      
      <div className="relative grid sm:grid-cols-2 gap-4">
        {/* Arbeitszeit Button */}
        <button 
          onClick={onAddWork}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200"
        >
          {/* Glanz-Effekt */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold">Arbeitszeit</div>
                <div className="text-sm text-blue-100">1 Stunde erfassen</div>
              </div>
            </div>
            
            <div className="text-2xl font-bold opacity-50">+1h</div>
          </div>
        </button>

        {/* Ausgaben Button */}
        <button 
          onClick={onAddExpense}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 text-white shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200"
        >
          {/* Glanz-Effekt */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold">Ausgabe</div>
                <div className="text-sm text-emerald-100">25€ hinzufügen</div>
              </div>
            </div>
            
            <div className="text-2xl font-bold opacity-50">+25€</div>
          </div>
        </button>
      </div>

      {/* Erweiterte Aktionen (kleinere Buttons) */}
      <div className="relative mt-4 flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Detailerfassung
        </button>
        
        <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Timer starten
        </button>
      </div>

      {/* Info Hint */}
      <div className="relative mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Tipp:</strong> Quick-Add speichert mit Standardwerten. Für Details nutze "Detailerfassung".
          </p>
        </div>
      </div>
    </Card>
  );
}