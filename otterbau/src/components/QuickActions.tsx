'use client';
export default function QuickActions({ onAddWork, onAddExpense }:{
  onAddWork: ()=>void; onAddExpense: ()=>void;
}) {
  return (
    <div className="space-y-3">
      <button onClick={onAddWork}
        className="w-full rounded-xl bg-blue-600 px-4 py-3 text-white font-medium
                   hover:bg-blue-700 active:bg-blue-800 transition">
        Quick-Add Arbeitsstunde
      </button>
      <button onClick={onAddExpense}
        className="w-full rounded-xl bg-green-600 px-4 py-3 text-white font-medium
                   hover:bg-green-700 active:bg-green-800 transition">
        Quick-Add Ausgabe
      </button>
    </div>
  );
}
