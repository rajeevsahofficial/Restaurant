/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  RESTAURANT CONFIG  —  only edit this file to customise the app
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const RESTAURANT_CONFIG = {
  /** Displayed in the header, hero, WhatsApp message, footer, metadata */
  name: "The Spice House",

  /** Short tagline shown in the hero */
  tagline: "Crafted to make you crave more.",

  /**
   * WhatsApp number to receive orders.
   * Format: country code + number, NO + sign, NO spaces.
   * Example: "919876543210"  →  +91 98765 43210
   */
  whatsappNumber: "919508690371",

  /** GST / tax rate applied to every order (0.05 = 5%) */
  taxRate: 0.05,

  /** Default order type shown in the cart */
  orderType: "Dine In",

  /** Hero background image URL */
  heroImage:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",

  /** Footer copyright year */
  copyrightYear: 2026,
} as const;
