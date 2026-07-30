"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { recordAppOpen } from "@/lib/activityTracking";

/**
 * Records "an intern opened this app" for the admin dashboard's engagement
 * view. Deliberately a Client Component mounted alongside the app's
 * content (not a write inside the Server Component page's render) — its
 * effect only runs after real hydration in the browser, so a Next.js
 * prefetch of the page's RSC payload can never trigger a false "open."
 * No-ops for logged-out visitors; public app browsing isn't tracked.
 */
export default function AppOpenTracker({ appId }: { appId: string }) {
  const { user } = useAuth();

  useEffect(() => {
    if (user) recordAppOpen(user.id, appId);
  }, [appId, user?.id]);

  return null;
}
