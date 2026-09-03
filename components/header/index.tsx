"use client";

import { useEffect, useState } from "react";
import { RESTAURANT_CONFIG } from "@/lib/config";

interface NavbarProps {
  tableNumber: string;
  restaurantName?: string;
}

export default function Navbar({ tableNumber, restaurantName }: NavbarProps) {
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleDark() {
    setIsDark(document.documentElement.classList.toggle("dark"));
  }

  const name = restaurantName || RESTAURANT_CONFIG.name;

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-2xl transition-shadow duration-300 ${
        scrolled
          ? "shadow-[0_1px_0_rgba(0,0,0,0.06),0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.4)]"
          : ""
      } bg-[#f7f5f0]/95 dark:bg-[#141210]/95`}
    >
      {/* Gold rule */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#c4a97d]/50 to-transparent" />

      <div className="flex items-center justify-between gap-2 px-4 py-3">

        {/* ── Brand ── */}
        <div className="flex min-w-0 items-center gap-2.5">
          {/* Icon plate */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#1f1c17] dark:bg-white/10">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#c4a97d]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#c4a97d]">
              Welcome to
            </p>
            <h1 className="truncate text-[15px] font-extrabold leading-tight tracking-tight text-[#171714] dark:text-white">
              {name}
            </h1>
          </div>
        </div>

        {/* ── Right actions ── */}
        <div className="flex shrink-0 items-center gap-2">

          {/* Table badge OR empty state */}
          {tableNumber ? (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-[#1f1c17] px-3.5 py-1.5 dark:bg-white/10">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">Table</p>
              <p className="text-[14px] font-black leading-none tracking-tight text-white">
                {tableNumber}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-2xl border border-[#c4a97d]/30 bg-[#c4a97d]/8 px-3 py-2 dark:border-[#c4a97d]/20 dark:bg-[#c4a97d]/5">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#c4a97d]" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none" />
                <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none" />
                <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none" />
                <path d="M14 14h2v2h-2zM18 14h3M18 18h3M14 18v3M14 20h2" />
              </svg>
              <span className="text-[11px] font-semibold text-[#8d7b61] dark:text-[#c4a97d]/70">Scan QR</span>
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleDark}
            aria-label={isDark ? "Light mode" : "Dark mode"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#1f1c17] text-[#c4a97d] transition active:scale-90 dark:bg-white/10 dark:text-white/60"
          >
            {isDark ? (
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
