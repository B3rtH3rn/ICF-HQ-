"use client";

import Link from "next/link";
import { useMockUser, logoutMock } from "@/lib/mockAuth";

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
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
        Your space
      </p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        Welcome back,{" "}
        <span className="bg-gradient-to-r from-accent2 via-accent to-glow bg-clip-text text-transparent">
          {user.name}
        </span>
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        This is your personal dashboard. The full experience — your avatar, your
        app bubbles, and your journey over time — arrives in the next stage.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/apps"
          className="rounded-xl bg-accent2 px-6 py-3 font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5 hover:brightness-110"
        >
          Explore the apps
        </Link>
        <button
          onClick={() => logoutMock()}
          className="rounded-xl border border-hairline bg-surface/60 px-6 py-3 font-semibold text-ink transition-colors hover:border-accent"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
