"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RESTAURANT_CONFIG } from "@/lib/config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/admin/reset-password`,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0908] flex items-center justify-center px-4">
      <div className="pointer-events-none fixed left-1/2 top-0 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-[#a96534]/15 blur-[120px]" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a96534] to-[#7a4825] shadow-lg shadow-[#a96534]/25">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">{RESTAURANT_CONFIG.name}</h1>
          <p className="mt-1 text-sm text-white/40">Admin Panel</p>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/5 p-8 backdrop-blur-xl">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 border border-green-500/20">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-green-400" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Check your inbox</h2>
              <p className="mt-2 text-sm text-white/45">
                We sent a password reset link to <span className="text-white font-medium">{email}</span>
              </p>
              <a
                href="/admin/login"
                className="mt-6 inline-flex items-center gap-2 text-sm text-[#a96534] hover:text-[#c4874f] transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back to sign in
              </a>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white">Reset password</h2>
              <p className="mt-1 text-sm text-white/45">We&apos;ll send you a recovery link</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-widest text-white/50">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@restaurant.com"
                    className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-[#a96534]/60 focus:ring-2 focus:ring-[#a96534]/20"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-br from-[#a96534] to-[#7a4825] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#a96534]/25 transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>

                <a
                  href="/admin/login"
                  className="flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Back to sign in
                </a>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
