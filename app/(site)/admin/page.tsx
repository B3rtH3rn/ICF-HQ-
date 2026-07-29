"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();

  // middleware.ts already redirects signed-out visitors and non-admins
  // before this ever renders — this is just a defensive fallback (e.g. a
  // session that expires, or a role that hasn't loaded yet, while the tab
  // is already open).
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (!isAdmin) {
      router.replace("/dashboard");
    }
  }, [loading, user, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
        Admin
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Admin dashboard
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        Placeholder — intern engagement and progress tracking is coming next.
      </p>
    </div>
  );
}
