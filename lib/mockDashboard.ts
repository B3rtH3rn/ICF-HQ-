/**
 * MOCK DASHBOARD DATA — placeholder only.
 * Stands in for a real "this user's apps + gentle activity" feed until auth and
 * per-user data exist. `activity` (0..1) drives only the softness of a bubble's
 * glow — intentionally NOT shown as a number, to keep the dashboard ambient and
 * non-evaluative rather than a score/report card. `note` is a warm one-liner
 * revealed on hover.
 *
 * Each bubble's `href` is resolved from the app registry via `getAppRoute()`
 * rather than hardcoded, so a bubble automatically falls back to "coming
 * soon" (no href, not clickable) if its app id ever stops resolving to a
 * real route — instead of silently linking to a dead page.
 */

import { getAppRoute } from "@/config/apps";

export type DashboardBubble = {
  id: string;
  title: string;
  emoji: string;
  href?: string; // omitted = "coming soon" (not yet built)
  external?: boolean;
  activity: number; // 0..1, ambient glow only
  note: string;
  pos: { left: string; top: string };
  size: number;
};

/**
 * Ambient "your journey" series (0..1 per point, oldest → newest). Drives only
 * the shape of a soft glowing wave — no axes, numbers, or exact values shown.
 * Reads as a gentle rhythm, not a metric.
 */
export const journeySeries = [
  0.25, 0.4, 0.32, 0.52, 0.46, 0.62, 0.55, 0.7, 0.6, 0.8, 0.72, 0.88,
];

export const dashboardBubbles: DashboardBubble[] = [
  {
    // Was "mood-tracker" / "Daily Mood Tracker" — that app was renamed to
    // Inspire Daily a while back (see config/apps.ts), which left this
    // bubble's old hardcoded href silently pointing at a dead page. Fixed
    // in place rather than adding a second bubble for the same app.
    id: "inspire-daily",
    title: "Inspire Daily",
    emoji: "🌤️",
    href: getAppRoute("inspire-daily"),
    activity: 0.8,
    note: "A few gentle check-ins lately",
    pos: { left: "21%", top: "26%" },
    size: 102,
  },
  {
    id: "college-process",
    title: "College Process Tracker",
    emoji: "🎓",
    href: getAppRoute("college-process"),
    activity: 0.25,
    note: "Your college journey, all in one place",
    pos: { left: "70%", top: "82%" },
    size: 80,
  },
  {
    id: "journal",
    title: "Journal",
    emoji: "📔",
    href: getAppRoute("journal"),
    activity: 0.2,
    note: "A quiet space to reflect — more coming soon",
    pos: { left: "20%", top: "76%" },
    size: 78,
  },
  {
    id: "gratitude",
    title: "Gratitude",
    emoji: "✨",
    activity: 0.25,
    note: "Coming soon",
    pos: { left: "13%", top: "52%" },
    size: 72,
  },
  {
    id: "office-clean-up",
    title: "Office Clean Up",
    emoji: "🧹",
    href: getAppRoute("office-clean-up"),
    activity: 0.3,
    note: "A few tasks tidied up recently",
    pos: { left: "78%", top: "28%" },
    size: 82,
  },
];
