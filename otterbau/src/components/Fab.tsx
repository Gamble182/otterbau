'use client';
export default function Fab({ onClick, label="+ Neu" }:{ onClick: ()=>void; label?: string }) {
  return (
    <button onClick={onClick}
      className="sm:hidden fixed bottom-16 right-4 h-12 px-4 rounded-full bg-emerald-600 text-white shadow-lg active:scale-95">
      {label}
    </button>
  );
}
