"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RESTAURANT_CONFIG } from "@/lib/config";

// ── Sub-components ─────────────────────────────────────────────────────────────

function BrandHeader() {
  return (
    <div className="mb-8 text-center">
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-md"
        style={{ background: "var(--admin-accent)" }}
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11l19-9-9 19-2-8-8-2z" />
        </svg>
      </div>
      <h1 className="text-[22px] font-bold" style={{ color: "var(--admin-text-primary)" }}>
        {RESTAURANT_CONFIG.name}
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--admin-text-secondary)" }}>
        Admin Panel
      </p>
    </div>
  );
}

function BackToSignIn() {
  return (
    <a
      href="/admin/login"
      className="flex items-center justify-center gap-2 text-sm transition-colors hover:underline"
      style={{ color: "var(--admin-text-secondary)" }}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m15 18-6-6 6-6" />
      </svg>
      Back to sign in
    </a>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await createClient().auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/admin/reset-password` },
    );

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--admin-bg)" }}
    >
      <div className="w-full max-w-[400px]">
        <BrandHeader />

        <div
          className="rounded-xl px-8 py-8 shadow-sm"
          style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border)" }}
        >
          {sent ? (
            /* ── Success state ── */
            <div className="text-center">
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: "var(--admin-success-bg)", border: "1px solid var(--admin-success-border)" }}
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--admin-success)" }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-lg font-bold" style={{ color: "var(--admin-text-primary)" }}>
                Check your inbox
              </h2>
              <p className="mt-2 text-sm" style={{ color: "var(--admin-text-secondary)" }}>
                We sent a reset link to{" "}
                <span className="font-semibold" style={{ color: "var(--admin-text-primary)" }}>
                  {email}
                </span>
              </p>
              <a
                href="/admin/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline"
                style={{ color: "var(--admin-accent)" }}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back to sign in
              </a>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <h2 className="text-xl font-bold" style={{ color: "var(--admin-text-primary)" }}>
                Reset password
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--admin-text-secondary)" }}>
                We&apos;ll send you a recovery link
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-[13px] font-semibold" style={{ color: "var(--admin-text-primary)" }}>
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@restaurant.com"
                    className="admin-input"
                  />
                </div>

                {error && (
                  <div
                    className="rounded-lg px-4 py-3 text-sm"
                    style={{ background: "var(--admin-danger-bg)", border: "1px solid var(--admin-danger-border)", color: "var(--admin-danger)" }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--admin-accent)" }}
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>

                <BackToSignIn />
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
