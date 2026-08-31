"use client";

import { cn } from "@/lib/utils";

interface StepperProps {
  value: number;
  onAdd: () => void;
  onRemove: () => void;
  size?: "sm" | "md";
  variant?: "light" | "dark";
  className?: string;
}

/**
 * Reusable −/qty/+ stepper used on both the menu card and the cart page.
 */
export default function Stepper({
  value,
  onAdd,
  onRemove,
  size = "md",
  variant = "light",
  className,
}: StepperProps) {
  const outer = cn(
    "flex items-center rounded-xl p-1 transition-all",
    variant === "light" ? "bg-[#f3eee4] dark:bg-white/10" : "bg-[#a96534]",
    className
  );

  const btnSize = size === "sm" ? "h-6 w-7 text-base" : "h-6 w-7 text-lg";
  const btnBase = "flex items-center justify-center rounded-lg font-medium transition active:scale-90";
  const minW = size === "sm" ? "min-w-[12px]" : "min-w-[32px]";

  const removeBtn = cn(
    btnBase,
    btnSize,
    variant === "light"
      ? "text-[#1f1c17] dark:text-white"
      : "text-white"
  );
  const addBtn = cn(
    btnBase,
    btnSize,
    variant === "light"
      ? "bg-[#a96534] text-white shadow-sm"
      : "text-white"
  );

  return (
    <div className={outer}>
      <button onClick={onRemove} className={removeBtn} aria-label="Remove one">
        −
      </button>
      <span
        className={cn(
          "text-center text-xs font-bold",
          minW,
          variant === "light" ? "text-[#1f1c17] dark:text-white" : "text-white"
        )}
      >
        {value}
      </span>
      <button onClick={onAdd} className={addBtn} aria-label="Add one">
        +
      </button>
    </div>
  );
}
