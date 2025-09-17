'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV = [
  { href:"/", label:"Dashboard", icon:"🏠" },
  { href:"/entries", label:"Einträge", icon:"📋" },
  { href:"/settings", label:"Einstellungen", icon:"⚙️" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="min-h-dvh bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-gray-200 backdrop-blur">
        <div className="mx-auto max-w-5xl h-14 px-4 flex items-center justify-center">
          <h1 className="text-xl font-semibold">Otterbau Tracking</h1>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        {children}
      </main>

      {/* Bottom Tabbar (mobile) */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 border-t border-gray-200 backdrop-blur">
        <div className="grid grid-cols-3">
          {NAV.map(n=>(
            <Link key={n.href} href={n.href}
              className={clsx(
                "h-12 flex flex-col items-center justify-center text-xs",
                path===n.href ? "text-blue-600" : "text-gray-500"
              )}>
              <span className="text-base">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
