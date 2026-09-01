"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { foods } from "@/lib/data";
import { RESTAURANT_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  href?: string;
}

interface QuickAction {
  label: string;
  href: string;
  iconBg: string;
  icon: React.ReactNode;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Add Menu Item",
    href: "/admin/menu/new",
    iconBg: "var(--stat-violet)",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    label: "Manage Tables",
    href: "/admin/tables",
    iconBg: "var(--stat-blue)",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h2v2h-2zM18 14h3M18 18h3M14 18v3M14 20h2" />
      </svg>
    ),
  },
  {
    label: "Edit Categories",
    href: "/admin/categories",
    iconBg: "var(--stat-amber)",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
  {
    label: "Restaurant Settings",
    href: "/admin/settings",
    iconBg: "var(--stat-emerald)",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, iconBg, href }: StatCardProps) {
  const inner = (
    <div
      className="group flex items-center gap-4 rounded-xl p-5 transition hover:shadow-md"
      style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border)" }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-bold leading-tight" style={{ color: "var(--admin-text-primary)" }}>
          {value}
        </p>
        <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--admin-text-secondary)" }}>
          {label}
        </p>
        {sub && <p className="mt-0.5 text-xs" style={{ color: "var(--admin-text-muted)" }}>{sub}</p>}
      </div>
      {href && (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5"
          fill="none" stroke="currentColor" strokeWidth="1.8"
          style={{ color: "var(--admin-text-muted)" }}
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function CardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("overflow-hidden rounded-xl", className)}
      style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border)" }}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--admin-border)" }}>
      <div>
        <h2 className="text-sm font-bold" style={{ color: "var(--admin-text-primary)" }}>{title}</h2>
        {sub && <p className="mt-0.5 text-xs" style={{ color: "var(--admin-text-muted)" }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Derived data ───────────────────────────────────────────────────────────────

const totalItems   = foods.length;
const vegItems     = foods.filter((f) => f.veg).length;
const popularItems = foods.filter((f) => f.popular).length;
const categories   = new Set(foods.map((f) => f.category)).size;

const topItems    = foods.filter((f) => f.popular).sort((a, b) => b.rating - a.rating).slice(0, 5);
const recentItems = [...foods].sort((a, b) => b.id - a.id).slice(0, 5);

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Good day");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">

      {/* Page header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
        <h1 className="mt-1 text-2xl font-bold" style={{ color: "var(--admin-text-primary)" }}>
          {greeting} 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--admin-text-secondary)" }}>
          Here&apos;s an overview of{" "}
          <span className="font-semibold" style={{ color: "var(--admin-text-primary)" }}>
            {RESTAURANT_CONFIG.name}
          </span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Menu Items" value={totalItems}
          sub={`${vegItems} veg · ${totalItems - vegItems} non-veg`}
          href="/admin/menu" iconBg="var(--stat-violet)"
          icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" /></svg>}
        />
        <StatCard
          label="Categories" value={categories} sub="Active sections"
          href="/admin/categories" iconBg="var(--stat-blue)"
          icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 12h16M4 18h16" /></svg>}
        />
        <StatCard
          label="Popular Dishes" value={popularItems} sub="Marked as popular"
          href="/admin/menu" iconBg="var(--stat-amber)"
          icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
        />
        <StatCard
          label="Tax Rate" value={`${Math.round(RESTAURANT_CONFIG.taxRate * 100)}%`}
          sub="Applied to all orders"
          href="/admin/settings" iconBg="var(--stat-emerald)"
          icon={<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>}
        />
      </div>

      {/* Two-column section */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">

        {/* Popular dishes */}
        <CardShell>
          <CardHeader
            title="Popular Dishes"
            sub="Top rated items on your menu"
            action={
              <Link href="/admin/menu" className="text-xs font-semibold transition hover:underline" style={{ color: "var(--admin-accent)" }}>
                View all
              </Link>
            }
          />
          <div>
            {topItems.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-5 py-3.5"
                style={{ borderBottom: idx < topItems.length - 1 ? "1px solid var(--admin-border)" : "none" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" style={{ color: "var(--admin-text-primary)" }}>{item.name}</p>
                  <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{item.category}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold" style={{ color: "var(--admin-text-primary)" }}>₹{item.price}</p>
                  <div className="flex items-center justify-end gap-1">
                    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-amber-400" stroke="currentColor" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{item.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardShell>

        {/* Right column */}
        <div className="space-y-5">

          {/* Quick actions */}
          <CardShell className="p-5">
            <h2 className="mb-1 text-sm font-bold" style={{ color: "var(--admin-text-primary)" }}>Quick Actions</h2>
            <p className="mb-4 text-xs" style={{ color: "var(--admin-text-muted)" }}>Common management tasks</p>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center gap-3 rounded-lg p-3.5 transition hover:shadow-md"
                  style={{ border: "1px solid var(--admin-border)", background: "var(--admin-bg)" }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ background: action.iconBg }}
                  >
                    {action.icon}
                  </div>
                  <span className="text-xs font-semibold leading-tight" style={{ color: "var(--admin-text-secondary)" }}>
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </CardShell>

          {/* Recently added */}
          <CardShell>
            <CardHeader title="Recently Added" />
            <div>
              {recentItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-5 py-3"
                  style={{ borderBottom: idx < recentItems.length - 1 ? "1px solid var(--admin-border)" : "none" }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", item.veg ? "bg-emerald-400" : "bg-red-400")} />
                    <p className="truncate text-sm" style={{ color: "var(--admin-text-primary)" }}>{item.name}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{item.category}</span>
                    <Link
                      href={`/admin/menu/${item.id}/edit`}
                      className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-[var(--admin-accent-light)]"
                      style={{ color: "var(--admin-text-muted)" }}
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardShell>
        </div>
      </div>

      {/* WhatsApp strip */}
      <div
        className="mt-5 flex items-center gap-4 rounded-xl px-5 py-4"
        style={{ background: "var(--admin-success-bg)", border: "1px solid var(--admin-success-border)" }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "var(--admin-success-bg)", border: "1px solid var(--admin-success-border)" }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#25D366]">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold" style={{ color: "var(--admin-text-primary)" }}>Orders via WhatsApp</p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--admin-text-secondary)" }}>
            Customer orders are sent to{" "}
            <span className="font-mono font-semibold">+{RESTAURANT_CONFIG.whatsappNumber}</span>
          </p>
        </div>
        <Link
          href="/admin/settings"
          className="shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition hover:opacity-90"
          style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border)", color: "var(--admin-text-secondary)" }}
        >
          Edit
        </Link>
      </div>
    </div>
  );
}
