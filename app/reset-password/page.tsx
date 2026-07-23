"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ParticleField from "@/components/ParticleField";
import Wordmark from "@/components/Wordmark";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/authErrors";

/**
 * Landing page for the link in the "forgot password" email. Supabase's
 * browser client detects the recovery session from the URL automatically on
 * load, so this page just needs to collect + submit the new password.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setError(friendlyAuthError(error.message));
      return;
    }

    setDone(true);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-12">
      <ParticleField />
      <div className="pointer-events-none absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-accent2/25 blur-[120px]" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-glow/20 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-hairline bg-surface/70 p-8 shadow-glow backdrop-blur-xl sm:p-10">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Wordmark className="text-sm" />
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink">
            Set a new password
          </h1>
        </div>

        {done ? (
          <div className="mt-8 text-center">
            <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">
              Your password has been updated.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-xl bg-accent2 px-6 py-3 text-base font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
                New password
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-hairline bg-bg2/70 px-4 py-3 text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
                Confirm new password
              </span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-hairline bg-bg2/70 px-4 py-3 text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </label>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-xl bg-accent2 py-3 text-base font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? "Saving…" : "Save new password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
