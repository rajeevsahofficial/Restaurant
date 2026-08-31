"use client";

interface CategoryPillsProps {
  active: string;
  onChange: (cat: string) => void;
  categories: string[];
}

export default function CategoryPills({ active, onChange, categories }: CategoryPillsProps) {
  return (
    <section className="mt-5">
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs transition-all duration-200 ${
              active === cat
                ? "bg-[#1f1c17] text-white shadow-lg dark:bg-white dark:text-[#1f1c17]"
                : "border border-black/5 bg-white text-black/55 dark:border-white/10 dark:bg-white/5 dark:text-white/55"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </section>
  );
}
