import { createClient } from "@/lib/supabase/client";

export type InternActivity = {
  id: string;
  displayName: string;
  lastActiveAt: string | null; // ISO 8601, null if never logged in or opened an app
  loginCountRecent: number; // logins in the last 30 days
  appsOpened: string[]; // app ids from config/apps.ts
};

/**
 * Derived, not stored — matches how this codebase treats other ambient
 * activity values. Null-safe: an intern who's never been active reads as
 * "not active this week," not a thrown error.
 */
export function isActiveThisWeek(lastActiveAt: string | null): boolean {
  if (!lastActiveAt) return false;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(lastActiveAt).getTime() <= sevenDaysMs;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Fetches every intern's engagement summary for the admin dashboard.
 * Requires the caller to already be an admin — relies entirely on RLS
 * (profiles/user_roles admin-select policies from Stage 1, login_events/
 * app_open_events admin-select policies from activity_events.sql) rather
 * than any privileged bypass, since this project has no service-role key.
 */
export async function fetchInternActivity(): Promise<InternActivity[]> {
  const supabase = createClient();

  const [
    { data: roles, error: rolesError },
    { data: profiles, error: profilesError },
    { data: logins, error: loginsError },
    { data: opens, error: opensError },
  ] = await Promise.all([
    supabase.from("user_roles").select("user_id, role"),
    supabase.from("profiles").select("id, display_name"),
    supabase.from("login_events").select("user_id, created_at"),
    supabase.from("app_open_events").select("user_id, app_id, created_at"),
  ]);

  const firstError = rolesError ?? profilesError ?? loginsError ?? opensError;
  if (firstError) throw firstError;

  const internIds = (roles ?? [])
    .filter((r) => r.role === "intern")
    .map((r) => r.user_id);

  const nameById = new Map(
    (profiles ?? []).map((p) => [p.id, p.display_name])
  );

  const loginsByUser = new Map<string, string[]>();
  for (const login of logins ?? []) {
    const list = loginsByUser.get(login.user_id) ?? [];
    list.push(login.created_at);
    loginsByUser.set(login.user_id, list);
  }

  const opensByUser = new Map<string, { appId: string; createdAt: string }[]>();
  for (const open of opens ?? []) {
    const list = opensByUser.get(open.user_id) ?? [];
    list.push({ appId: open.app_id, createdAt: open.created_at });
    opensByUser.set(open.user_id, list);
  }

  const cutoff = Date.now() - THIRTY_DAYS_MS;

  return internIds.map((id) => {
    const myLogins = loginsByUser.get(id) ?? [];
    const myOpens = opensByUser.get(id) ?? [];

    const allTimestamps = [...myLogins, ...myOpens.map((o) => o.createdAt)];
    const lastActiveAt = allTimestamps.length
      ? allTimestamps.reduce((max, t) => (t > max ? t : max))
      : null;

    const loginCountRecent = myLogins.filter(
      (t) => new Date(t).getTime() >= cutoff
    ).length;

    const appsOpened = Array.from(new Set(myOpens.map((o) => o.appId)));

    return {
      id,
      displayName: nameById.get(id) || "Unnamed intern",
      lastActiveAt,
      loginCountRecent,
      appsOpened,
    };
  });
}
