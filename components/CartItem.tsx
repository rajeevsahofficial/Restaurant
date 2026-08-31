"use client";

import { type Food } from "@/lib/data";
import VegBadge from "@/components/ui/VegBadge";
import Stepper from "@/components/ui/Stepper";

interface CartItemProps {
  food: Food;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  customizations?: Record<string, string>;
}

export default function CartItem({
  food,
  quantity,
  onAdd,
  onRemove,
  customizations,
}: CartItemProps) {
  const customList = customizations
    ? Object.entries(customizations)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" · ")
    : null;

  return (
    <article className="rounded-[22px] border border-black/[0.04] bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.035)] transition-all dark:border-white/5 dark:bg-[#1e1c18]">
      <div className="flex gap-3">
        {/* Image */}
        <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[16px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={food.image}
            alt={food.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <VegBadge veg={food.veg} className="absolute left-1.5 top-1.5" />
        </div>

        {/* Details */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-black/30 dark:text-white/30">
              {food.category}
            </p>
            <h3 className="mt-0.5 truncate text-[15px] font-bold text-[#171714] dark:text-white">
              {food.name}
            </h3>
            {customList && (
              <p className="mt-0.5 truncate text-[10px] text-black/40 dark:text-white/40">
                {customList}
              </p>
            )}
          </div>

          <div className="mt-auto flex items-end justify-between">
            <div>
              <p className="text-[10px] text-black/35 dark:text-white/35">
                ₹{food.price} each
              </p>
              <p className="mt-0.5 text-base font-bold text-[#171714] dark:text-white">
                ₹{food.price * quantity}
              </p>
            </div>

            <Stepper
              value={quantity}
              onAdd={onAdd}
              onRemove={onRemove}
              size="sm"
              variant="light"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
