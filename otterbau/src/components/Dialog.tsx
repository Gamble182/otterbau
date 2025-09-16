'use client';
import { useEffect } from "react";

export default function Dialog({
  open, onClose, title, children
}: { open: boolean; onClose: ()=>void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent){ if(e.key === 'Escape') onClose(); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-zinc-900 text-zinc-100 p-4 shadow-xl" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="opacity-70 hover:opacity-100">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
