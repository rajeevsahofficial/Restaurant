import { RESTAURANT_CONFIG } from "@/lib/config";

interface FooterProps {
  name?: string;
  tagline?: string;
  copyrightYear?: number;
  address?: string;
}

export default function Footer({ name, tagline, copyrightYear, address }: FooterProps) {
  const displayName = name || RESTAURANT_CONFIG.name;
  const displayTagline = tagline || RESTAURANT_CONFIG.tagline;
  const displayYear = copyrightYear || RESTAURANT_CONFIG.copyrightYear;
  const displayAddress = address || "123 Main Road, Dehradun, Uttarakhand";

  return (
    <footer className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#f7f5f0] to-[#f0ead9] dark:from-[#141210] dark:to-[#1a1611] pointer-events-none" />

      <div className="relative px-5 pb-3.5">
        <div className="flex flex-col items-center text-center">
          {/* Decorative top rule */}
          <div className="flex items-center gap-3 mb-5 w-full max-w-xs">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c4a97d]/40" />
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#c4a97d]" fill="currentColor">
              <path d="M12 2a1 1 0 0 1 .894.553l2.382 4.826 5.327.774a1 1 0 0 1 .554 1.706l-3.855 3.757.91 5.307a1 1 0 0 1-1.451 1.054L12 17.527l-4.761 2.504a1 1 0 0 1-1.45-1.054l.909-5.307L2.843 9.86a1 1 0 0 1 .554-1.706l5.327-.774L11.106 2.553A1 1 0 0 1 12 2Z" />
            </svg>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c4a97d]/40" />
          </div>

          <h3 className="text-base font-extrabold tracking-tight text-black/85 dark:text-white/90">
            {displayName}
          </h3>
          <p className="mt-1 text-[11px] italic text-[#8d7b61] dark:text-[#c4a97d]/70">
            {displayTagline}
          </p>

          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {["Indian", "North Indian", "Chinese"].map((c) => (
              <span
                key={c}
                className="rounded-full border border-[#c4a97d]/30 bg-[#c4a97d]/10 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-[#8d7b61] dark:border-[#c4a97d]/20 dark:bg-[#c4a97d]/5 dark:text-[#c4a97d]/60"
              >
                {c}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-start justify-center gap-1.5">
            <svg viewBox="0 0 24 24" className="mt-px h-3.5 w-3.5 shrink-0 text-[#c4a97d]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <span className="max-w-[220px] text-[10px] leading-relaxed text-black/40 dark:text-white/30">
              {displayAddress}
            </span>
          </div>
        </div>

        <div className="my-3.5 flex items-center gap-3">
          <div className="h-px flex-1 bg-black/[0.05] dark:bg-white/5" />
          <div className="h-1 w-1 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="h-px flex-1 bg-black/[0.05] dark:bg-white/5" />
        </div>

        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-[12px] text-black/30 dark:text-white/25">
            © {displayYear}&nbsp;{displayName}. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-[12px] text-black/30 dark:text-white/25">
            <span>Crafted with</span>
            <svg viewBox="0 0 16 16" className="h-3 w-3 fill-[#a96534]">
              <path d="M8 13.7C7.6 13.4 1 9.1 1 5.3 1 3 2.8 1 5 1c1.1 0 2.2.5 3 1.4C8.8 1.5 9.9 1 11 1c2.2 0 4 2 4 4.3 0 3.8-6.6 8.1-7 8.4z" />
            </svg>
            <span>for food lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
