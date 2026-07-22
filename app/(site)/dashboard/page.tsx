"use client";

import Link from "next/link";
import { useMockUser } from "@/lib/mockAuth";
import ParticleField from "@/components/ParticleField";
import SilhouetteAvatar from "@/components/dashboard/SilhouetteAvatar";
import AppBubble from "@/components/dashboard/AppBubble";
import { dashboardBubbles } from "@/lib/mockDashboard";

export default function DashboardPage() {
  const user = useMockUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-ink">You&apos;re not signed in</h1>
        <p className="mt-2 text-muted">
          Sign in to step into your personal space.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-accent2 px-6 py-3 font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5 hover:brightness-110"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <ParticleField count={40} className="opacity-50" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            Your space
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-accent2 via-accent to-glow bg-clip-text text-transparent">
              {user.name}
            </span>
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            A calm place that&apos;s just yours. Drift through your spaces —
            tap a bubble whenever you feel like it.
          </p>
        </div>

        {/* the orbiting stage */}
        <div className="relative mx-auto mt-4 h-[520px] max-w-3xl sm:h-[580px]">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <SilhouetteAvatar />
          </div>
          {dashboardBubbles.map((b, i) => (
            <AppBubble key={b.id} bubble={b} delay={i * 0.7} />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/apps"
            className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            Browse all apps →
          </Link>
        </div>
      </div>
    </div>
  );
}
