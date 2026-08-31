"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface DbCategory {
  id: number;
  name: string;
  sort_order: number;
}

const LOCKED = ["All", "Popular"] as const;

export default function CategoriesPage() {
  const supabase = createClient();

  const [cats, setCats] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);
  const dragOverId = useRef<number | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchCats = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, sort_order")
      .order("sort_order", { ascending: true });

    if (error) {
      toast.error("Failed to load categories");
      console.error(error);
    } else {
      setCats(data ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchCats(); }, [fetchCats]);

  // ── Add ──────────────────────────────────────────────────────────────────────
  async function addCategory() {
    const name = newName.trim();
    if (!name) return toast.error("Category name is required");
    if (cats.some((c) => c.name.toLowerCase() === name.toLowerCase()))
      return toast.error("Category already exists");

    setAdding(true);
    const nextOrder = cats.length > 0 ? Math.max(...cats.map((c) => c.sort_order)) + 1 : 1;

    const { data, error } = await supabase
      .from("categories")
      .insert({ name, sort_order: nextOrder })
      .select()
      .single();

    if (error) {
      toast.error(error.message || "Failed to add category");
    } else {
      setCats((prev) => [...prev, data]);
      setNewName("");
      toast.success(`"${name}" added`);
    }
    setAdding(false);
  }

  // ── Edit ─────────────────────────────────────────────────────────────────────
  function startEdit(cat: DbCategory) {
    setEditingId(cat.id);
    setEditValue(cat.name);
  }

  async function saveEdit(id: number) {
    const name = editValue.trim();
    if (!name) return toast.error("Name cannot be empty");
    if (cats.some((c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase()))
      return toast.error("Category already exists");

    setSavingEdit(true);
    const { error } = await supabase
      .from("categories")
      .update({ name })
      .eq("id", id);

    if (error) {
      toast.error(error.message || "Failed to update category");
    } else {
      setCats((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
      setEditingId(null);
      toast.success("Category updated");
    }
    setSavingEdit(false);
  }

  // ── Delete ───────────────────────────────────────────────────────────────────
  async function deleteCategory(id: number) {
    setDeletingId(id);
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      toast.error(error.message || "Failed to delete category");
    } else {
      setCats((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category removed");
    }
    setDeletingId(null);
  }

  // ── Drag-to-reorder ──────────────────────────────────────────────────────────
  function handleDragStart(id: number) { setDragId(id); }
  function handleDragOver(e: React.DragEvent, id: number) {
    e.preventDefault();
    dragOverId.current = id;
  }

  async function handleDrop() {
    if (!dragId || !dragOverId.current || dragId === dragOverId.current) {
      setDragId(null);
      return;
    }

    // Build new order locally
    const reordered = [...cats];
    const fromIdx = reordered.findIndex((c) => c.id === dragId);
    const toIdx   = reordered.findIndex((c) => c.id === dragOverId.current);
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    // Assign new sort_order values
    const updated = reordered.map((c, i) => ({ ...c, sort_order: i + 1 }));
    setCats(updated); // optimistic
    setDragId(null);
    dragOverId.current = null;

    // Persist all changed sort_orders to Supabase
    const upserts = updated.map(({ id, name, sort_order }) => ({ id, name, sort_order }));
    const { error } = await supabase.from("categories").upsert(upserts);

    if (error) {
      toast.error("Failed to save new order");
      fetchCats(); // rollback by re-fetching
    } else {
      toast.success("Order saved");
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <p className="mt-1 text-sm text-white/45">
          Manage menu sections · changes reflect on the customer menu instantly.
        </p>
      </div>

      {/* ── System (locked) ── */}
      <div className="mb-4 rounded-2xl border border-white/6 bg-white/4 p-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/35">
          System (locked)
        </h2>
        <div className="flex flex-wrap gap-2">
          {LOCKED.map((name) => (
            <div key={name} className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/6 px-4 py-2.5">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-sm font-medium text-white/60">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Editable categories ── */}
      <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
        <div className="border-b border-white/6 px-5 py-4">
          <h2 className="text-sm font-bold text-white">Menu Categories</h2>
          <p className="mt-0.5 text-xs text-white/35">
            {loading ? "Loading…" : `${cats.length} categories · drag to reorder`}
          </p>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="divide-y divide-white/4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <div className="h-4 w-4 animate-pulse rounded bg-white/8" />
                <div className="h-6 w-6 animate-pulse rounded-lg bg-white/8" />
                <div className="h-4 flex-1 animate-pulse rounded bg-white/8" />
              </div>
            ))}
          </div>
        ) : cats.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-white/40">No categories yet. Add one below.</p>
          </div>
        ) : (
          <div
            className="divide-y divide-white/4"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {cats.map((cat, idx) => (
              <div
                key={cat.id}
                draggable
                onDragStart={() => handleDragStart(cat.id)}
                onDragOver={(e) => handleDragOver(e, cat.id)}
                className={cn(
                  "flex items-center gap-3 px-5 py-3.5 transition select-none",
                  dragId === cat.id ? "opacity-40 bg-white/4" : "hover:bg-white/2",
                )}
              >
                {/* Drag handle */}
                <div className="cursor-grab text-white/20 active:cursor-grabbing shrink-0">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <circle cx="9" cy="7" r="1.5" />  <circle cx="15" cy="7" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" /> <circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="17" r="1.5" /> <circle cx="15" cy="17" r="1.5" />
                  </svg>
                </div>

                {/* Order badge */}
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/6 text-[10px] font-bold text-white/40">
                  {idx + 1}
                </span>

                {/* Name / inline edit */}
                {editingId === cat.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(cat.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 rounded-lg border border-[#a96534]/50 bg-white/8 px-3 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#a96534]/20"
                  />
                ) : (
                  <span className="flex-1 text-sm font-medium text-white">{cat.name}</span>
                )}

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1.5">
                  {editingId === cat.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(cat.id)}
                        disabled={savingEdit}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-40"
                      >
                        {savingEdit ? (
                          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white/40 transition hover:text-white/70"
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(cat)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white/35 transition hover:border-[#a96534]/40 hover:bg-[#a96534]/10 hover:text-[#d4894f]"
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        disabled={deletingId === cat.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-white/5 text-white/35 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                      >
                        {deletingId === cat.id ? (
                          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Add new ── */}
        <div className="border-t border-white/6 px-5 py-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !adding && addCategory()}
              placeholder="New category name…"
              disabled={adding}
              className="flex-1 rounded-xl border border-white/10 bg-white/8 px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-[#a96534]/60 focus:ring-2 focus:ring-[#a96534]/20 disabled:opacity-50"
            />
            <button
              onClick={addCategory}
              disabled={adding || !newName.trim()}
              className="flex items-center gap-2 rounded-xl bg-[#a96534] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#a96534]/20 transition hover:bg-[#c07840] active:scale-[0.98] disabled:opacity-50"
            >
              {adding ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              )}
              Add
            </button>
          </div>
        </div>
      </div>

      {/* ── Info strip ── */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#a96534]/15 bg-[#a96534]/5 px-5 py-4">
        <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-[#d4894f]" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <p className="text-xs leading-relaxed text-white/50">
          Deleting a category does <span className="text-white/70 font-medium">not</span> delete
          menu items in it — they will still appear under their original category name on the menu.
          Rename first, then reassign items if needed.
        </p>
      </div>
    </div>
  );
}
