"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type Cart = Record<number, number>;

interface CartContextValue {
  cart: Cart;
  addItem: (id: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  totalItems: number;
  /** Table number read from the QR code URL (?table=N). Defaults to "—" until set. */
  tableNumber: string;
  setTableNumber: (t: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({});
  const [tableNumber, setTableNumber] = useState<string>("");

  const addItem = useCallback((id: number) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }, []);

  const removeItem = useCallback((id: number) => {
    setCart((prev) => {
      const qty = (prev[id] ?? 0) - 1;
      if (qty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: qty };
    });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  const totalItems = Object.values(cart).reduce((sum, q) => sum + q, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        clearCart,
        totalItems,
        tableNumber,
        setTableNumber,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
