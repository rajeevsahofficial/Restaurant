"use client";

import { useEffect, useState } from "react";
import { RESTAURANT_CONFIG } from "@/lib/config";

interface NavbarProps {
  tableNumber: string;
  restaurantName?: string;
}

export default function Navbar({ tableNumber, restaurantName }: NavbarProps) {
  const [isDark, setIsDark] = useState(false);

  // Sync toggle state with the actual class on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleDark() {
    const dark = document.documentElement.classList.toggle("dark");
    setIsDark(dark);
  }
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[#f7f5f0]/95 px-4 py-3 backdrop-blur-xl dark:border-white/5 dark:bg-[#141210]/95">
      <div className="flex items-center justify-between gap-3">

        {/* ── LEFT: Logo / Brand ── */}
        <div className="flex min-w-0 flex-col">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#8d7b61]">
            Welcome to
          </p>
          <h1 className="truncate text-[15px] font-extrabold leading-tight tracking-tight">
            {restaurantName || RESTAURANT_CONFIG.name}
          </h1>
        </div>

        {/* ── RIGHT: Table chip + Dark toggle ── */}
        <div className="flex shrink-0 items-center gap-2">

          {/* Table / QR chip */}
          {tableNumber ? (
            <div className="flex flex-col items-end rounded-xl bg-[#f3eee3] px-3 py-1.5 dark:bg-white/10">
              <p className="text-[8px] font-semibold uppercase tracking-widest text-black/40 dark:text-white/40">
                Your Table
              </p>
              <p className="text-sm font-extrabold leading-none tracking-tight">
                Table {tableNumber}
              </p>
            </div>
          ) : (
            <button
              className="group flex items-center gap-2 rounded-xl border border-dashed border-[#c4a97d]/60 bg-[#fdf8f0] px-3 py-1.5 transition-all duration-200 hover:border-[#c4a97d] hover:bg-[#f3eee3] active:scale-95 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10"
              aria-label="Scan QR code to get your table"
            >
              {/* QR icon */}
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 shrink-0 text-[#8d7b61] transition-transform duration-200 group-hover:scale-110 dark:text-white/60"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none" />
                <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none" />
                <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none" />
                <path d="M14 14h2v2h-2zM18 14h3M18 18h3M14 18v3M14 20h2" />
              </svg>
              <div className="flex flex-col items-start leading-none">
                <p className="text-[8px] font-semibold uppercase tracking-widest text-black/40 dark:text-white/40">
                  No table
                </p>
                <p className="text-[11px] font-bold text-[#8d7b61] dark:text-white/70">
                  Scan QR
                </p>
              </div>
            </button>
          )}

          {/* Dark / Light toggle */}
          <button
            onClick={toggleDark}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/8 bg-white transition-all duration-200 dark:border-white/10 dark:bg-white/10"
            aria-label="Toggle dark mode"
          >
            {/* Sun — shown in dark mode */}
            <svg
              viewBox="0 0 24 24"
              className="absolute h-4.5 w-4.5 rotate-0 scale-100 text-amber-500 transition-all duration-300 dark:rotate-0 dark:scale-100 hidden dark:block"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
            {/* Moon — shown in light mode */}
            <svg
              viewBox="0 0 24 24"
              className="absolute h-4.5 w-4.5 text-slate-600 transition-all duration-300 dark:hidden"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
