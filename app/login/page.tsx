"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ParticleField from "@/components/ParticleField";
import Wordmark from "@/components/Wordmark";
import { loginMock } from "@/lib/mockAuth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No real auth yet — stub a logged-in user and head to the dashboard.
    loginMock("Bert");
    router.push("/dashboard");
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
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-md rounded-3xl border border-hairline bg-surface/70 p-8 shadow-glow backdrop-blur-xl sm:p-10"
      >
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Wordmark className="text-sm" />
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to step into your space.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@inspiringchildren.org"
              className="w-full rounded-xl border border-hairline bg-bg2/70 px-4 py-3 text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
              Password
            </span>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-hairline bg-bg2/70 px-4 py-3 text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </label>

          <button
            type="submit"
            className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent2 py-3 text-base font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5 hover:brightness-110"
          >
            Sign in
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Preview mode — any details will sign you in.
        </p>
      </form>
    </div>
  );
}
