import { createClient } from "@/lib/supabase/client";

/**
 * Best-effort telemetry for the admin dashboard's engagement view — a
 * failure here (network hiccup, migration not yet run) must never block
 * sign-in, signup, or viewing an app, so errors are swallowed rather than
 * surfaced. Callers invoke these unawaited for the same reason: a
 * redirect or page view shouldn't wait on a non-critical write.
 */

export async function recordLogin(userId: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from("login_events").insert({ user_id: userId });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("recordLogin failed", err);
    }
  }
}

export async function recordAppOpen(
  userId: string,
  appId: string
): Promise<void> {
  try {
    const supabase = createClient();
    await supabase
      .from("app_open_events")
      .insert({ user_id: userId, app_id: appId });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("recordAppOpen failed", err);
    }
  }
}
