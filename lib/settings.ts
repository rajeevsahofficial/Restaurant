/**
 * Fetches live restaurant settings from Supabase.
 * Falls back to lib/config.ts values if the DB is unavailable.
 */

import { createClient } from "@/lib/supabase/client";
import { RESTAURANT_CONFIG } from "@/lib/config";

export interface LiveSettings {
  name: string;
  tagline: string;
  whatsappNumber: string;
  taxRate: number;          // decimal e.g. 0.05
  orderType: string;
  heroImage: string;
  copyrightYear: number;
  address: string;
  phone: string;
  email: string;
}

export async function fetchSettings(): Promise<LiveSettings> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("restaurant_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    // Graceful fallback to static config
    return {
      name: RESTAURANT_CONFIG.name,
      tagline: RESTAURANT_CONFIG.tagline,
      whatsappNumber: RESTAURANT_CONFIG.whatsappNumber,
      taxRate: RESTAURANT_CONFIG.taxRate,
      orderType: RESTAURANT_CONFIG.orderType,
      heroImage: RESTAURANT_CONFIG.heroImage,
      copyrightYear: RESTAURANT_CONFIG.copyrightYear,
      address: "",
      phone: "",
      email: "",
    };
  }

  return {
    name: data.name,
    tagline: data.tagline,
    whatsappNumber: data.whatsapp_number,
    taxRate: parseFloat(data.tax_rate) / 100,   // DB stores as %, e.g. 5 → 0.05
    orderType: data.order_type,
    heroImage: data.hero_image,
    copyrightYear: data.copyright_year,
    address: data.address ?? "",
    phone: data.phone ?? "",
    email: data.email ?? "",
  };
}
