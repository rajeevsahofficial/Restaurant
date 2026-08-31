/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Shared Types — used by both the customer-facing menu and the admin panel
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Menu ─────────────────────────────────────────────────────────────────────

export interface Customization {
  label: string;       // e.g. "Spice Level"
  options: string[];   // e.g. ["Mild", "Medium", "Hot", "Extra Hot"]
  defaultIndex: number;
}

export interface Food {
  id: number;
  name: string;
  description: string;
  price: number;          // ₹ integer
  rating: number;
  reviews: number;
  category: string;
  veg: boolean;
  image: string;
  popular?: boolean;
  available?: boolean;    // admin can toggle
  customizations?: Customization[];
}

export type Category = string;

// ── Orders ────────────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";

export interface OrderItem {
  food_id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  table_number: string;
  customer_name: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  grand_total: number;
  status: OrderStatus;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

// ── Tables ────────────────────────────────────────────────────────────────────

export interface RestaurantTable {
  id: number;
  number: number;
  label: string;       // e.g. "Table 1"
  capacity: number;
  active: boolean;
  qr_url?: string;
}

// ── Restaurant Config (DB-driven mirror of lib/config.ts) ─────────────────────

export interface RestaurantConfig {
  name: string;
  tagline: string;
  whatsapp_number: string;
  tax_rate: number;
  order_type: string;
  hero_image: string;
  copyright_year: number;
  currency_symbol: string;
  address?: string;
  phone?: string;
  email?: string;
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

// ── Dashboard stats ───────────────────────────────────────────────────────────

export interface DashboardStats {
  total_orders_today: number;
  revenue_today: number;
  active_tables: number;
  menu_items: number;
  pending_orders: number;
  top_items: { name: string; count: number }[];
}
