"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RESTAURANT_CONFIG } from "@/lib/config";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({ password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0a0908] flex items-center justify-center px-4">
      <div className="pointer-events-none fixed left-1/2 top-0 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-[#a96534]/15 blur-[120px]" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a96534] to-[#7a4825] shadow-lg">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">{RESTAURANT_CONFIG.name}</h1>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/5 p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-white">New password</h2>
          <p className="mt-1 text-sm text-white/45">Choose a strong password for your account</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {(["password", "confirm"] as const).map((field) => (
              <div key={field} className="space-y-1.5">
                <label htmlFor={field} className="block text-xs font-semibold uppercase tracking-widest text-white/50">
                  {field === "password" ? "New Password" : "Confirm Password"}
                </label>
                <input
                  id={field}
                  type="password"
                  required
                  value={field === "password" ? password : confirm}
                  onChange={(e) => field === "password" ? setPassword(e.target.value) : setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-[#a96534]/60 focus:ring-2 focus:ring-[#a96534]/20"
                />
              </div>
            ))}

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirm}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-br from-[#a96534] to-[#7a4825] py-3.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
