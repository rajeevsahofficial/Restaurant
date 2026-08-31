import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#171714]">
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-white shadow-sm text-4xl">
          🍽️
        </div>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9b8261]">
          404 — Not Found
        </p>

        <h1 className="mt-2 text-2xl font-bold">Page doesn&apos;t exist</h1>

        <p className="mt-3 max-w-[260px] text-sm leading-6 text-black/40">
          Looks like this page went off the menu. Head back and explore our dishes.
        </p>

        <Link
          href="/"
          className="mt-8 rounded-2xl bg-[#1f1c17] px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition active:scale-[0.98]"
        >
          Back to Menu
        </Link>
      </main>
    </div>
  );
}
