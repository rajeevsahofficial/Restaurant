"use client";

import Link from "next/link";
import MenuItemForm from "@/components/admin/MenuItemForm";

export default function NewMenuItemPage() {
  return (
    <div className="px-4 pt-24 pb-6 sm:pt-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:opacity-70"
          style={{ border: "1px solid var(--admin-border-strong)", color: "var(--admin-text-secondary)", background: "var(--admin-card-bg)" }}
          aria-label="Back to menu"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--admin-text-primary)" }}>
            Add Menu Item
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--admin-text-secondary)" }}>
            Fill in the details for your new dish
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <MenuItemForm mode="new" />
      </div>
    </div>
  );
}
