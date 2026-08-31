"use client";

interface CartBarProps {
  totalItems: number;
  totalPrice: number;
  tableNumber: string;
  onClick: () => void;
}

export default function CartBar({
  totalItems,
  totalPrice,
  tableNumber,
  onClick,
}: CartBarProps) {
  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-[400px] -translate-x-1/2 animate-slide-up">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between rounded-[20px] bg-[#1f1c17] px-5 py-4 text-white shadow-[0_15px_45px_rgba(0,0,0,0.28)] transition active:scale-[0.98] dark:bg-white dark:text-[#1f1c17]"
      >
        {/* Left: count + price */}
        <div className="text-left">
          <p className="text-[10px] uppercase tracking-wider text-white/50 dark:text-black/50">
            {totalItems} {totalItems === 1 ? "item" : "items"}
            {tableNumber ? ` · Table ${tableNumber}` : ""}
          </p>
          <p className="mt-0.5 text-lg font-bold">₹{totalPrice}</p>
        </div>

        {/* Right: label + icon */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">View Cart</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 dark:bg-black/10">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
}
