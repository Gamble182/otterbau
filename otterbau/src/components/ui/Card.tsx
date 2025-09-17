'use client';
export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
      {title && <div className="text-sm text-gray-500 mb-1">{title}</div>}
      {children}
    </section>
  );
}
