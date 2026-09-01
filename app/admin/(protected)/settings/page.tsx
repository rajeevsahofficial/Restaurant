"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type Settings = {
  name: string;
  tagline: string;
  whatsapp_number: string;
  tax_rate: string;
  order_type: string;
  hero_image: string;
  copyright_year: string;
  address: string;
  phone: string;
  email: string;
};
type SettingsErrors = Partial<Settings>;

const DEFAULTS: Settings = {
  name: "", tagline: "", whatsapp_number: "",
  tax_rate: "5", order_type: "Dine In", hero_image: "",
  copyright_year: String(new Date().getFullYear()),
  address: "", phone: "", email: "",
};

const ORDER_TYPES = ["Dine In", "Takeaway", "Delivery", "Dine In & Takeaway"];

/* ─── Spinner ──────────────────────────────────────────────────────────────── */
function Spinner({ cls = "h-4 w-4" }: { cls?: string }) {
  return (
    <svg className={cn(cls, "animate-spin")} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ─── Field wrapper ────────────────────────────────────────────────────────── */
function Field({
  label, error, required, hint, children,
}: {
  label: string; error?: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-semibold" style={{ color: "var(--admin-text-primary)" }}>
        {label}{required && <span className="ml-0.5" style={{ color: "var(--admin-danger)" }}>*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{hint}</p>
      )}
      {error && (
        <p className="flex items-center gap-1.5 text-xs" style={{ color: "var(--admin-danger)" }}>
          <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Section card ─────────────────────────────────────────────────────────── */
function Section({
  id, title, description, children,
}: {
  id: string; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className="overflow-hidden rounded-xl"
      style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border)" }}
    >
      {/* Section header */}
      <div className="px-6 py-5" style={{ borderBottom: "1px solid var(--admin-border)" }}>
        <h2 className="text-sm font-bold" style={{ color: "var(--admin-text-primary)" }}>{title}</h2>
        <p className="mt-0.5 text-xs" style={{ color: "var(--admin-text-muted)" }}>{description}</p>
      </div>
      <div className="space-y-5 p-6">{children}</div>
    </div>
  );
}

/* ─── Input helpers ────────────────────────────────────────────────────────── */
function iCls(hasError: boolean) {
  return cn("admin-input", hasError && "has-error");
}

/* ══════════════════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const supabase = createClient();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [original, setOriginal] = useState<Settings>(DEFAULTS);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState<SettingsErrors>({});

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("restaurant_settings").select("*").eq("id", 1).single();
    if (error) { toast.error("Failed to load settings"); }
    else if (data) {
      const mapped: Settings = {
        name: data.name ?? "",
        tagline: data.tagline ?? "",
        whatsapp_number: data.whatsapp_number ?? "",
        tax_rate: String(data.tax_rate ?? 5),
        order_type: data.order_type ?? "Dine In",
        hero_image: data.hero_image ?? "",
        copyright_year: String(data.copyright_year ?? new Date().getFullYear()),
        address: data.address ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
      };
      setSettings(mapped);
      setOriginal(mapped);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  function set(key: keyof Settings, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  const isDirty = JSON.stringify(settings) !== JSON.stringify(original);

  function validate(): SettingsErrors {
    const e: SettingsErrors = {};
    if (!settings.name.trim())            e.name = "Restaurant name is required";
    if (!settings.hero_image.trim())      e.hero_image = "Hero image URL is required";
    if (!settings.whatsapp_number.trim()) e.whatsapp_number = "WhatsApp number is required";
    else if (!/^\d{10,15}$/.test(settings.whatsapp_number.replace(/\s/g, "")))
      e.whatsapp_number = "Country code + digits only (e.g. 919876543210)";
    const tax = parseFloat(settings.tax_rate);
    if (isNaN(tax) || tax < 0 || tax > 100) e.tax_rate = "Must be 0–100";
    if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email))
      e.email = "Enter a valid email address";
    return e;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Fix the errors before saving");
      return;
    }
    setErrors({});
    setSaving(true);
    const { error } = await supabase
      .from("restaurant_settings")
      .update({
        name: settings.name.trim(),
        tagline: settings.tagline.trim(),
        whatsapp_number: settings.whatsapp_number.trim(),
        tax_rate: parseFloat(settings.tax_rate),
        order_type: settings.order_type,
        hero_image: settings.hero_image.trim(),
        copyright_year: parseInt(settings.copyright_year, 10),
        address: settings.address.trim(),
        phone: settings.phone.trim(),
        email: settings.email.trim(),
      })
      .eq("id", 1);
    if (error) { toast.error(error.message || "Failed to save settings"); }
    else { setOriginal(settings); toast.success("Settings saved"); }
    setSaving(false);
  }

  function handleDiscard() {
    setSettings(original);
    setErrors({});
    toast("Changes discarded", { icon: "↩️" });
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Spinner cls="h-6 w-6" />
        <p className="text-sm" style={{ color: "var(--admin-text-secondary)" }}>Loading settings…</p>
      </div>
    );
  }

  /* ── Page ── */
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">

      {/* ══ Page header ══════════════════════════════════════════════════════ */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--admin-text-muted)" }}>
            Configuration
          </p>
          <h1 className="mt-1 text-2xl font-bold" style={{ color: "var(--admin-text-primary)" }}>
            Settings
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--admin-text-secondary)" }}>
            Manage your restaurant profile, contact info, and order configuration.
          </p>
        </div>

        {/* Desktop save bar */}
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          {isDirty && (
            <button
              type="button" onClick={handleDiscard}
              className="rounded-lg px-4 py-2.5 text-sm font-medium transition hover:opacity-80"
              style={{ border: "1px solid var(--admin-border-strong)", color: "var(--admin-text-secondary)", background: "var(--admin-card-bg)" }}
            >
              Discard
            </button>
          )}
          <button
            form="settings-form" type="submit" disabled={saving || !isDirty}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.99] disabled:opacity-40"
            style={{ background: "var(--admin-accent)" }}
          >
            {saving ? <><Spinner />Saving…</> : (
              <>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unsaved banner — mobile & desktop */}
      {isDirty && (
        <div
          className="mb-6 flex items-center gap-3 rounded-xl px-5 py-3.5"
          style={{ background: "var(--admin-warning-bg)", border: "1px solid var(--admin-warning-border)" }}
        >
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full" style={{ background: "var(--admin-warning)" }} />
          <p className="flex-1 text-xs font-medium" style={{ color: "var(--admin-warning)" }}>
            You have unsaved changes
          </p>
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={handleDiscard}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
              style={{ border: "1px solid var(--admin-warning-border)", color: "var(--admin-warning)", background: "transparent" }}
            >
              Discard
            </button>
            <button
              form="settings-form" type="submit" disabled={saving}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-40"
              style={{ background: "var(--admin-accent)" }}
            >
              {saving ? <Spinner cls="h-3.5 w-3.5" /> : null}
              Save
            </button>
          </div>
        </div>
      )}

      {/* ══ Two-column layout ════════════════════════════════════════════════ */}
      <form id="settings-form" onSubmit={handleSave} noValidate>
        <div className="grid gap-6 xl:grid-cols-[1fr_300px]">

          {/* ── Left column: all sections ── */}
          <div className="space-y-6">

            {/* ── 1. Brand ── */}
            <Section
              id="brand"
              title="Brand"
              description="Name and tagline shown to customers on the live menu"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Restaurant Name" error={errors.name} required>
                  <input
                    type="text" value={settings.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="The Spice House"
                    className={iCls(!!errors.name)}
                  />
                </Field>
                <Field label="Copyright Year">
                  <input
                    type="number" min="2020" max="2100"
                    value={settings.copyright_year}
                    onChange={(e) => set("copyright_year", e.target.value)}
                    className={iCls(false)}
                  />
                </Field>
              </div>
              <Field label="Tagline" hint="Appears on the hero banner of the customer menu">
                <input
                  type="text" value={settings.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                  placeholder="Crafted to make you crave more."
                  className={iCls(false)}
                />
              </Field>
            </Section>

            {/* ── 2. Hero Image ── */}
            <Section
              id="hero"
              title="Hero Image"
              description="Banner shown at the top of the customer menu — landscape, min 1200×600px"
            >
              <Field label="Image URL" error={errors.hero_image} required>
                <input
                  type="url" value={settings.hero_image}
                  onChange={(e) => set("hero_image", e.target.value)}
                  placeholder="https://images.unsplash.com/…"
                  className={iCls(!!errors.hero_image)}
                />
              </Field>
              {settings.hero_image && (
                <div className="overflow-hidden rounded-lg" style={{ border: "1px solid var(--admin-border)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.hero_image} alt="Hero preview"
                    className="h-48 w-full object-cover"
                    onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                  />
                  <div className="px-4 py-2.5" style={{ borderTop: "1px solid var(--admin-border)" }}>
                    <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>
                      Recommended: 1200 × 600 px · landscape
                    </p>
                  </div>
                </div>
              )}
            </Section>

            {/* ── 3. Contact ── */}
            <Section
              id="contact"
              title="Contact Details"
              description="Shown in the menu footer and customer receipts"
            >
              <Field label="Address">
                <textarea
                  rows={2} value={settings.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="123 MG Road, New Delhi — 110001"
                  className={cn(iCls(false), "resize-none")}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Phone Number">
                  <div className="input-group">
                    <div className="input-group__prefix">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: "var(--admin-text-muted)" }}>
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.85a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16z" />
                      </svg>
                    </div>
                    <input
                      type="tel" value={settings.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </Field>
                <Field label="Email Address" error={errors.email}>
                  <div className={cn("input-group", errors.email && "has-error")}>
                    <div className="input-group__prefix">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: "var(--admin-text-muted)" }}>
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <input
                      type="email" value={settings.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="hello@restaurant.com"
                    />
                  </div>
                </Field>
              </div>
            </Section>

            {/* ── 4. Orders ── */}
            <Section
              id="orders"
              title="Orders & Tax"
              description="WhatsApp number that receives orders, order mode, and tax rate"
            >
              {/* WhatsApp */}
              <Field
                label="WhatsApp Number"
                error={errors.whatsapp_number}
                required
                hint="Country code + digits only — e.g. 919876543210"
              >
                <div className={cn("input-group", errors.whatsapp_number && "has-error")}>
                  <div className="input-group__prefix gap-1.5">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-[#25D366]">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                    <span className="text-sm font-semibold" style={{ color: "var(--admin-text-muted)" }}>+</span>
                  </div>
                  <input
                    type="text"
                    value={settings.whatsapp_number}
                    onChange={(e) => set("whatsapp_number", e.target.value.replace(/\D/g, ""))}
                    placeholder="919876543210"
                  />
                </div>
              </Field>

              {/* Test link */}
              {settings.whatsapp_number.length >= 10 && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition hover:opacity-80"
                  style={{ background: "var(--admin-success-bg)", border: "1px solid var(--admin-success-border)", color: "var(--admin-success)" }}
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Test on WhatsApp
                </a>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Order Type">
                  <select value={settings.order_type} onChange={(e) => set("order_type", e.target.value)} className={iCls(false)}>
                    {ORDER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Tax / GST Rate" error={errors.tax_rate} required>
                  <div className="relative">
                    <input
                      type="number" min="0" max="100" step="0.5"
                      value={settings.tax_rate}
                      onChange={(e) => set("tax_rate", e.target.value)}
                      className={cn(iCls(!!errors.tax_rate), "pr-9")}
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: "var(--admin-text-muted)" }}>%</span>
                  </div>
                </Field>
              </div>
            </Section>

          </div>{/* end left column */}

          {/* ── Right column: sticky preview ── */}
          <div className="hidden xl:block">
            <div className="sticky top-[76px] space-y-4">

              {/* Live preview card */}
              <div
                className="overflow-hidden rounded-xl"
                style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border)" }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--admin-border)" }}>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>
                    Live Preview
                  </p>
                  <span className="flex h-2 w-2 rounded-full" style={{ background: "var(--admin-success)" }} />
                </div>

                {/* Mini mockup */}
                <div className="p-4" style={{ background: "var(--admin-bg)" }}>
                  {/* Navbar mockup */}
                  <div
                    className="flex items-center justify-between rounded-lg px-3 py-2.5"
                    style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border)" }}
                  >
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>
                        {settings.name ? "Welcome to" : "Restaurant"}
                      </p>
                      <p className="truncate text-xs font-extrabold leading-tight" style={{ color: "var(--admin-text-primary)" }}>
                        {settings.name || "Restaurant Name"}
                      </p>
                    </div>
                    <div
                      className="ml-2 shrink-0 rounded-md px-2 py-1 text-center"
                      style={{ background: "var(--admin-bg)", border: "1px solid var(--admin-border)" }}
                    >
                      <p className="text-[7px] uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>Table</p>
                      <p className="text-[11px] font-extrabold" style={{ color: "var(--admin-text-primary)" }}>1</p>
                    </div>
                  </div>

                  {/* Hero mockup */}
                  <div className="relative mt-2.5 h-24 overflow-hidden rounded-lg bg-neutral-900">
                    {settings.hero_image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={settings.hero_image} alt=""
                        className="h-full w-full object-cover opacity-60"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/75 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-3">
                      <p className="max-w-[160px] text-[10px] font-semibold leading-snug text-white">
                        {settings.tagline || "Your tagline appears here"}
                      </p>
                    </div>
                  </div>

                  {/* Footer mockup */}
                  <div
                    className="mt-2.5 rounded-lg px-3 py-2.5 text-center"
                    style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border)" }}
                  >
                    <p className="text-[9px]" style={{ color: "var(--admin-text-muted)" }}>
                      © {settings.copyright_year || new Date().getFullYear()} {settings.name || "Restaurant"}
                    </p>
                    {settings.phone && (
                      <p className="mt-0.5 text-[9px]" style={{ color: "var(--admin-text-muted)" }}>
                        {settings.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div
                  className="grid grid-cols-2"
                  style={{ borderTop: "1px solid var(--admin-border)" }}
                >
                  <div className="px-5 py-4 text-center" style={{ borderRight: "1px solid var(--admin-border)" }}>
                    <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>Tax</p>
                    <p className="mt-1 text-lg font-bold" style={{ color: "var(--admin-text-primary)" }}>
                      {settings.tax_rate || "0"}%
                    </p>
                  </div>
                  <div className="px-5 py-4 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>Mode</p>
                    <p className="mt-1 truncate text-xs font-bold" style={{ color: "var(--admin-text-primary)" }}>
                      {settings.order_type}
                    </p>
                  </div>
                </div>

                {/* WhatsApp row */}
                <div className="flex items-center gap-3 px-5 py-4" style={{ borderTop: "1px solid var(--admin-border)" }}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-[#25D366]">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold" style={{ color: "var(--admin-text-primary)" }}>Orders to WhatsApp</p>
                    <p className="truncate font-mono text-[11px]" style={{ color: "var(--admin-text-muted)" }}>
                      {settings.whatsapp_number ? `+${settings.whatsapp_number}` : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section nav */}
              <div
                className="rounded-xl p-4"
                style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border)" }}
              >
                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--admin-text-muted)" }}>
                  Jump to
                </p>
                <nav className="space-y-0.5">
                  {[
                    { id: "brand",   label: "Brand" },
                    { id: "hero",    label: "Hero Image" },
                    { id: "contact", label: "Contact" },
                    { id: "orders",  label: "Orders & Tax" },
                  ].map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:opacity-80"
                      style={{ color: "var(--admin-text-secondary)" }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--admin-border-strong)" }} />
                      {s.label}
                    </a>
                  ))}
                </nav>
              </div>

            </div>
          </div>

        </div>{/* end grid */}

        {/* Mobile bottom save bar */}
        <div
          className="mt-8 flex gap-3 sm:hidden"
        >
          {isDirty && (
            <button
              type="button" onClick={handleDiscard}
              className="flex-1 rounded-xl py-3.5 text-sm font-medium transition hover:opacity-80"
              style={{ border: "1px solid var(--admin-border-strong)", color: "var(--admin-text-secondary)", background: "var(--admin-card-bg)" }}
            >
              Discard
            </button>
          )}
          <button
            type="submit" disabled={saving || !isDirty}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow transition hover:opacity-90 disabled:opacity-40"
            style={{ background: "var(--admin-accent)" }}
          >
            {saving ? <><Spinner />Saving…</> : "Save Changes"}
          </button>
        </div>

      </form>
    </div>
  );
}
