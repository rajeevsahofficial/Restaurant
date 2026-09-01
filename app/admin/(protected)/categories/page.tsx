"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Category {
  id: number;
  name: string;
  sort_order: number;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const LOCKED_CATEGORIES = ["All", "Popular"] as const;

// ── Sub-components ─────────────────────────────────────────────────────────────

function Spinner({ cls = "h-3.5 w-3.5" }: { cls?: string }) {
  return (
    <svg className={cn(cls, "animate-spin")} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: i < 4 ? "1px solid var(--admin-border)" : "none" }}
        >
          <div className="skeleton h-4 w-4 rounded" />
          <div className="skeleton h-6 w-6 rounded-md" />
          <div className="skeleton h-4 flex-1 rounded" />
        </div>
      ))}
    </>
  );
}

const actionBtnBase: React.CSSProperties = {
  border: "1px solid var(--admin-border)",
  color: "var(--admin-text-muted)",
  background: "var(--admin-bg)",
};

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const supabase = createClient();

  const [cats, setCats]             = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [newName, setNewName]       = useState("");
  const [adding, setAdding]         = useState(false);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editValue, setEditValue]   = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dragId, setDragId]         = useState<number | null>(null);
  const dragOverId                  = useRef<number | null>(null);

  const fetchCats = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories").select("id, name, sort_order").order("sort_order", { ascending: true });
    if (error) toast.error("Failed to load categories");
    else setCats(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchCats(); }, [fetchCats]);

  async function addCategory() {
    const name = newName.trim();
    if (!name) return toast.error("Category name is required");
    if (cats.some((c) => c.name.toLowerCase() === name.toLowerCase()))
      return toast.error("Category already exists");

    setAdding(true);
    const nextOrder = cats.length > 0 ? Math.max(...cats.map((c) => c.sort_order)) + 1 : 1;
    const { data, error } = await supabase.from("categories").insert({ name, sort_order: nextOrder }).select().single();
    if (error) toast.error(error.message || "Failed to add");
    else { setCats((prev) => [...prev, data]); setNewName(""); toast.success(`"${name}" added`); }
    setAdding(false);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditValue(cat.name);
  }

  async function saveEdit(id: number) {
    const name = editValue.trim();
    if (!name) return toast.error("Name cannot be empty");
    if (cats.some((c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase()))
      return toast.error("Category already exists");

    setSavingEdit(true);
    const { error } = await supabase.from("categories").update({ name }).eq("id", id);
    if (error) toast.error(error.message || "Failed to update");
    else { setCats((prev) => prev.map((c) => c.id === id ? { ...c, name } : c)); setEditingId(null); toast.success("Category updated"); }
    setSavingEdit(false);
  }

  async function deleteCategory(id: number) {
    setDeletingId(id);
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message || "Failed to delete");
    else { setCats((prev) => prev.filter((c) => c.id !== id)); toast.success("Category removed"); }
    setDeletingId(null);
  }

  // ── Drag & drop ──

  function handleDragStart(id: number) { setDragId(id); }
  function handleDragOver(e: React.DragEvent, id: number) { e.preventDefault(); dragOverId.current = id; }

  async function handleDrop() {
    if (!dragId || !dragOverId.current || dragId === dragOverId.current) {
      setDragId(null);
      return;
    }
    const reordered = [...cats];
    const fromIdx = reordered.findIndex((c) => c.id === dragId);
    const toIdx   = reordered.findIndex((c) => c.id === dragOverId.current);
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    const updated = reordered.map((c, i) => ({ ...c, sort_order: i + 1 }));
    setCats(updated);
    setDragId(null);
    dragOverId.current = null;

    const { error } = await supabase.from("categories").upsert(
      updated.map(({ id, name, sort_order }) => ({ id, name, sort_order })),
    );
    if (error) { toast.error("Failed to save new order"); fetchCats(); }
    else toast.success("Order saved");
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--admin-text-primary)" }}>Categories</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--admin-text-secondary)" }}>
          Manage menu sections · changes reflect on the customer menu instantly.
        </p>
      </div>

      {/* Locked system categories */}
      <div className="mb-4 rounded-xl p-5" style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border)" }}>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--admin-text-muted)" }}>
          System (locked)
        </p>
        <div className="flex flex-wrap gap-2">
          {LOCKED_CATEGORIES.map((name) => (
            <div
              key={name}
              className="flex items-center gap-2 rounded-lg px-4 py-2"
              style={{ border: "1px solid var(--admin-border-strong)", background: "var(--admin-bg)", color: "var(--admin-text-secondary)" }}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: "var(--admin-text-muted)" }}>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-sm font-medium">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Editable list */}
      <div className="overflow-hidden rounded-xl" style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--admin-border)" }}>
          <div>
            <h2 className="text-sm font-bold" style={{ color: "var(--admin-text-primary)" }}>Menu Categories</h2>
            <p className="mt-0.5 text-xs" style={{ color: "var(--admin-text-muted)" }}>
              {loading ? "Loading…" : `${cats.length} categories · drag to reorder`}
            </p>
          </div>
        </div>

        {loading ? (
          <SkeletonRows />
        ) : cats.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: "var(--admin-text-secondary)" }}>No categories yet. Add one below.</p>
          </div>
        ) : (
          <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
            {cats.map((cat, idx) => (
              <div
                key={cat.id}
                draggable
                onDragStart={() => handleDragStart(cat.id)}
                onDragOver={(e) => handleDragOver(e, cat.id)}
                className={cn(
                  "flex items-center gap-3 px-5 py-3.5 select-none transition",
                  dragId === cat.id && "opacity-40",
                )}
                style={{
                  borderBottom: idx < cats.length - 1 ? "1px solid var(--admin-border)" : "none",
                  background: dragId === cat.id ? "var(--admin-bg)" : "var(--admin-card-bg)",
                }}
              >
                {/* Drag handle */}
                <div className="cursor-grab active:cursor-grabbing shrink-0" style={{ color: "var(--admin-text-muted)" }}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <circle cx="9"  cy="7"  r="1.5" /><circle cx="15" cy="7"  r="1.5" />
                    <circle cx="9"  cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                    <circle cx="9"  cy="17" r="1.5" /><circle cx="15" cy="17" r="1.5" />
                  </svg>
                </div>

                {/* Order badge */}
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold"
                  style={{ background: "var(--admin-bg)", border: "1px solid var(--admin-border)", color: "var(--admin-text-muted)" }}
                >
                  {idx + 1}
                </span>

                {/* Name or edit input */}
                {editingId === cat.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")  saveEdit(cat.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="admin-input flex-1 py-1.5"
                  />
                ) : (
                  <span className="flex-1 text-sm font-medium" style={{ color: "var(--admin-text-primary)" }}>
                    {cat.name}
                  </span>
                )}

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1.5">
                  {editingId === cat.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(cat.id)}
                        disabled={savingEdit}
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:opacity-80 disabled:opacity-40"
                        style={{ background: "var(--admin-success-bg)", border: "1px solid var(--admin-success-border)", color: "var(--admin-success)" }}
                      >
                        {savingEdit ? <Spinner /> : (
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:opacity-80"
                        style={{ border: "1px solid var(--admin-border-strong)", color: "var(--admin-text-secondary)", background: "var(--admin-card-bg)" }}
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
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:opacity-80"
                        style={actionBtnBase}
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        disabled={deletingId === cat.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:border-red-300 disabled:opacity-40"
                        style={actionBtnBase}
                      >
                        {deletingId === cat.id ? <Spinner /> : (
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

        {/* Add new */}
        <div className="px-5 py-4" style={{ borderTop: "1px solid var(--admin-border)" }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !adding && addCategory()}
              placeholder="New category name…"
              disabled={adding}
              className="admin-input flex-1 disabled:opacity-50"
            />
            <button
              onClick={addCategory}
              disabled={adding || !newName.trim()}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
              style={{ background: "var(--admin-accent)" }}
            >
              {adding ? <Spinner cls="h-4 w-4" /> : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              )}
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div
        className="mt-4 flex items-start gap-3 rounded-xl px-5 py-4"
        style={{ background: "var(--admin-info-bg)", border: "1px solid var(--admin-info-border)" }}
      >
        <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: "var(--admin-info)" }}>
          <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
        </svg>
        <p className="text-xs leading-relaxed" style={{ color: "var(--admin-text-secondary)" }}>
          Deleting a category does{" "}
          <span className="font-semibold" style={{ color: "var(--admin-text-primary)" }}>not</span>{" "}
          delete menu items in it — they will still appear under their original category name. Rename first, then reassign items if needed.
        </p>
      </div>
    </div>
  );
}
