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
  initialData?: Partial<Food> & { dbId?: number };
  mode: "new" | "edit";
}

export default function MenuItemForm({ initialData = {}, mode }: MenuItemFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName]           = useState(initialData.name ?? "");
  const [description, setDesc]    = useState(initialData.description ?? "");
  const [price, setPrice]         = useState(String(initialData.price ?? ""));
  const [category, setCategory]   = useState(initialData.category ?? DEFAULT_CATEGORIES[0]);
  const [customCategory, setCC]   = useState("");
  const [useCustomCat, setUseCC]  = useState(
    !!initialData.category && !DEFAULT_CATEGORIES.includes(initialData.category),
  );
  const [veg, setVeg]             = useState(initialData.veg ?? true);
  const [popular, setPopular]     = useState(initialData.popular ?? false);
  const [image, setImage]         = useState(initialData.image ?? "");
  const [rating, setRating]       = useState(String(initialData.rating ?? "4.5"));
  const [reviews, setReviews]     = useState(String(initialData.reviews ?? "0"));
  const [customizations, setCust] = useState<Customization[]>(
    initialData.customizations ?? [],
  );
  const [saving, setSaving]       = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())        e.name        = "Name is required";
    if (!description.trim()) e.description = "Description is required";
    if (!price || isNaN(Number(price)) || Number(price) <= 0)
                             e.price       = "Enter a valid price";
    if (useCustomCat && !customCategory.trim())
                             e.category    = "Category name is required";
    if (!image.trim())       e.image       = "Image URL is required";
    return e;
  }

  function addCustomization() {
    setCust((prev) => [...prev, { label: "", options: [""], defaultIndex: 0 }]);
  }
  function updateCustomization(i: number, field: keyof Customization, value: string | string[] | number) {
    setCust((prev) => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  }
  function addOption(ci: number) {
    setCust((prev) => prev.map((c, i) => i === ci ? { ...c, options: [...c.options, ""] } : c));
  }
  function updateOption(ci: number, oi: number, v: string) {
    setCust((prev) =>
      prev.map((c, i) => i === ci ? { ...c, options: c.options.map((o, j) => j === oi ? v : o) } : c),
    );
  }
  function removeOption(ci: number, oi: number) {
    setCust((prev) =>
      prev.map((c, i) => i === ci ? { ...c, options: c.options.filter((_, j) => j !== oi) } : c),
    );
  }
  function removeCustomization(i: number) {
    setCust((prev) => prev.filter((_, idx) => idx !== i));
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

    const finalCategory = useCustomCat ? customCategory.trim() : category;
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
      const rowId = initialData.dbId ?? initialData.id;
      const { error } = await supabase.from("menu_items").update(payload).eq("id", rowId);
      dbError = error;
    }

    if (dbError) {
      toast.error(dbError.message || "Something went wrong.");
      setSaving(false);
      return;
    }

    toast.success(mode === "new" ? "Item added to menu!" : "Item updated!");
    router.push("/admin/menu");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* ── Basic information ── */}
      <Section title="Basic Information">
        <Field label="Dish Name" error={errors.name} required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Paneer Tikka"
            className={iCls(!!errors.name)}
          />
        </Field>

        <Field label="Description" error={errors.description} required>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Describe the dish — ingredients, cooking style, accompaniments…"
            className={cn(iCls(!!errors.description), "resize-none")}
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
              className={iCls(!!errors.price)}
            />
          </Field>
          <Field label="Image URL" error={errors.image} required>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://…"
              className={iCls(!!errors.image)}
            />
          </Field>
        </div>

        {image && (
          <div
            className="overflow-hidden rounded-lg"
            style={{ border: "1px solid var(--admin-border)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="Preview"
              className="h-40 w-full object-cover"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
          </div>
        )}
      </Section>

      {/* ── Category & flags ── */}
      <Section title="Category & Flags">
        <Field label="Category" error={errors.category} required>
          {useCustomCat ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCC(e.target.value)}
                placeholder="New category name"
                className={cn(iCls(!!errors.category), "flex-1")}
              />
              <button
                type="button"
                onClick={() => setUseCC(false)}
                className="rounded-lg px-3 text-sm transition"
                style={{
                  border: "1px solid var(--admin-border-strong)",
                  color: "var(--admin-text-secondary)",
                  background: "var(--admin-card-bg)",
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={cn(iCls(false), "flex-1")}
              >
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setUseCC(true)}
                className="whitespace-nowrap rounded-lg px-3 text-sm transition"
                style={{
                  border: "1px solid var(--admin-border-strong)",
                  color: "var(--admin-text-secondary)",
                  background: "var(--admin-card-bg)",
                }}
              >
                + New
              </button>
            </div>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Rating (1–5)">
            <input
              type="number"
              min="1" max="5" step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className={iCls(false)}
            />
          </Field>
          <Field label="Review Count">
            <input
              type="number"
              min="0"
              value={reviews}
              onChange={(e) => setReviews(e.target.value)}
              className={iCls(false)}
            />
          </Field>
        </div>

        <div className="flex gap-3">
          <ToggleChip label="Vegetarian" active={veg} color="emerald" onClick={() => setVeg((v) => !v)} />
          <ToggleChip label="⭐ Popular" active={popular} color="amber" onClick={() => setPopular((v) => !v)} />
        </div>
      </Section>

      {/* ── Customizations ── */}
      <Section
        title="Customizations"
        subtitle="Optional — e.g. Spice level, Portion size"
        action={
          <button
            type="button"
            onClick={addCustomization}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
            style={{
              border: "1px solid var(--admin-border-strong)",
              color: "var(--admin-accent)",
              background: "var(--admin-accent-light)",
            }}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add group
          </button>
        }
      >
        {customizations.map((cust, ci) => (
          <div
            key={ci}
            className="space-y-3 rounded-lg p-4"
            style={{
              border: "1px solid var(--admin-border)",
              background: "var(--admin-bg)",
            }}
          >
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={cust.label}
                onChange={(e) => updateCustomization(ci, "label", e.target.value)}
                placeholder="Label (e.g. Spice Level)"
                className={cn(iCls(false), "flex-1")}
              />
              <button
                type="button"
                onClick={() => removeCustomization(ci)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:opacity-80"
                style={{
                  background: "var(--admin-danger-bg)",
                  border: "1px solid var(--admin-danger-border)",
                  color: "var(--admin-danger)",
                }}
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
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition"
                    style={
                      cust.defaultIndex === oi
                        ? { borderColor: "var(--admin-accent)", background: "var(--admin-accent)" }
                        : { borderColor: "var(--admin-border-strong)", background: "transparent" }
                    }
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
                    className={cn(iCls(false), "flex-1 py-2")}
                  />
                  {cust.options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOption(ci, oi)}
                      className="transition hover:opacity-60"
                      style={{ color: "var(--admin-text-muted)" }}
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
              className="text-xs font-medium transition hover:underline"
              style={{ color: "var(--admin-accent)" }}
            >
              + Add option
            </button>
          </div>
        ))}
      </Section>

      {/* ── Actions ── */}
      <div className="flex gap-3 pb-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-lg py-3 text-sm font-medium transition hover:opacity-80"
          style={{
            border: "1px solid var(--admin-border-strong)",
            color: "var(--admin-text-secondary)",
            background: "var(--admin-card-bg)",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
          style={{ background: "var(--admin-accent)" }}
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

// ── Sub-components ─────────────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        background: "var(--admin-card-bg)",
        border: "1px solid var(--admin-border)",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--admin-border)" }}
      >
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--admin-text-primary)" }}>
            {title}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs" style={{ color: "var(--admin-text-muted)" }}>
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="block text-[13px] font-semibold"
        style={{ color: "var(--admin-text-primary)" }}
      >
        {label}{" "}
        {required && <span style={{ color: "var(--admin-danger)" }}>*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs" style={{ color: "var(--admin-danger)" }}>
          <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function ToggleChip({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: "emerald" | "amber";
  onClick: () => void;
}) {
  const activeStyle =
    color === "emerald"
      ? { background: "var(--admin-success-bg)", border: "1px solid var(--admin-success-border)", color: "var(--admin-success)" }
      : { background: "var(--admin-warning-bg)", border: "1px solid var(--admin-warning-border)", color: "var(--admin-warning)" };

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition"
      style={
        active
          ? activeStyle
          : {
              border: "1px solid var(--admin-border-strong)",
              color: "var(--admin-text-secondary)",
              background: "var(--admin-card-bg)",
            }
      }
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{
          background: active
            ? color === "emerald"
              ? "#34c38f"
              : "#f1b44c"
            : "var(--admin-border-strong)",
        }}
      />
      {label}
    </button>
  );
}

function iCls(hasError: boolean) {
  return cn(
    "admin-input",
    hasError && "has-error",
  );
}
