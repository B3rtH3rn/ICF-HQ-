"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ParticleField from "@/components/ParticleField";
import Wordmark from "@/components/Wordmark";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/authErrors";
import { recordLogin } from "@/lib/activityTracking";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/dashboard";

  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (error) {
      setError(friendlyAuthError(error.message));
      return;
    }

    recordLogin(data.user.id);

    router.push(redirectedFrom);
    router.refresh();
  };

  const onForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setSubmitting(false);
    // Same message whether or not the account exists — no account enumeration.
    setNotice("If an account exists for that email, a reset link is on its way.");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-12">
      {/* ambient background */}
      <ParticleField />
      <div className="pointer-events-none absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-accent2/25 blur-[120px]" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-glow/20 blur-[120px]" />

      {/* rotating HUD rings */}
      <div className="pointer-events-none absolute flex items-center justify-center">
        <div
          className="h-[560px] w-[560px] animate-spin-slow rounded-full opacity-50"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0 62%, rgb(var(--accent) / 0.55) 82%, transparent 92%)",
            WebkitMaskImage:
              "radial-gradient(closest-side, transparent 79%, #000 80%, #000 82%, transparent 83%)",
            maskImage:
              "radial-gradient(closest-side, transparent 79%, #000 80%, #000 82%, transparent 83%)",
          }}
        />
        <div className="absolute h-[420px] w-[420px] rounded-full border border-accent/15" />
        <div className="absolute h-[560px] w-[560px] rounded-full border border-accent2/10" />
        <div
          className="absolute h-[680px] w-[680px] animate-spin-slower rounded-full opacity-40"
          style={{
            background:
              "conic-gradient(from 180deg, transparent 0 70%, rgb(var(--accent-2) / 0.5) 86%, transparent 94%)",
            WebkitMaskImage:
              "radial-gradient(closest-side, transparent 82%, #000 83%, #000 84%, transparent 85%)",
            maskImage:
              "radial-gradient(closest-side, transparent 82%, #000 83%, #000 84%, transparent 85%)",
          }}
        />
      </div>

      {/* card */}
      <form
        onSubmit={mode === "signin" ? onSubmit : onForgotSubmit}
        className="relative z-10 w-full max-w-md rounded-3xl border border-hairline bg-surface/70 p-8 shadow-glow backdrop-blur-xl sm:p-10"
      >
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Wordmark className="text-sm" />
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink">
            {mode === "signin" ? "Welcome back" : "Reset your password"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {mode === "signin"
              ? "Sign in to step into your space."
              : "We'll email you a link to set a new password."}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@inspiringchildren.org"
              className="w-full rounded-xl border border-hairline bg-bg2/70 px-4 py-3 text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </label>

          {mode === "signin" && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
                Password
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-hairline bg-bg2/70 px-4 py-3 text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </label>
          )}

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent2 py-3 text-base font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {submitting
              ? "Please wait…"
              : mode === "signin"
                ? "Sign in"
                : "Send reset link"}
            {!submitting && (
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            )}
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-muted">
          {mode === "signin" ? (
            <button
              type="button"
              onClick={() => {
                setMode("forgot");
                setError(null);
                setNotice(null);
              }}
              className="underline-offset-2 hover:text-ink hover:underline"
            >
              Forgot password?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
                setNotice(null);
              }}
              className="underline-offset-2 hover:text-ink hover:underline"
            >
              ← Back to sign in
            </button>
          )}
          <p>
            New here?{" "}
            <Link
              href="/signup"
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
