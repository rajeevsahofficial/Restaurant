"use client";

interface CategoryPillsProps {
  active: string;
  onChange: (cat: string) => void;
  categories: string[];
}

export default function CategoryPills({
  active,
  onChange,
  categories,
}: CategoryPillsProps) {
  return (
    <section className="mt-6">
      <div className="no-scrollbar flex items-center gap-2.5 overflow-x-auto px-4 pb-2">
        {categories.map((cat) => {
          const isActive = active === cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              className={`
                shrink-0 whitespace-nowrap rounded-full border px-4 py-1 text-[13px] font-medium transition-all duration-200 active:scale-[0.97]
                ${isActive ? `border-[#e8c978] bg-[#fff7df] text-[#8a6417] shadow-sm                 `
                  : `border-[#ebe8e1] bg-white text-[#77736b] hover:bg-[#faf9f6] hover:text-[#403d37]`
                }
              `}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </section>
  );
}