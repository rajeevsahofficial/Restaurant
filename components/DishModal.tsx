"use client";

import { useState, useEffect, useCallback } from "react";
import { type Food } from "@/lib/data";
import VegBadge from "@/components/ui/VegBadge";
import Stepper from "@/components/ui/Stepper";

interface DishModalProps {
  food: Food | null;
  quantity: number;
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
  onClose: () => void;
}

export default function DishModal({
  food,
  quantity,
  onAdd,
  onRemove,
  onClose,
}: DishModalProps) {
  // Track selected customization option per customization label
  const [selections, setSelections] = useState<Record<string, string>>({});

  // Reset selections whenever the modal opens for a new dish
  useEffect(() => {
    if (!food) return;
    const defaults: Record<string, string> = {};
    food.customizations?.forEach((c) => {
      defaults[c.label] = c.options[c.defaultIndex];
    });
    setSelections(defaults);
  }, [food]);

  // Close on Escape key
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!food) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={food.name}
        className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 overflow-hidden rounded-t-[32px] bg-[#f7f5f0] shadow-2xl dark:bg-[#1a1916] animate-slide-up"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-black/15 dark:bg-white/15" />
        </div>

        {/* Hero image */}
        <div className="relative mx-4 mt-4 h-52 overflow-hidden rounded-[24px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={food.image}
            alt={food.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <VegBadge veg={food.veg} className="absolute left-3 top-3" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {food.popular && (
            <span className="absolute bottom-3 left-3 rounded-full bg-[#a96534] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Popular
            </span>
          )}
        </div>

        {/* Scrollable content */}
        <div className="max-h-[60vh] overflow-y-auto overscroll-contain px-5 pb-36 pt-5">
          {/* Title + rating */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9c8665] dark:text-[#9b8261]">
                {food.category}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#171714] dark:text-white">
                {food.name}
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-xl bg-white px-3 py-1.5 shadow-sm dark:bg-white/10">
              <span className="text-sm text-amber-500">★</span>
              <span className="text-sm font-bold dark:text-white">{food.rating}</span>
              <span className="text-xs text-black/35 dark:text-white/35">({food.reviews})</span>
            </div>
          </div>

          {/* Description */}
          <p className="mt-3 text-sm leading-relaxed text-black/55 dark:text-white/55">
            {food.description}
          </p>

          {/* Customizations */}
          {food.customizations && food.customizations.length > 0 && (
            <div className="mt-5 space-y-4">
              {food.customizations.map((c) => (
                <div key={c.label}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40 dark:text-white/40">
                    {c.label}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {c.options.map((opt) => {
                      const active = selections[c.label] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() =>
                            setSelections((prev) => ({ ...prev, [c.label]: opt }))
                          }
                          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                            active
                              ? "bg-[#1f1c17] text-white shadow-md dark:bg-white dark:text-[#1f1c17]"
                              : "border border-black/10 bg-white text-black/60 dark:border-white/10 dark:bg-white/5 dark:text-white/60"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fixed bottom CTA */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-black/[0.05] bg-[#f7f5f0]/95 px-5 pb-6 pt-3 backdrop-blur-xl dark:border-white/5 dark:bg-[#1a1916]/95">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-black/40 dark:text-white/40">Price</p>
              <p className="text-xl font-bold text-[#171714] dark:text-white">
                ₹{food.price}
              </p>
            </div>

            {quantity === 0 ? (
              <button
                onClick={() => onAdd(food.id)}
                className="rounded-2xl bg-[#a96534] px-8 py-3 text-sm font-bold text-white shadow-lg transition active:scale-95"
              >
                Add to Cart
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <Stepper
                  value={quantity}
                  onAdd={() => onAdd(food.id)}
                  onRemove={() => onRemove(food.id)}
                  size="md"
                  variant="light"
                />
                <button
                  onClick={onClose}
                  className="rounded-2xl bg-[#1f1c17] px-5 py-3 text-sm font-bold text-white shadow-lg transition active:scale-95 dark:bg-white dark:text-[#1f1c17]"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
