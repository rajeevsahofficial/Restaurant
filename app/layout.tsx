import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-store";
import { RESTAURANT_CONFIG } from "@/lib/config";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: `${RESTAURANT_CONFIG.name} — Digital Menu`,
    template: `%s | ${RESTAURANT_CONFIG.name}`,
  },
  description: `Order from ${RESTAURANT_CONFIG.name}. Scan the QR code at your table, browse our menu and place your order directly on WhatsApp.`,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CartProvider>{children}</CartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1e1c18",
              color: "#f5f0e8",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 500,
              padding: "12px 16px",
            },
            success: {
              iconTheme: { primary: "#a96534", secondary: "#1e1c18" },
            },
            error: {
              iconTheme: { primary: "#f87171", secondary: "#1e1c18" },
            },
          }}
        />
      </body>
    </html>
  );
}
