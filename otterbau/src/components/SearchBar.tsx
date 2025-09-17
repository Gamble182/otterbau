'use client';
export default function SearchBar() {
  return (
    <div className="px-0 sm:px-0">
      <input
        placeholder="Suchen …"
        className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   dark:border-white/10 dark:bg-white/5"
      />
    </div>
  );
}
