"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { foods } from "@/lib/data";
import { RESTAURANT_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

// ── Static stats derived from the local data (replace with Supabase queries later) ──
function getStats() {
  const totalItems = foods.length;
  const vegItems = foods.filter((f) => f.veg).length;
  const popularItems = foods.filter((f) => f.popular).length;
  const categories = [...new Set(foods.map((f) => f.category))].length;
  return { totalItems, vegItems, popularItems, categories };
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
  href?: string;
}

function StatCard({ label, value, sub, icon, accent, href }: StatCardProps) {
  const inner = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/6 bg-white/4 p-5 transition-all duration-200",
        href && "hover:border-white/12 hover:bg-white/6 cursor-pointer",
      )}
    >
      <div className={cn("absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10 blur-2xl", accent)} />
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/8", accent.replace("bg-", "bg-") + "/15")}>
          <span className="text-white/70">{icon}</span>
        </div>
        {href && (
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-white/20 transition group-hover:text-white/50" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-sm font-medium text-white/55">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-white/30">{sub}</p>}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function DashboardPage() {
  const { totalItems, vegItems, popularItems, categories } = getStats();
  const [greeting, setGreeting] = useState("Good day");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const topItems = foods
    .filter((f) => f.popular)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  const recentItems = [...foods]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* ── Page header ── */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/35">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">{greeting} 👋</h1>
        <p className="mt-1 text-sm text-white/45">
          Here&apos;s an overview of <span className="text-white/70 font-medium">{RESTAURANT_CONFIG.name}</span>
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Menu Items"
          value={totalItems}
          sub={`${vegItems} veg · ${totalItems - vegItems} non-veg`}
          href="/admin/menu"
          accent="bg-violet-500"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
          }
        />
        <StatCard
          label="Categories"
          value={categories}
          sub="Active sections"
          href="/admin/categories"
          accent="bg-sky-500"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          }
        />
        <StatCard
          label="Popular Dishes"
          value={popularItems}
          sub="Marked as popular"
          href="/admin/menu"
          accent="bg-amber-500"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
        />
        <StatCard
          label="Tax Rate"
          value={`${Math.round(RESTAURANT_CONFIG.taxRate * 100)}%`}
          sub="Applied to all orders"
          href="/admin/settings"
          accent="bg-emerald-500"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="19" y1="5" x2="5" y2="19" />
              <circle cx="6.5" cy="6.5" r="2.5" />
              <circle cx="17.5" cy="17.5" r="2.5" />
            </svg>
          }
        />
      </div>

      {/* ── Two-column section ── */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">

        {/* Popular items */}
        <div className="rounded-2xl border border-white/6 bg-white/4 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-white">Popular Dishes</h2>
              <p className="mt-0.5 text-xs text-white/35">Top rated items on your menu</p>
            </div>
            <Link
              href="/admin/menu"
              className="text-xs font-medium text-[#d4894f] hover:text-[#e9a870] transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-white/4">
            {topItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-10 w-10 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{item.name}</p>
                  <p className="text-xs text-white/35">{item.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-white">₹{item.price}</p>
                  <div className="flex items-center justify-end gap-1">
                    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-amber-400 text-amber-400" stroke="currentColor" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="text-xs text-white/45">{item.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions + recent items */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="rounded-2xl border border-white/6 bg-white/4 p-5">
            <h2 className="text-sm font-bold text-white">Quick Actions</h2>
            <p className="mt-0.5 mb-4 text-xs text-white/35">Common management tasks</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Add Menu Item", href: "/admin/menu/new", icon: "➕", color: "from-violet-600/20 to-violet-600/5" },
                { label: "Manage Tables", href: "/admin/tables", icon: "🪑", color: "from-sky-600/20 to-sky-600/5" },
                { label: "Edit Categories", href: "/admin/categories", icon: "📋", color: "from-amber-600/20 to-amber-600/5" },
                { label: "Restaurant Settings", href: "/admin/settings", icon: "⚙️", color: "from-emerald-600/20 to-emerald-600/5" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={cn(
                    "group flex flex-col gap-2 rounded-xl bg-gradient-to-br p-4 transition hover:scale-[1.02] active:scale-[0.98]",
                    action.color,
                    "border border-white/6 hover:border-white/12",
                  )}
                >
                  <span className="text-2xl">{action.icon}</span>
                  <span className="text-xs font-semibold text-white/80 group-hover:text-white">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recently added */}
          <div className="rounded-2xl border border-white/6 bg-white/4 overflow-hidden">
            <div className="border-b border-white/6 px-5 py-4">
              <h2 className="text-sm font-bold text-white">Recently Added</h2>
            </div>
            <div className="divide-y divide-white/4">
              {recentItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn("h-2 w-2 shrink-0 rounded-full", item.veg ? "bg-emerald-400" : "bg-red-400")} />
                    <p className="truncate text-sm text-white/80">{item.name}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-white/35">{item.category}</span>
                    <Link
                      href={`/admin/menu/${item.id}/edit`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/8 hover:text-white/60"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── WhatsApp info strip ── */}
      <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[#25D366]/15 bg-[#25D366]/5 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#25D366]">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Orders via WhatsApp</p>
          <p className="mt-0.5 text-xs text-white/40">
            Customer orders are sent to{" "}
            <span className="font-mono text-white/60">+{RESTAURANT_CONFIG.whatsappNumber}</span>
          </p>
        </div>
        <Link
          href="/admin/settings"
          className="shrink-0 rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-white/60 transition hover:border-white/20 hover:text-white"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}
