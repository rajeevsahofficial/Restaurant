"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import MenuItemForm from "@/components/admin/MenuItemForm";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

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
  customizations: { label: string; options: string[]; defaultIndex: number }[];
}

export default function EditMenuItemPage({ params }: Props) {
  const { id } = use(params);
  const supabase = createClient();

  const [item, setItem] = useState<DbMenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound404, setNotFound404] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) { setNotFound404(true); }
      else { setItem(data); }
      setLoading(false);
    }
    load();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3">
        <svg
          className="h-5 w-5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: "var(--admin-accent)" }}
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm" style={{ color: "var(--admin-text-secondary)" }}>Loading item…</p>
      </div>
    );
  }

  if (notFound404 || !item) return notFound();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:opacity-70"
          style={{
            border: "1px solid var(--admin-border-strong)",
            color: "var(--admin-text-secondary)",
            background: "var(--admin-card-bg)",
          }}
          aria-label="Back to menu"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <div className="min-w-0 flex-1">
          <h1
            className="truncate text-2xl font-bold"
            style={{ color: "var(--admin-text-primary)" }}
          >
            Edit: {item.name}
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--admin-text-secondary)" }}>
            {item.category} · ₹{item.price}
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <MenuItemForm
          mode="edit"
          initialData={{
            dbId: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            rating: item.rating,
            reviews: item.reviews,
            category: item.category,
            veg: item.veg,
            popular: item.popular,
            available: item.available,
            image: item.image,
            customizations: item.customizations,
          }}
        />
      </div>
    </div>
  );
}
