"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
        Sign in to the Admin Panel
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await createClient().auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--admin-bg)" }}
    >
      <div className="w-full max-w-[400px]">
        <BrandHeader />

        {/* Form card */}
        <div
          className="rounded-xl px-8 py-8 shadow-sm"
          style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border)" }}
        >
          <form onSubmit={handleLogin} className="space-y-5" noValidate>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[13px] font-semibold" style={{ color: "var(--admin-text-primary)" }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your gmail"
                className="admin-input"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-[13px] font-semibold" style={{ color: "var(--admin-text-primary)" }}>
                  Password
                </label>
                <a
                  href="/admin/forgot-password"
                  className="text-xs font-medium transition-colors hover:underline"
                  style={{ color: "var(--admin-accent)" }}
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="admin-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  style={{ color: "var(--admin-text-muted)" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <path d="m1 1 22 22" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div
                className="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm"
                style={{ background: "var(--admin-danger-bg)", border: "1px solid var(--admin-danger-border)", color: "var(--admin-danger)" }}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6M9 9l6 6" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white shadow transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "var(--admin-accent)" }}
            >
              {loading ? <><Spinner />Signing in…</> : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "var(--admin-text-muted)" }}>
          © {RESTAURANT_CONFIG.copyrightYear} {RESTAURANT_CONFIG.name}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
