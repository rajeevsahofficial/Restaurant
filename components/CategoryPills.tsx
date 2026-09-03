"use client";

import { useRef, useState, useEffect } from "react";

interface CategoryPillsProps {
  active: string;
  onChange: (cat: string) => void;
  categories: string[];
}

export default function CategoryPills({ active, onChange, categories }: CategoryPillsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Close when clicking outside */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function select(cat: string) {
    onChange(cat);
    setOpen(false);
  }

  return (
    <section className="mt-5 px-5">
      <div ref={ref} className="relative">
        {/* ── Trigger ── */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-t-2xl bg-[#1a1814] px-5 py-4 text-white transition-colors dark:bg-[#0f0e0c]"
          style={{ borderRadius: open ? "16px 16px 0 0" : "16px" }}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="text-sm font-semibold">{active}</span>
          {/* Chevron */}
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 shrink-0 text-white/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* ── Dropdown list ── */}
        {open && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 overflow-hidden rounded-b-2xl border border-t-0 border-black/8 bg-white shadow-xl dark:border-white/8 dark:bg-[#1a1814]"
          >
            {categories.map((cat) => {
              const isActive = cat === active;
              return (
                <li key={cat} role="option" aria-selected={isActive}>
                  <button
                    onClick={() => select(cat)}
                    className={`w-full px-5 py-3.5 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-[#1a6bf5] font-semibold text-white"
                        : "font-normal text-black/60 hover:bg-black/4 dark:text-white/55 dark:hover:bg-white/6"
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
