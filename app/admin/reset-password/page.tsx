"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RESTAURANT_CONFIG } from "@/lib/config";

// ── Validation ─────────────────────────────────────────────────────────────────

function validatePasswords(password: string, confirm: string): string | null {
  if (password !== confirm) return "Passwords do not match.";
  if (password.length < 8)  return "Password must be at least 8 characters.";
  return null;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validatePasswords(password, confirm);
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError(null);

    const { error: authError } = await createClient().auth.updateUser({ password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--admin-bg)" }}
    >
      <div className="w-full max-w-[400px]">

        {/* Brand header */}
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
            Set a new password
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl px-8 py-8 shadow-sm"
          style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border)" }}
        >
          <h2 className="text-xl font-bold" style={{ color: "var(--admin-text-primary)" }}>
            New password
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--admin-text-secondary)" }}>
            Choose a strong password for your account
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            {(["password", "confirm"] as const).map((field) => (
              <div key={field} className="space-y-1.5">
                <label
                  htmlFor={field}
                  className="block text-[13px] font-semibold"
                  style={{ color: "var(--admin-text-primary)" }}
                >
                  {field === "password" ? "New Password" : "Confirm Password"}
                </label>
                <input
                  id={field}
                  type="password"
                  required
                  value={field === "password" ? password : confirm}
                  onChange={(e) => field === "password" ? setPassword(e.target.value) : setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="admin-input"
                />
              </div>
            ))}

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
              disabled={loading || !password || !confirm}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--admin-accent)" }}
            >
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
