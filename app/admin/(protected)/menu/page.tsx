"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

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

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("id", { ascending: true });
    if (error) {
      toast.error("Failed to load menu items");
    } else {
      setFoods(data ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchFoods(); }, [fetchFoods]);

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

  async function toggleAvailability(id: number, current: boolean) {
    setFoods((prev) => prev.map((f) => f.id === id ? { ...f, available: !current } : f));
    const { error } = await supabase.from("menu_items").update({ available: !current }).eq("id", id);
    if (error) {
      toast.error("Failed to update availability");
      setFoods((prev) => prev.map((f) => f.id === id ? { ...f, available: current } : f));
    } else {
      toast.success(!current ? "Marked as available" : "Marked as unavailable");
    }
  }

  async function togglePopular(id: number, current: boolean) {
    setFoods((prev) => prev.map((f) => f.id === id ? { ...f, popular: !current } : f));
    const { error } = await supabase.from("menu_items").update({ popular: !current }).eq("id", id);
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

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">

      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--admin-text-primary)" }}>
            Menu
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--admin-text-secondary)" }}>
            {loading
              ? "Loading…"
              : `${foods.length} items across ${categories.length - 1} categories`}
          </p>
        </div>
        <Link
          href="/admin/menu/new"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.99]"
          style={{ background: "var(--admin-accent)" }}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Item
        </Link>
      </div>

      {/* ── Filters ── */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        {/* Search */}
        <div
          className="flex flex-1 items-center gap-2.5 rounded-lg px-3.5 py-2.5"
          style={{
            background: "var(--admin-card-bg)",
            border: "1px solid var(--admin-border-strong)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            style={{ color: "var(--admin-text-muted)" }}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            placeholder="Search dishes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
            style={{ color: "var(--admin-text-primary)" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ color: "var(--admin-text-muted)" }}
              className="transition hover:opacity-70"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category select */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="admin-input !w-auto min-w-[140px]"
        >
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Veg toggle */}
        <div
          className="flex overflow-hidden rounded-lg"
          style={{ border: "1px solid var(--admin-border-strong)" }}
        >
          {(["all", "veg", "nonveg"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilterVeg(v)}
              className="px-3.5 py-2.5 text-xs font-semibold transition"
              style={
                filterVeg === v
                  ? { background: "var(--admin-accent)", color: "#fff" }
                  : { background: "var(--admin-card-bg)", color: "var(--admin-text-secondary)" }
              }
            >
              {v === "all" ? "All" : v === "veg" ? "🟢 Veg" : "🔴 Non-veg"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div
        className="overflow-hidden rounded-xl"
        style={{
          background: "var(--admin-card-bg)",
          border: "1px solid var(--admin-border)",
        }}
      >
        {/* Table head — desktop */}
        <div
          className="hidden grid-cols-[56px_1fr_80px_130px_80px_100px] items-center gap-4 px-5 py-3 sm:grid"
          style={{ borderBottom: "1px solid var(--admin-border)", background: "var(--admin-bg)" }}
        >
          {["Image", "Name", "Price", "Category", "Available", "Actions"].map((h) => (
            <p
              key={h}
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--admin-text-muted)" }}
            >
              {h}
            </p>
          ))}
        </div>

        {/* States */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20">
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: "var(--admin-accent)" }}
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>Loading menu…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
              style={{ border: "1px solid var(--admin-border)", background: "var(--admin-bg)" }}
            >
              🍽️
            </div>
            <p className="mt-4 text-sm font-medium" style={{ color: "var(--admin-text-secondary)" }}>
              No dishes found
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--admin-text-muted)" }}>
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((food, idx) => (
              <div
                key={food.id}
                className={cn(
                  "flex flex-col gap-3 px-5 py-4 transition sm:grid sm:grid-cols-[56px_1fr_80px_130px_80px_100px] sm:items-center sm:gap-4",
                  !food.available && "opacity-55",
                )}
                style={{
                  borderBottom: idx < filtered.length - 1
                    ? "1px solid var(--admin-border)"
                    : "none",
                }}
              >
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={food.image}
                  alt={food.name}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />

                {/* Name */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        food.veg ? "bg-emerald-500" : "bg-red-500",
                      )}
                    />
                    <p
                      className="truncate text-sm font-semibold"
                      style={{ color: "var(--admin-text-primary)" }}
                    >
                      {food.name}
                    </p>
                    {food.popular && (
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          background: "var(--admin-warning-bg)",
                          color: "var(--admin-warning)",
                        }}
                      >
                        Popular
                      </span>
                    )}
                  </div>
                  <p
                    className="mt-0.5 truncate text-xs"
                    style={{ color: "var(--admin-text-muted)" }}
                  >
                    {food.description.slice(0, 60)}…
                  </p>
                </div>

                {/* Price */}
                <p className="text-sm font-bold" style={{ color: "var(--admin-text-primary)" }}>
                  ₹{food.price}
                </p>

                {/* Category badge */}
                <span
                  className="w-fit rounded-md px-2.5 py-1 text-xs font-medium"
                  style={{
                    background: "var(--admin-accent-light)",
                    color: "var(--admin-accent)",
                  }}
                >
                  {food.category}
                </span>

                {/* Availability toggle */}
                <button
                  onClick={() => toggleAvailability(food.id, food.available)}
                  aria-label={food.available ? "Mark unavailable" : "Mark available"}
                  className={cn("toggle-track", food.available && "on")}
                >
                  <span className="toggle-thumb" />
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  {/* Popular */}
                  <button
                    onClick={() => togglePopular(food.id, food.popular)}
                    title={food.popular ? "Remove from popular" : "Mark as popular"}
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition"
                    style={
                      food.popular
                        ? {
                            background: "var(--admin-warning-bg)",
                            border: "1px solid var(--admin-warning-border)",
                            color: "var(--admin-warning)",
                          }
                        : {
                            background: "var(--admin-bg)",
                            border: "1px solid var(--admin-border)",
                            color: "var(--admin-text-muted)",
                          }
                    }
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill={food.popular ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>

                  {/* Edit */}
                  <Link
                    href={`/admin/menu/${food.id}/edit`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition"
                    style={{
                      background: "var(--admin-bg)",
                      border: "1px solid var(--admin-border)",
                      color: "var(--admin-text-muted)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                    </svg>
                  </Link>

                  {/* Delete */}
                  <button
                    onClick={() => setConfirmDelete(food.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:border-red-300"
                    style={{
                      background: "var(--admin-bg)",
                      border: "1px solid var(--admin-border)",
                      color: "var(--admin-text-muted)",
                    }}
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

      {/* ── Delete modal ── */}
      {confirmDelete !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="w-full max-w-sm rounded-xl p-6 shadow-xl"
            style={{
              background: "var(--admin-card-bg)",
              border: "1px solid var(--admin-border)",
            }}
          >
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                background: "var(--admin-danger-bg)",
                border: "1px solid var(--admin-danger-border)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                style={{ color: "var(--admin-danger)" }}
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <h3 className="text-center text-lg font-bold" style={{ color: "var(--admin-text-primary)" }}>
              Delete item?
            </h3>
            <p className="mt-2 text-center text-sm" style={{ color: "var(--admin-text-secondary)" }}>
              &quot;{foods.find((f) => f.id === confirmDelete)?.name}&quot; will be permanently removed.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="flex-1 rounded-lg py-2.5 text-sm font-medium transition hover:opacity-80 disabled:opacity-40"
                style={{
                  border: "1px solid var(--admin-border-strong)",
                  color: "var(--admin-text-secondary)",
                  background: "var(--admin-card-bg)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                style={{ background: "var(--admin-danger)" }}
              >
                {deleting && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
