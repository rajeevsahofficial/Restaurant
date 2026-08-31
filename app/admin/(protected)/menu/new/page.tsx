"use client";

import MenuItemForm from "@/components/admin/MenuItemForm";
import Link from "next/link";

export default function NewMenuItemPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:border-white/20 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Menu Item</h1>
          <p className="mt-0.5 text-sm text-white/40">Fill in the details for your new dish</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <MenuItemForm mode="new" />
      </div>
    </div>
  );
}
