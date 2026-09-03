"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RESTAURANT_CONFIG } from "@/lib/config";
import { fetchSettings, type LiveSettings } from "@/lib/settings";
import { useCart } from "@/lib/cart-store";
import DishCard from "@/components/DishCard";
import DishModal from "@/components/DishModal";
import CategoryPills from "@/components/CategoryPills";
import CartBar from "@/components/CartBar";
import type { Food } from "@/lib/data";
import Navbar from "@/components/header";
import Footer from "@/components/footer";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, addItem, removeItem, totalItems, tableNumber, setTableNumber } = useCart();

  const [foods, setFoods] = useState<Food[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<string[]>(["All", "Popular"]);
  const [siteSettings, setSiteSettings] = useState<LiveSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedDish, setSelectedDish] = useState<Food | null>(null);

  /* Read ?table= once on mount */
  useEffect(() => {
    const t = searchParams.get("table");
    if (t?.trim()) setTableNumber(t.trim());
  }, [searchParams, setTableNumber]);

  /* Fetch menu from Supabase — only available items */
  useEffect(() => {
    async function fetchMenu() {
      const supabase = createClient();

      // Fetch menu items, categories and settings in parallel
      const [menuRes, catsRes, liveSettings] = await Promise.all([
        supabase
          .from("menu_items")
          .select("*")
          .eq("available", true)
          .order("id", { ascending: true }),
        supabase
          .from("categories")
          .select("name")
          .order("sort_order", { ascending: true }),
        fetchSettings(),
      ]);

      if (!menuRes.error && menuRes.data) {
        const mapped: Food[] = menuRes.data.map((row) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          price: row.price,
          rating: row.rating,
          reviews: row.reviews,
          category: row.category,
          veg: row.veg,
          image: row.image,
          popular: row.popular,
          available: row.available,
          customizations: row.customizations ?? [],
        }));
        setFoods(mapped);
      }

      // Build category pills: All + Popular + DB order
      if (!catsRes.error && catsRes.data) {
        setDynamicCategories([
          "All",
          "Popular",
          ...catsRes.data.map((c) => c.name),
        ]);
      }

      setSiteSettings(liveSettings);
      setLoading(false);
    }
    fetchMenu();
  }, []);

  const totalPrice = foods.reduce(
    (sum, f) => sum + f.price * (cart[f.id] ?? 0),
    0,
  );

  const filteredFoods = foods.filter((food) => {
    const matchCat =
      activeCategory === "All" ||
      (activeCategory === "Popular" && food.popular) ||
      food.category === activeCategory;
    const matchSearch = food.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#171714] dark:bg-[#141210] dark:text-white">
      <main className="mx-auto min-h-screen max-w-md bg-[#f7f5f0] dark:bg-[#141210]">
        <Navbar tableNumber={tableNumber} restaurantName={siteSettings?.name} />

        {/* ── Hero ── */}
        <section className="px-5 pt-5">
          <div className="relative overflow-hidden rounded-[28px] bg-[#242018]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={siteSettings?.heroImage ?? RESTAURANT_CONFIG.heroImage}
              alt={siteSettings?.name ?? RESTAURANT_CONFIG.name}
              className="h-52 w-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <span className="mb-3 w-fit rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                Chef&apos;s Selection
              </span>
              <h2 className="max-w-[250px] text-3xl font-semibold leading-[1.05] text-white">
                {siteSettings?.tagline ?? RESTAURANT_CONFIG.tagline}
              </h2>
              {tableNumber && (
                <p className="mt-2 w-fit rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80 backdrop-blur-sm">
                  Table {tableNumber} · {siteSettings?.orderType ?? RESTAURANT_CONFIG.orderType}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── Search ── */}
        <section className="px-5 pt-5">
          <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3.5 dark:border-white/5 dark:bg-white/5">
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-black/40 dark:text-white/40" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              placeholder="Search for dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent pl-3 text-sm outline-none placeholder:text-black/35 dark:placeholder:text-white/30 dark:text-white"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-black/30 dark:text-white/30"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </section>

        {/* ── Category Pills ── */}
        <CategoryPills
          active={activeCategory}
          onChange={setActiveCategory}
          categories={dynamicCategories}
        />

        {/* ── Section heading ── */}
        <section className="px-5 pb-3 pt-7">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9c8665]">
                Handpicked for you
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                {activeCategory === "All" ? "All Dishes" : activeCategory}
              </h2>
            </div>
            <span className="text-xs text-black/35 dark:text-white/35">
              {loading ? "…" : `${filteredFoods.length} items`}
            </span>
          </div>
        </section>

        {/* ── Food list ── */}
        <section className="space-y-4 px-5 pb-6">
          {loading ? (
            /* Skeleton */
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[142px] animate-pulse rounded-[24px] bg-black/5 dark:bg-white/5" />
            ))
          ) : filteredFoods.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl dark:bg-white/10">
                🔍
              </div>
              <h3 className="mt-4 font-bold">No dishes found</h3>
              <p className="mt-1 text-sm text-black/40 dark:text-white/40">
                Try a different search or category.
              </p>
              <button
                onClick={() => { setSearch(""); setActiveCategory("All"); }}
                className="mt-4 rounded-xl bg-[#1f1c17] px-5 py-2 text-xs font-semibold text-white dark:bg-white dark:text-[#1f1c17]"
              >
                Show all
              </button>
            </div>
          ) : (
            filteredFoods.map((food) => (
              <DishCard
                key={food.id}
                food={food}
                quantity={cart[food.id] ?? 0}
                onAdd={() => addItem(food.id)}
                onRemove={() => removeItem(food.id)}
                onOpenDetail={() => setSelectedDish(food)}
              />
            ))
          )}
        </section>

        <Footer
          name={siteSettings?.name}
          tagline={siteSettings?.tagline}
          copyrightYear={siteSettings?.copyrightYear}
          address={siteSettings?.address}
          phone={siteSettings?.phone}
          email={siteSettings?.email}
        />
      </main>

      {/* ── Dish detail modal ── */}
      <DishModal
        food={selectedDish}
        quantity={selectedDish ? (cart[selectedDish.id] ?? 0) : 0}
        onAdd={addItem}
        onRemove={removeItem}
        onClose={() => setSelectedDish(null)}
      />

      {/* ── Sticky cart bar ── */}
      <CartBar
        totalItems={totalItems}
        totalPrice={totalPrice}
        tableNumber={tableNumber}
        onClick={() =>
          router.push(tableNumber ? `/cart?table=${tableNumber}` : "/cart")
        }
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
