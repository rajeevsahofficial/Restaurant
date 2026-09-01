"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RESTAURANT_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useAdminTheme } from "@/lib/useAdminTheme";

// ── Types ──────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface AdminSidebarProps {
  userEmail: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Menu",
    href: "/admin/menu",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
  {
    label: "Tables & QR",
    href: "/admin/tables",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h2v2h-2zM18 14h3M18 18h3M14 18v3M14 20h2" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

// ── Shared icons ───────────────────────────────────────────────────────────────

const IconSun = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const IconMoon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const IconSpinner = ({ cls = "h-3.5 w-3.5" }: { cls?: string }) => (
  <svg className={cn(cls, "animate-spin")} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const IconSignOut = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// ── Sub-components ─────────────────────────────────────────────────────────────

function BrandLogo() {
  return (
    <div className="flex h-[60px] shrink-0 items-center gap-3 border-b border-white/10 px-5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11l19-9-9 19-2-8-8-2z" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold leading-tight text-white">
          {RESTAURANT_CONFIG.name}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-widest text-white/50">
          Admin
        </p>
      </div>
    </div>
  );
}

function NavLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
        active
          ? "bg-white/15 text-white"
          : "text-white/60 hover:bg-white/[0.08] hover:text-white/90",
      )}
    >
      <span className={cn("shrink-0 transition-colors", active ? "text-white" : "text-white/45 group-hover:text-white/80")}>
        {item.icon}
      </span>
      <span className="flex-1">{item.label}</span>
      {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
      {children}
    </p>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === "dark";

  const avatarLetter = userEmail[0]?.toUpperCase() ?? "A";

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  // ── Sidebar body (shared between desktop + mobile drawer) ──
  function SidebarContent() {
    return (
      <div className="flex h-full flex-col">
        <BrandLogo />

        {/* Nav */}
        <div className="px-5 pb-1 pt-5">
          <SectionLabel>Navigation</SectionLabel>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 pb-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return <NavLink key={item.href} item={item} active={active} onClick={closeMobile} />;
          })}
        </nav>

        {/* Store section */}
        <div className="px-5 pb-1">
          <SectionLabel>Store</SectionLabel>
        </div>
        <div className="px-3 pb-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white/50 transition hover:bg-white/[0.08] hover:text-white/80"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 text-white/35" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View Live Menu
          </a>
        </div>

        {/* User footer */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
              {avatarLetter}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white/90">{userEmail}</p>
              <p className="text-[10px] text-white/45">Administrator</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/40 transition hover:bg-white/10 hover:text-white/80 disabled:opacity-40"
              aria-label="Sign out"
              title="Sign out"
            >
              {signingOut ? <IconSpinner /> : <IconSignOut />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col lg:flex"
        style={{ background: "var(--admin-sidebar-bg)" }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile top bar ── */}
      <div
        className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between px-4 lg:hidden"
        style={{ background: "var(--admin-sidebar-bg)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white">{RESTAURANT_CONFIG.name}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            {isDark ? <IconSun /> : <IconMoon />}
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 w-64 pt-14 lg:hidden"
            style={{ background: "var(--admin-sidebar-bg)" }}
          >
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Mobile top-bar height spacer */}
      <div className="h-14 lg:hidden" aria-hidden="true" />
    </>
  );
}
