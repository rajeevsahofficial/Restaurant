"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RESTAURANT_CONFIG } from "@/lib/config";
import { fetchSettings, type LiveSettings } from "@/lib/settings";
import { useCart } from "@/lib/cart-store";
import CartItem from "@/components/CartItem";
import OrderSuccess from "@/components/OrderSuccess";
import type { Food } from "@/lib/data";

function CartContent() {
  const router = useRouter();
  const { cart, addItem, removeItem, clearCart, tableNumber } = useCart();
  const [instructions, setInstructions] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [ordered, setOrdered] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [allFoods, setAllFoods] = useState<Food[]>([]);
  const [liveSettings, setLiveSettings] = useState<LiveSettings | null>(null);
  // true until the first Supabase response arrives
  const [loadingMenu, setLoadingMenu] = useState(true);

  // Fetch menu and settings from Supabase so cart reflects live DB data
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [menuRes, settings] = await Promise.all([
        supabase
          .from("menu_items")
          .select("id,name,description,price,rating,reviews,category,veg,popular,available,image,customizations"),
        fetchSettings(),
      ]);
      if (menuRes.data) setAllFoods(menuRes.data as Food[]);
      setLiveSettings(settings);
      setLoadingMenu(false);
    }
    load();
  }, []);

  // Use live settings with fallback to static config
  const taxRate = liveSettings?.taxRate ?? RESTAURANT_CONFIG.taxRate;
  const orderType = liveSettings?.orderType ?? RESTAURANT_CONFIG.orderType;
  const whatsappNumber = liveSettings?.whatsappNumber ?? RESTAURANT_CONFIG.whatsappNumber;
  const restaurantName = liveSettings?.name ?? RESTAURANT_CONFIG.name;

  const selectedItems = useMemo(
    () =>
      allFoods
        .filter((f) => cart[f.id])
        .map((f) => ({ ...f, quantity: cart[f.id] as number })),
    [allFoods, cart],
  );

  const subtotal = selectedItems.reduce((t, i) => t + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * taxRate);
  const grandTotal = subtotal + tax;

  const backHref = tableNumber ? `/?table=${tableNumber}` : "/";

  /* ── WhatsApp handler ── */
  const handleWhatsAppOrder = () => {
    if (!customerName.trim()) {
      setNameError(true);
      document.getElementById("customer-name")?.focus();
      return;
    }
    setNameError(false);

    const tableLabel = tableNumber ? `Table ${tableNumber}` : "Walk-in";

    const itemsText = selectedItems
      .map(
        (item, i) =>
          `${i + 1}. ${item.name} = ${item.quantity} × ₹${item.price} = ₹${item.price * item.quantity}`,
      )
      .join("\n\n");

    const message =
      `🍽️ *NEW ORDER • ${tableLabel}*\n\n` +
      `👤 *Customer:* ${customerName.trim()}\n\n` +
      `*ORDER SUMMARY*\n` +
      `${itemsText}\n\n` +
      `*Subtotal:* ₹${subtotal}\n` +
      `*Tax (${Math.round(taxRate * 100)}%):* ₹${tax}\n` +
      `💰 *TOTAL: ₹${grandTotal}*\n\n` +
      `📝 *SPECIAL INSTRUCTIONS*\n` +
      `${instructions.trim() || "No special instructions"}\n\n` +
      `🙏 *Please confirm this order.*`;

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );

    clearCart();
    setOrdered(true);
  };

  /* ── Success screen ── */
  if (ordered) {
    return (
      <OrderSuccess
        tableNumber={tableNumber}
        grandTotal={grandTotal}
        onBackToMenu={() => router.push(backHref)}
      />
    );
  }

  /* ── Loading skeleton — shown while menu fetch is in flight ── */
  if (loadingMenu) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] text-[#171714] dark:bg-[#141210] dark:text-white">
        <main className="mx-auto min-h-screen max-w-md px-5">
          {/* Header */}
          <div className="flex items-center justify-between pt-5">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-black/8 dark:bg-white/8" />
            <div className="h-5 w-24 animate-pulse rounded-full bg-black/8 dark:bg-white/8" />
            <div className="h-10 w-10 animate-pulse rounded-xl bg-black/8 dark:bg-white/8" />
          </div>
          {/* Table strip */}
          <div className="mt-5 h-16 animate-pulse rounded-2xl bg-black/8 dark:bg-white/8" />
          {/* Name field */}
          <div className="mt-4 h-24 animate-pulse rounded-2xl bg-black/8 dark:bg-white/8" />
          {/* Items */}
          <div className="mt-6 space-y-3">
            {Array.from({ length: Object.keys(cart).length || 3 }).map((_, i) => (
              <div key={i} className="h-[88px] animate-pulse rounded-2xl bg-black/8 dark:bg-white/8" />
            ))}
          </div>
          {/* Bill */}
          <div className="mt-4 h-44 animate-pulse rounded-2xl bg-black/8 dark:bg-white/8" />
        </main>
      </div>
    );
  }

  /* ── Empty cart ── */
  if (selectedItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f5f0] text-[#171714] dark:bg-[#141210] dark:text-white">
        <main className="mx-auto min-h-screen max-w-md bg-[#f7f5f0] px-5 dark:bg-[#141210]">

          {/* Back button row */}
          <div className="flex items-center justify-between pt-5">
            <button
              onClick={() => router.push(backHref)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/8 bg-white dark:border-white/8 dark:bg-white/8"
              aria-label="Go back"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">Your Cart</h1>
            <div className="h-10 w-10" />
          </div>

          {/* Empty state */}
          <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-black/6 bg-white dark:border-white/6 dark:bg-white/6">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-black/30 dark:text-white/30" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 3h2l2.3 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 7H7" />
                <circle cx="10" cy="19" r="1" />
                <circle cx="18" cy="19" r="1" />
              </svg>
            </div>
            <h2 className="mt-5 text-xl font-bold">Your cart is empty</h2>
            <p className="mt-2 max-w-[260px] text-sm leading-6 text-black/40 dark:text-white/40">
              Add your favourite dishes from the menu and they will appear here.
            </p>
            <button
              onClick={() => router.push(backHref)}
              className="mt-6 rounded-2xl bg-[#1f1c17] px-6 py-3 text-sm font-semibold text-white dark:bg-white dark:text-[#1f1c17]"
            >
              Explore Menu
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* ── Main cart ── */
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#171714] dark:bg-[#141210] dark:text-white">
      <main className="mx-auto min-h-screen max-w-md pb-44">

        {/* ── Sticky header ── */}
        <header className="sticky top-0 z-30 border-b border-black/[0.05] bg-[#f7f5f0]/95 px-5 pb-4 pt-4 backdrop-blur-xl dark:border-white/5 dark:bg-[#141210]/95">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(backHref)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/8 bg-white dark:border-white/8 dark:bg-white/8"
              aria-label="Go back"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9b8261]">
                {restaurantName}
              </p>
              <h1 className="mt-0.5 text-lg font-bold">Your Cart</h1>
            </div>

            {/* Item count badge */}
            <div className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-black/8 bg-[#f3eee4] px-3 dark:border-white/8 dark:bg-white/8">
              <span className="text-xs font-bold">
                {selectedItems.reduce((t, i) => t + i.quantity, 0)}
              </span>
            </div>
          </div>
        </header>

        {/* ── Table info strip ── */}
        <section className="px-5 pt-5">
          <div className="flex items-center justify-between rounded-2xl bg-[#1f1c17] px-5 py-4 text-white dark:bg-white/8">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-white/40">
                Dining at
              </p>
              <p className="mt-1 text-sm font-bold">
                {tableNumber ? `Table ${tableNumber}` : "Walk-in"}
              </p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-white/40">
                Order Type
              </p>
              <p className="mt-1 text-sm font-bold">{orderType}</p>
            </div>
          </div>
        </section>

        {/* ── Customer name ── */}
        <section className="px-5 pt-4">
          <div className="rounded-2xl border border-black/[0.06] bg-white px-4 py-4 dark:border-white/5 dark:bg-[#1e1c18]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f3eee4] text-base dark:bg-white/8">
                👤
              </span>
              <input
                id="customer-name"
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (e.target.value.trim()) setNameError(false);
                }}
                placeholder="Enter your name"
                className={`w-full rounded-xl border bg-[#f8f6f1] px-4 py-2 text-sm outline-none placeholder:text-black/25 transition dark:bg-white/5 dark:placeholder:text-white/20 dark:text-white ${
                  nameError
                    ? "border-red-400 ring-1 ring-red-400"
                    : "border-transparent focus:border-[#a96534]/40 focus:ring-1 focus:ring-[#a96534]/30"
                }`}
              />
            </div>
            {nameError && (
              <p className="mt-2 pl-[52px] text-xs text-red-500">
                Please enter your name before placing the order.
              </p>
            )}
          </div>
        </section>

        {/* ── Order items — kept exactly as-is ── */}
        <section className="px-5 pt-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9c8665]">
                Selected dishes
              </p>
              <h2 className="mt-1 text-2xl font-bold">Your Order</h2>
            </div>
            <span className="text-xs text-black/35 dark:text-white/35">
              {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-3">
            {selectedItems.map((item) => (
              <CartItem
                key={item.id}
                food={item}
                quantity={item.quantity}
                onAdd={() => addItem(item.id)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        </section>

        {/* ── Special instructions ── */}
        <section className="px-5 pt-4">
          <div className="rounded-2xl border border-black/[0.06] bg-white px-4 py-4 dark:border-white/5 dark:bg-[#1e1c18]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/6 bg-[#f3eee4] dark:border-white/5 dark:bg-white/8">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold">Special instructions</h3>
                <p className="mt-0.5 text-[11px] text-black/38 dark:text-white/38">
                  Allergies, spice preference or requests
                </p>
              </div>
            </div>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="E.g. Less spicy, no onion, extra raita…"
              className="mt-4 w-full resize-none rounded-xl border border-transparent bg-[#f8f6f1] p-3 text-xs outline-none placeholder:text-black/25 focus:border-[#a96534]/30 focus:ring-1 focus:ring-[#a96534]/20 dark:bg-white/5 dark:placeholder:text-white/20 dark:text-white"
            />
          </div>
        </section>

        {/* ── Bill details ── */}
        <section className="px-5 pt-4 pb-2">
          <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white dark:border-white/5 dark:bg-[#1e1c18]">
            {/* Header row */}
            <div className="border-b border-black/[0.05] px-5 py-3.5 dark:border-white/5">
              <h3 className="text-sm font-bold">Bill Details</h3>
            </div>

            {/* Line items */}
            <div className="space-y-0 divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              <div className="flex justify-between px-5 py-3.5 text-sm">
                <span className="text-black/45 dark:text-white/40">Item Total</span>
                <span className="font-semibold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between px-5 py-3.5 text-sm">
                <span className="text-black/45 dark:text-white/40">
                  Taxes ({Math.round(taxRate * 100)}%)
                </span>
                <span className="font-semibold">₹{tax}</span>
              </div>
              {/* Grand total row — slightly tinted */}
              <div className="flex items-center justify-between bg-[#f8f6f1] px-5 py-4 dark:bg-white/[0.03]">
                <div>
                  <p className="text-sm font-bold">Grand Total</p>
                  <p className="mt-0.5 text-[10px] text-black/35 dark:text-white/30">
                    Incl. all taxes
                  </p>
                </div>
                <p className="text-xl font-extrabold">₹{grandTotal}</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── Fixed WhatsApp checkout bar ── */}
      <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-black/[0.05] bg-[#f7f5f0]/96 px-5 pb-8 pt-3 backdrop-blur-xl dark:border-white/5 dark:bg-[#141210]/96">
        <button
          onClick={handleWhatsAppOrder}
          className="flex w-full items-center justify-between rounded-2xl bg-[#25D366] px-5 py-4 text-white transition active:scale-[0.98]"
        >
          <div className="text-left">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-white/55">
              {tableNumber ? `Table ${tableNumber} · ` : ""}Total
            </p>
            <p className="mt-0.5 text-lg font-extrabold">₹{grandTotal}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold">Order on WhatsApp</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense>
      <CartContent />
    </Suspense>
  );
}
