import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a short human-readable order ID like  ORD-4F2A */
export function generateOrderId(): string {
  return "ORD-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}
