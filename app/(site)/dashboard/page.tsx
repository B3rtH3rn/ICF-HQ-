"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import ParticleField from "@/components/ParticleField";
import ConfigurableAvatar from "@/components/dashboard/ConfigurableAvatar";
import AvatarCustomizer from "@/components/dashboard/AvatarCustomizer";
import AppBubble from "@/components/dashboard/AppBubble";
import SidePanel from "@/components/dashboard/SidePanel";
import { dashboardBubbles } from "@/lib/mockDashboard";
import { defaultAvatarConfig, AvatarConfig } from "@/lib/avatarOptions";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [config, setConfig] = useState<AvatarConfig>(defaultAvatarConfig);
  const [customizing, setCustomizing] = useState(false);

  // middleware.ts already redirects signed-out visitors before this ever
  // renders — this is just a defensive fallback (e.g. a session that expires
  // while the tab is already open).
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // Load the saved avatar from the user's profile once it resolves.
  useEffect(() => {
    if (!profile) return;
    setConfig({
      color: profile.avatar_color,
      energy: profile.avatar_energy,
      symbols: profile.avatar_symbols ?? [],
    });
  }, [profile]);

  const handleSave = async (c: AvatarConfig) => {
    setConfig(c);
    if (!user) return;
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({
        avatar_color: c.color,
        avatar_energy: c.energy,
        avatar_symbols: c.symbols,
      })
      .eq("id", user.id);
    refreshProfile();
  };

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-muted">Loading your space…</p>
      </div>
    );
  }

  const displayName = profile?.display_name || user.email?.split("@")[0] || "there";

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
              {displayName}
            </span>
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            A calm place that&apos;s just yours. Drift through your spaces —
            tap a bubble whenever you feel like it.
          </p>
        </div>

        {/* rail + stage */}
        <div className="mt-6 flex flex-col-reverse gap-6 lg:flex-row lg:items-start lg:gap-8">
          <aside className="lg:w-72 lg:flex-shrink-0">
            <button
              type="button"
              onClick={() => setCustomizing(true)}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-hairline bg-surface/60 px-4 py-3 text-sm font-semibold text-ink backdrop-blur transition-colors hover:border-accent"
            >
              <span className="text-accent">✦</span> Personalize your figure
            </button>
            <SidePanel />
          </aside>

          {/* the floating stage */}
          <div className="relative h-[500px] flex-1 sm:h-[560px]">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <ConfigurableAvatar config={config} />
            </div>
            {dashboardBubbles.map((b, i) => (
              <AppBubble key={b.id} bubble={b} delay={i * 0.7} />
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/apps"
            className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            Browse all apps →
          </Link>
        </div>
      </div>

      <AvatarCustomizer
        open={customizing}
        onClose={() => setCustomizing(false)}
        initial={config}
        onSave={handleSave}
      />
    </div>
  );
}
