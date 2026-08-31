"use client";

import { type Food } from "@/lib/data";
import VegBadge from "@/components/ui/VegBadge";
import Stepper from "@/components/ui/Stepper";

interface DishCardProps {
  food: Food;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  onOpenDetail: () => void;
}

export default function DishCard({
  food,
  quantity,
  onAdd,
  onRemove,
  onOpenDetail,
}: DishCardProps) {
  return (
    <article className="overflow-hidden rounded-[24px] border border-black/[0.04] bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-transform duration-200 active:scale-[0.99] dark:border-white/5 dark:bg-[#1e1c18] dark:shadow-none">
      <div className="flex gap-4">
        {/* Image */}
        <button
          onClick={onOpenDetail}
          className="relative h-[118px] w-[118px] shrink-0 overflow-hidden rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a96534]"
          aria-label={`View details for ${food.name}`}
        >
          <img
            src={food.image}
            alt={food.name}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
          <VegBadge veg={food.veg} className="absolute left-2 top-2" />
          {food.popular && (
            <span className="absolute bottom-2 left-2 rounded-full bg-[#a96534] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow">
              Popular
            </span>
          )}
        </button>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex justify-between">
            <p className="text-[10px] font-medium uppercase tracking-wider text-black/35 dark:text-white/35">
              {food.category}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-amber-500">★</span>
              <span className="text-xs font-semibold dark:text-white/80">
                {food.rating}
              </span>
              <span className="text-xs text-black/30 dark:text-white/30">
                ({food.reviews})
              </span>
            </div>
          </div>

          <button
            onClick={onOpenDetail}
            className="mt-1 text-left focus-visible:outline-none"
          >
            <h3 className="text-base font-bold leading-tight text-[#171714] dark:text-white">
              {food.name}
            </h3>
          </button>

          <p className="mt-1.5 line-clamp-2 text-[11px] leading-[1.5] text-black/45 dark:text-white/40">
            {food.description}
          </p>

          {/* Price + CTA */}
          <div className="mt-auto flex items-end justify-between pt-2">
            <div>
              <span className="text-xs text-black/60 dark:text-white/40">₹</span>
              <span className="text-md font-bold text-[#171714] dark:text-white">
                {food.price}
              </span>
            </div>

            {quantity === 0 ? (
              <button
                onClick={onAdd}
                className="rounded-xl bg-[#a96534] px-3 py-2 transition active:scale-95"
              >
                <p className="text-xs text-white">ADD</p>
              </button>
            ) : (
              <Stepper
                value={quantity}
                onAdd={onAdd}
                onRemove={onRemove}
                size="sm"
                variant="dark"
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
