"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// ── Types ──────────────────────────────────────────────────────────────────────

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
  name: "",
  tagline: "",
  whatsapp_number: "",
  tax_rate: "5",
  order_type: "Dine In",
  hero_image: "",
  copyright_year: String(new Date().getFullYear()),
  address: "",
  phone: "",
  email: "",
};

const ORDER_TYPES = ["Dine In", "Takeaway", "Delivery", "Dine In & Takeaway"];

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const supabase = createClient();

  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [original, setOriginal] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [activeTab, setActiveTab] = useState<"brand" | "contact" | "orders">("brand");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("restaurant_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      toast.error("Failed to load settings");
      console.error(error);
    } else if (data) {
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

  // ── Helpers ────────────────────────────────────────────────────────────────
  function set(key: keyof Settings, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  const isDirty = JSON.stringify(settings) !== JSON.stringify(original);

  function validate(): SettingsErrors {
    const e: SettingsErrors = {};
    if (!settings.name.trim()) e.name = "Restaurant name is required";
    if (!settings.whatsapp_number.trim()) e.whatsapp_number = "WhatsApp number is required";
    else if (!/^\d{10,15}$/.test(settings.whatsapp_number.replace(/\s/g, "")))
      e.whatsapp_number = "Country code + digits only, no + or spaces";
    const tax = parseFloat(settings.tax_rate);
    if (isNaN(tax) || tax < 0 || tax > 100) e.tax_rate = "Must be between 0 and 100";
    if (!settings.hero_image.trim()) e.hero_image = "Hero image URL is required";
    if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email))
      e.email = "Enter a valid email address";
    return e;
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Switch to the tab that has the first error
      if (errs.name || errs.tagline || errs.hero_image) setActiveTab("brand");
      else if (errs.address || errs.phone || errs.email) setActiveTab("contact");
      else setActiveTab("orders");
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

    if (error) {
      toast.error(error.message || "Failed to save settings");
      console.error(error);
    } else {
      setOriginal(settings);
      toast.success("Settings saved successfully");
    }
    setSaving(false);
  }

  function handleDiscard() {
    setSettings(original);
    setErrors({});
    toast("Changes discarded", { icon: "↩️" });
  }

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const TABS = [
    { id: "brand",   label: "Brand",   hasError: !!(errors.name || errors.tagline || errors.hero_image) },
    { id: "contact", label: "Contact", hasError: !!(errors.address || errors.phone || errors.email) },
    { id: "orders",  label: "Orders",  hasError: !!(errors.whatsapp_number || errors.tax_rate) },
  ] as const;

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <svg className="h-6 w-6 animate-spin text-[#a96534]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-white/40">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">

      {/* ── Page header ── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Configuration</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Restaurant Settings</h1>
          <p className="mt-1 text-sm text-white/40">
            Changes are saved to the database and reflected across the app immediately.
          </p>
        </div>

        {/* Save / discard buttons — always visible at top on desktop */}
        <div className="hidden items-center gap-2 sm:flex">
          {isDirty && (
            <button
              type="button"
              onClick={handleDiscard}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/50 transition hover:border-white/20 hover:text-white"
            >
              Discard
            </button>
          )}
          <button
            form="settings-form"
            type="submit"
            disabled={saving || !isDirty}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#a96534] to-[#7a4825] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#a96534]/20 transition hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                {isDirty ? "Save Changes" : "Saved"}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

        {/* ── Left: tabbed form ── */}
        <div>
          {/* Tab bar */}
          <div className="mb-5 flex gap-1 rounded-2xl border border-white/6 bg-white/4 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex-1 rounded-xl py-2.5 text-sm font-medium transition-all duration-150",
                  activeTab === tab.id
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/40 hover:text-white/70",
                )}
              >
                {tab.label}
                {tab.hasError && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-400" />
                )}
              </button>
            ))}
          </div>

          <form id="settings-form" onSubmit={handleSave} noValidate>

            {/* ── Brand tab ── */}
            {activeTab === "brand" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader
                    icon="🏪"
                    title="Identity"
                    subtitle="Name and tagline shown to customers on the menu"
                  />
                  <div className="space-y-4 p-5 pt-0">
                    <Field label="Restaurant Name" error={errors.name} required>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="The Spice House"
                        className={iCls(!!errors.name)}
                      />
                    </Field>
                    <Field label="Tagline">
                      <input
                        type="text"
                        value={settings.tagline}
                        onChange={(e) => set("tagline", e.target.value)}
                        placeholder="Crafted to make you crave more."
                        className={iCls(false)}
                      />
                      <p className="mt-1.5 text-xs text-white/30">
                        Shown on the hero banner of the customer menu.
                      </p>
                    </Field>
                  </div>
                </Card>

                <Card>
                  <CardHeader
                    icon="🖼️"
                    title="Hero Image"
                    subtitle="Banner image on the top of the customer menu"
                  />
                  <div className="space-y-4 p-5 pt-0">
                    <Field label="Image URL" error={errors.hero_image} required>
                      <input
                        type="url"
                        value={settings.hero_image}
                        onChange={(e) => set("hero_image", e.target.value)}
                        placeholder="https://images.unsplash.com/…"
                        className={iCls(!!errors.hero_image)}
                      />
                    </Field>
                    {settings.hero_image && (
                      <div className="overflow-hidden rounded-xl border border-white/8">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={settings.hero_image}
                          alt="Hero preview"
                          className="h-44 w-full object-cover"
                          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                        />
                        <div className="flex items-center gap-2 border-t border-white/6 px-4 py-2.5">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                          </svg>
                          <p className="text-xs text-white/35">
                            Recommended: 1200×600px, landscape. Unsplash URLs work great.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                <Card>
                  <CardHeader icon="©️" title="Copyright" subtitle="Year shown in the customer menu footer" />
                  <div className="p-5 pt-0">
                    <Field label="Copyright Year">
                      <input
                        type="number"
                        min="2020" max="2100"
                        value={settings.copyright_year}
                        onChange={(e) => set("copyright_year", e.target.value)}
                        className={iCls(false)}
                      />
                    </Field>
                  </div>
                </Card>
              </div>
            )}

            {/* ── Contact tab ── */}
            {activeTab === "contact" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader
                    icon="📍"
                    title="Location"
                    subtitle="Address shown in the footer and receipts"
                  />
                  <div className="p-5 pt-0">
                    <Field label="Address">
                      <textarea
                        rows={2}
                        value={settings.address}
                        onChange={(e) => set("address", e.target.value)}
                        placeholder="123 MG Road, Connaught Place, New Delhi — 110001"
                        className={cn(iCls(false), "resize-none")}
                      />
                    </Field>
                  </div>
                </Card>

                <Card>
                  <CardHeader
                    icon="📞"
                    title="Contact Details"
                    subtitle="Phone and email for customer support"
                  />
                  <div className="space-y-4 p-5 pt-0">
                    <Field label="Phone Number">
                      <div className="relative">
                        <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.85a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
                        </svg>
                        <input
                          type="tel"
                          value={settings.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          placeholder="+91 98765 43210"
                          className={cn(iCls(false), "pl-11")}
                        />
                      </div>
                    </Field>
                    <Field label="Email Address" error={errors.email}>
                      <div className="relative">
                        <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <input
                          type="email"
                          value={settings.email}
                          onChange={(e) => set("email", e.target.value)}
                          placeholder="hello@restaurant.com"
                          className={cn(iCls(!!errors.email), "pl-11")}
                        />
                      </div>
                    </Field>
                  </div>
                </Card>
              </div>
            )}

            {/* ── Orders tab ── */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader
                    icon="💬"
                    title="WhatsApp Orders"
                    subtitle="All customer orders are sent to this number"
                  />
                  <div className="p-5 pt-0 space-y-4">
                    <Field label="WhatsApp Number" error={errors.whatsapp_number} required>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#25D366]">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                          </svg>
                          <span className="text-sm text-white/35">+</span>
                        </div>
                        <input
                          type="text"
                          value={settings.whatsapp_number}
                          onChange={(e) => set("whatsapp_number", e.target.value.replace(/\D/g, ""))}
                          placeholder="919876543210"
                          className={cn(iCls(!!errors.whatsapp_number), "pl-14")}
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-white/30">
                        Country code + number, digits only — e.g.{" "}
                        <code className="rounded bg-white/8 px-1 py-0.5 font-mono text-white/50">919876543210</code>
                      </p>
                    </Field>

                    {/* Test link */}
                    {settings.whatsapp_number && settings.whatsapp_number.length >= 10 && (
                      <a
                        href={`https://wa.me/${settings.whatsapp_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-[#25D366]/20 bg-[#25D366]/8 px-4 py-2.5 text-xs font-medium text-[#25D366] transition hover:bg-[#25D366]/15"
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                        </svg>
                        Test this number on WhatsApp
                      </a>
                    )}
                  </div>
                </Card>

                <Card>
                  <CardHeader
                    icon="🧾"
                    title="Tax & Order Type"
                    subtitle="Applied to every customer order"
                  />
                  <div className="grid gap-4 p-5 pt-0 sm:grid-cols-2">
                    <Field label="Order Type">
                      <select
                        value={settings.order_type}
                        onChange={(e) => set("order_type", e.target.value)}
                        className={cn(iCls(false), "[&>option]:bg-[#1a1816]")}
                      >
                        {ORDER_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Tax / GST Rate" error={errors.tax_rate} required>
                      <div className="relative">
                        <input
                          type="number"
                          min="0" max="100" step="0.5"
                          value={settings.tax_rate}
                          onChange={(e) => set("tax_rate", e.target.value)}
                          className={cn(iCls(!!errors.tax_rate), "pr-8")}
                        />
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-white/35">%</span>
                      </div>
                    </Field>
                  </div>
                </Card>
              </div>
            )}

          </form>
        </div>

        {/* ── Right: live preview sidebar ── */}
        <div className="space-y-4">

          {/* Live preview card */}
          <div className="sticky top-6 space-y-3">
            <div className="rounded-2xl border border-white/6 bg-white/4 overflow-hidden">
              <div className="border-b border-white/6 px-5 py-3.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/35">Live Preview</p>
              </div>

              {/* Mini menu mockup */}
              <div className="bg-[#f7f5f0] p-4">
                {/* Navbar */}
                <div className="flex items-center justify-between rounded-2xl bg-[#f7f5f0] px-3 py-2 border border-black/5">
                  <div>
                    <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-[#8d7b61]">Welcome to</p>
                    <p className="text-[11px] font-extrabold text-[#171714] leading-tight">
                      {settings.name || "Restaurant Name"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#f3eee3] px-2 py-1">
                    <p className="text-[6px] font-semibold uppercase tracking-widest text-black/40">Table</p>
                    <p className="text-[10px] font-extrabold text-[#171714]">1</p>
                  </div>
                </div>

                {/* Hero */}
                <div className="relative mt-2 overflow-hidden rounded-2xl bg-[#242018] h-20">
                  {settings.hero_image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={settings.hero_image}
                      alt=""
                      className="h-full w-full object-cover opacity-55"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                  <div className="absolute bottom-2 left-3">
                    <p className="text-[9px] font-semibold leading-tight text-white max-w-[120px]">
                      {settings.tagline || "Your tagline here"}
                    </p>
                  </div>
                </div>

                {/* Footer strip */}
                <div className="mt-2 rounded-xl bg-[#1f1c17] px-3 py-2">
                  <p className="text-[8px] text-white/40 text-center">
                    © {settings.copyright_year} {settings.name || "Restaurant"}
                  </p>
                </div>
              </div>

              {/* WhatsApp strip */}
              <div className="border-t border-white/6 px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-[#25D366]">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white">Orders to WhatsApp</p>
                    <p className="truncate font-mono text-[11px] text-white/40">
                      +{settings.whatsapp_number || "—"}
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-3 rounded-xl border border-white/6 bg-white/4 px-3 py-2">
                  <div className="text-center flex-1 border-r border-white/8 pr-3">
                    <p className="text-[9px] text-white/30 uppercase tracking-widest">Tax</p>
                    <p className="text-sm font-bold text-white">{settings.tax_rate || "0"}%</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-[9px] text-white/30 uppercase tracking-widest">Type</p>
                    <p className="text-xs font-bold text-white truncate">{settings.order_type}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Unsaved changes indicator */}
            {isDirty && (
              <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3">
                <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400 animate-pulse" />
                <p className="text-xs text-amber-300/80">You have unsaved changes</p>
              </div>
            )}

            {/* Mobile save button */}
            <div className="flex gap-2 sm:hidden">
              {isDirty && (
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-white/50 transition hover:text-white"
                >
                  Discard
                </button>
              )}
              <button
                form="settings-form"
                type="submit"
                disabled={saving || !isDirty}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#a96534] to-[#7a4825] py-3 text-sm font-semibold text-white transition disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
      {children}
    </div>
  );
}

function CardHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/6 px-5 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/6 text-base">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="mt-0.5 text-xs text-white/35">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({
  label, error, required, children,
}: {
  label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-widest text-white/45">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function iCls(hasError: boolean) {
  return cn(
    "w-full rounded-xl border bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:ring-2",
    hasError
      ? "border-red-400/50 focus:border-red-400/50 focus:ring-red-400/15"
      : "border-white/10 focus:border-[#a96534]/60 focus:ring-[#a96534]/20",
  );
}
