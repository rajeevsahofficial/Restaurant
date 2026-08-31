"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Food, Customization } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const DEFAULT_CATEGORIES = [
  "Starters", "Soups", "Main Course", "Breads",
  "Biryani & Rice", "Desserts", "Drinks",
];

interface MenuItemFormProps {
  initialData?: Partial<Food> & { dbId?: number }; // dbId = Supabase row id
  mode: "new" | "edit";
}

export default function MenuItemForm({ initialData = {}, mode }: MenuItemFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(initialData.name ?? "");
  const [description, setDescription] = useState(initialData.description ?? "");
  const [price, setPrice] = useState(String(initialData.price ?? ""));
  const [category, setCategory] = useState(initialData.category ?? DEFAULT_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [useCustomCategory, setUseCustomCategory] = useState(
    !!initialData.category && !DEFAULT_CATEGORIES.includes(initialData.category),
  );
  const [veg, setVeg] = useState(initialData.veg ?? true);
  const [popular, setPopular] = useState(initialData.popular ?? false);
  const [image, setImage] = useState(initialData.image ?? "");
  const [rating, setRating] = useState(String(initialData.rating ?? "4.5"));
  const [reviews, setReviews] = useState(String(initialData.reviews ?? "0"));
  const [customizations, setCustomizations] = useState<Customization[]>(
    initialData.customizations ?? [],
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!description.trim()) e.description = "Description is required";
    if (!price || isNaN(Number(price)) || Number(price) <= 0) e.price = "Enter a valid price";
    if (useCustomCategory && !customCategory.trim()) e.category = "Category name is required";
    if (!image.trim()) e.image = "Image URL is required";
    return e;
  }

  function addCustomization() {
    setCustomizations((prev) => [...prev, { label: "", options: [""], defaultIndex: 0 }]);
  }

  function updateCustomization(index: number, field: keyof Customization, value: string | string[] | number) {
    setCustomizations((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  }

  function addOption(custIndex: number) {
    setCustomizations((prev) =>
      prev.map((c, i) => i === custIndex ? { ...c, options: [...c.options, ""] } : c),
    );
  }

  function updateOption(custIndex: number, optIndex: number, value: string) {
    setCustomizations((prev) =>
      prev.map((c, i) =>
        i === custIndex
          ? { ...c, options: c.options.map((o, j) => (j === optIndex ? value : o)) }
          : c,
      ),
    );
  }

  function removeOption(custIndex: number, optIndex: number) {
    setCustomizations((prev) =>
      prev.map((c, i) =>
        i === custIndex ? { ...c, options: c.options.filter((_, j) => j !== optIndex) } : c,
      ),
    );
  }

  function removeCustomization(index: number) {
    setCustomizations((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Fix the errors before saving");
      return;
    }
    setErrors({});
    setSaving(true);

    const finalCategory = useCustomCategory ? customCategory.trim() : category;
    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: Math.round(Number(price)),
      category: finalCategory,
      veg,
      popular,
      available: initialData.available ?? true,
      image: image.trim(),
      rating: parseFloat(rating) || 4.5,
      reviews: parseInt(reviews, 10) || 0,
      customizations: customizations.filter((c) => c.label && c.options.length > 0),
    };

    let dbError = null;

    if (mode === "new") {
      const { error } = await supabase.from("menu_items").insert(payload);
      dbError = error;
    } else {
      // Use dbId (Supabase bigserial id) if available, fall back to Food.id
      const rowId = initialData.dbId ?? initialData.id;
      const { error } = await supabase
        .from("menu_items")
        .update(payload)
        .eq("id", rowId);
      dbError = error;
    }

    if (dbError) {
      console.error(dbError);
      toast.error(dbError.message || "Something went wrong. Please try again.");
      setSaving(false);
      return;
    }

    toast.success(mode === "new" ? "Item added to menu!" : "Item updated!");
    router.push("/admin/menu");
    router.refresh();
  }

  // ── Field wrapper ──────────────────────────────────────────────────────────
  const Field = ({
    label, error, required, children,
  }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-widest text-white/50">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>

      {/* ── Basic info ── */}
      <div className="rounded-2xl border border-white/6 bg-white/4 p-5 space-y-5">
        <h2 className="text-sm font-bold text-white">Basic Information</h2>

        <Field label="Dish Name" error={errors.name} required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Paneer Tikka"
            className={cn(inputCls, errors.name && ringError)}
          />
        </Field>

        <Field label="Description" error={errors.description} required>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the dish — ingredients, cooking style, accompaniments…"
            className={cn(inputCls, "resize-none", errors.description && ringError)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (₹)" error={errors.price} required>
            <input
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="249"
              className={cn(inputCls, errors.price && ringError)}
            />
          </Field>
          <Field label="Image URL" error={errors.image} required>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://…"
              className={cn(inputCls, errors.image && ringError)}
            />
          </Field>
        </div>

        {image && (
          <div className="overflow-hidden rounded-xl border border-white/8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="Preview"
              className="h-40 w-full object-cover"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
          </div>
        )}
      </div>

      {/* ── Category & flags ── */}
      <div className="rounded-2xl border border-white/6 bg-white/4 p-5 space-y-5">
        <h2 className="text-sm font-bold text-white">Category & Flags</h2>

        <Field label="Category" error={errors.category} required>
          {useCustomCategory ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="New category name"
                className={cn(inputCls, "flex-1", errors.category && ringError)}
              />
              <button
                type="button"
                onClick={() => setUseCustomCategory(false)}
                className="rounded-xl border border-white/10 px-3 text-xs text-white/50 hover:text-white/80"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={cn(inputCls, "flex-1 [&>option]:bg-[#1a1816]")}
              >
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setUseCustomCategory(true)}
                className="rounded-xl border border-white/10 px-3 text-xs text-white/50 hover:text-white/80 whitespace-nowrap"
              >
                + New
              </button>
            </div>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Rating">
            <input
              type="number"
              min="1" max="5" step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Review Count">
            <input
              type="number"
              min="0"
              value={reviews}
              onChange={(e) => setReviews(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="flex gap-4">
          <ToggleChip label="Vegetarian" active={veg} color="emerald" onClick={() => setVeg((v) => !v)} />
          <ToggleChip label="⭐ Popular" active={popular} color="amber" onClick={() => setPopular((v) => !v)} />
        </div>
      </div>

      {/* ── Customizations ── */}
      <div className="rounded-2xl border border-white/6 bg-white/4 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Customizations</h2>
            <p className="mt-0.5 text-xs text-white/35">Optional — e.g. Spice level, Portion size</p>
          </div>
          <button
            type="button"
            onClick={addCustomization}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-white/60 transition hover:border-white/20 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add group
          </button>
        </div>

        {customizations.map((cust, ci) => (
          <div key={ci} className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={cust.label}
                onChange={(e) => updateCustomization(ci, "label", e.target.value)}
                placeholder="Label (e.g. Spice Level)"
                className={cn(inputCls, "flex-1 text-sm")}
              />
              <button
                type="button"
                onClick={() => removeCustomization(ci)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              {cust.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateCustomization(ci, "defaultIndex", oi)}
                    title="Set as default"
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                      cust.defaultIndex === oi
                        ? "border-[#a96534] bg-[#a96534]"
                        : "border-white/20 hover:border-white/50",
                    )}
                  >
                    {cust.defaultIndex === oi && (
                      <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 text-white" fill="currentColor">
                        <circle cx="12" cy="12" r="5" />
                      </svg>
                    )}
                  </button>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(ci, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}`}
                    className={cn(inputCls, "flex-1 text-sm py-2")}
                  />
                  {cust.options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOption(ci, oi)}
                      className="text-white/25 transition hover:text-white/60"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addOption(ci)}
              className="text-xs text-[#d4894f] hover:text-[#e9a870] transition-colors"
            >
              + Add option
            </button>
          </div>
        ))}
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-3 pb-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-white/60 transition hover:border-white/20 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#a96534] to-[#7a4825] py-3 text-sm font-semibold text-white shadow-lg shadow-[#a96534]/20 transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </>
          ) : mode === "new" ? "Add to Menu" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function ToggleChip({ label, active, color, onClick }: {
  label: string; active: boolean; color: "emerald" | "amber"; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition",
        active && color === "emerald" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        active && color === "amber"   && "border-amber-500/30 bg-amber-500/10 text-amber-400",
        !active && "border-white/8 bg-white/5 text-white/40 hover:text-white/70",
      )}
    >
      <div className={cn(
        "h-2 w-2 rounded-full",
        active && color === "emerald" && "bg-emerald-400",
        active && color === "amber"   && "bg-amber-400",
        !active && "bg-white/20",
      )} />
      {label}
    </button>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-[#a96534]/60 focus:ring-2 focus:ring-[#a96534]/20";

const ringError = "border-red-400/60 ring-1 ring-red-400/30";
