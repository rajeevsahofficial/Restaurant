"use client";

import { useAdminTheme } from "@/lib/useAdminTheme";

// ── Icons ──────────────────────────────────────────────────────────────────────

function IconSun() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ── Shared button style ────────────────────────────────────────────────────────

const btnStyle: React.CSSProperties = {
  border: "1px solid var(--admin-border-strong)",
  background: "var(--admin-bg)",
  color: "var(--admin-text-secondary)",
};

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * Sticky topbar rendered inside the protected admin layout.
 * Kept as a lean client component so the layout can remain a server component.
 */
export default function AdminTopbar() {
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === "dark";

  return (
    <header
      className="sticky top-0 z-30 hidden h-[60px] shrink-0 items-center justify-between px-6 lg:flex"
      style={{ background: "var(--admin-topbar-bg)", borderBottom: "1px solid var(--admin-border)" }}
    >
      {/* Left — breadcrumb slot (reserved for future use) */}
      <div />

      {/* Right actions */}
      <div className="flex items-center gap-2.5">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Light mode" : "Dark mode"}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:opacity-80"
          style={btnStyle}
        >
          {isDark ? <IconSun /> : <IconMoon />}
        </button>

        {/* View live menu */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
          style={btnStyle}
        >
          <IconExternalLink />
          Live Menu
        </a>
      </div>
    </header>
  );
}
