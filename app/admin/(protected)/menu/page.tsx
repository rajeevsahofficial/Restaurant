"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// Row shape returned from Supabase
interface DbMenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  category: string;
  veg: boolean;
  popular: boolean;
  available: boolean;
  image: string;
  customizations: unknown[];
}

export default function MenuPage() {
  const supabase = createClient();
  const [foods, setFoods] = useState<DbMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterVeg, setFilterVeg] = useState<"all" | "veg" | "nonveg">("all");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchFoods = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      toast.error("Failed to load menu items");
      console.error(error);
    } else {
      setFoods(data ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchFoods(); }, [fetchFoods]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(foods.map((f) => f.category)))],
    [foods],
  );

  const filtered = useMemo(() => foods.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "All" || f.category === filterCategory;
    const matchVeg =
      filterVeg === "all" ||
      (filterVeg === "veg" && f.veg) ||
      (filterVeg === "nonveg" && !f.veg);
    return matchSearch && matchCat && matchVeg;
  }), [foods, search, filterCategory, filterVeg]);

  // ── Mutations ────────────────────────────────────────────────────────────────
  async function toggleAvailability(id: number, current: boolean) {
    // Optimistic update
    setFoods((prev) => prev.map((f) => f.id === id ? { ...f, available: !current } : f));

    const { error } = await supabase
      .from("menu_items")
      .update({ available: !current })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update availability");
      setFoods((prev) => prev.map((f) => f.id === id ? { ...f, available: current } : f)); // rollback
    } else {
      toast.success(!current ? "Marked as available" : "Marked as unavailable");
    }
  }

  async function togglePopular(id: number, current: boolean) {
    setFoods((prev) => prev.map((f) => f.id === id ? { ...f, popular: !current } : f));

    const { error } = await supabase
      .from("menu_items")
      .update({ popular: !current })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update popular status");
      setFoods((prev) => prev.map((f) => f.id === id ? { ...f, popular: current } : f));
    } else {
      toast.success(!current ? "Marked as popular" : "Removed from popular");
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    const { error } = await supabase.from("menu_items").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete item");
    } else {
      setFoods((prev) => prev.filter((f) => f.id !== id));
      toast.success("Item deleted");
    }
    setConfirmDelete(null);
    setDeleting(false);
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Menu</h1>
          <p className="mt-1 text-sm text-white/45">
            {loading ? "Loading…" : `${foods.length} items across ${categories.length - 1} categories`}
          </p>
        </div>
        <Link
          href="/admin/menu/new"
          className="flex items-center gap-2 rounded-xl bg-[#a96534] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#a96534]/20 transition hover:bg-[#c07840] active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Item
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-white/8 bg-white/5 px-4 py-2.5">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-white/35" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            placeholder="Search dishes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-white/30 hover:text-white/60">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white outline-none [&>option]:bg-[#1a1816]"
        >
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="flex overflow-hidden rounded-xl border border-white/8">
          {(["all", "veg", "nonveg"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilterVeg(v)}
              className={cn(
                "px-3 py-2 text-xs font-semibold transition",
                filterVeg === v ? "bg-[#a96534] text-white" : "bg-white/5 text-white/45 hover:bg-white/8 hover:text-white/70",
              )}
            >
              {v === "all" ? "All" : v === "veg" ? "🟢 Veg" : "🔴 Non-veg"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
        <div className="hidden grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 border-b border-white/6 px-5 py-3 sm:grid">
          {["Image", "Name", "Price", "Category", "Available", "Actions"].map((h) => (
            <p key={h} className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{h}</p>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20">
            <svg className="h-5 w-5 animate-spin text-[#a96534]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-white/40">Loading menu…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/8 bg-white/4 text-3xl">🍽️</div>
            <p className="mt-4 text-sm font-medium text-white/60">No dishes found</p>
            <p className="mt-1 text-xs text-white/30">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-white/4">
            {filtered.map((food) => (
              <div
                key={food.id}
                className={cn(
                  "flex flex-col gap-3 px-5 py-4 transition hover:bg-white/2 sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto_auto] sm:items-center sm:gap-4",
                  !food.available && "opacity-50",
                )}
              >
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={food.image} alt={food.name} className="h-12 w-12 shrink-0 rounded-xl object-cover" />

                {/* Name */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 shrink-0 rounded-full", food.veg ? "bg-emerald-400" : "bg-red-400")} />
                    <p className="truncate text-sm font-semibold text-white">{food.name}</p>
                    {food.popular && (
                      <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">Popular</span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-white/35">{food.description.slice(0, 60)}…</p>
                </div>

                {/* Price */}
                <p className="text-sm font-bold text-white">₹{food.price}</p>

                {/* Category */}
                <span className="whitespace-nowrap rounded-lg border border-white/8 bg-white/5 px-2.5 py-1 text-xs text-white/60">
                  {food.category}
                </span>

                {/* Availability toggle */}
                <button
                  onClick={() => toggleAvailability(food.id, food.available)}
                  className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full border transition-all duration-200",
                    food.available
                      ? "border-emerald-500/30 bg-emerald-500/20"
                      : "border-white/10 bg-white/8",
                  )}
                  aria-label={food.available ? "Mark unavailable" : "Mark available"}
                >
                  <span className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full shadow transition-all duration-200",
                    food.available ? "left-[22px] bg-emerald-400" : "left-0.5 bg-white/30",
                  )} />
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  {/* Popular star */}
                  <button
                    onClick={() => togglePopular(food.id, food.popular)}
                    title={food.popular ? "Remove from popular" : "Mark as popular"}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg border transition",
                      food.popular
                        ? "border-amber-500/30 bg-amber-500/15 text-amber-400"
                        : "border-white/8 bg-white/5 text-white/30 hover:text-white/60",
                    )}
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={food.popular ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>

                  {/* Edit */}
                  <Link
                    href={`/admin/menu/${food.id}/edit`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white/40 transition hover:border-[#a96534]/40 hover:bg-[#a96534]/10 hover:text-[#d4894f]"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                    </svg>
                  </Link>

                  {/* Delete */}
                  <button
                    onClick={() => setConfirmDelete(food.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white/40 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/8 bg-[#161412] p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.8">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <h3 className="text-center text-lg font-bold text-white">Delete item?</h3>
            <p className="mt-1.5 text-center text-sm text-white/45">
              &quot;{foods.find((f) => f.id === confirmDelete)?.name}&quot; will be permanently removed from the database.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-white/60 transition hover:border-white/20 hover:text-white disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/15 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/25 disabled:opacity-40"
              >
                {deleting ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
