/**
 * MOCK DASHBOARD DATA — placeholder only.
 * Stands in for a real "this user's apps + gentle activity" feed until auth and
 * per-user data exist. `activity` (0..1) drives only the softness of a bubble's
 * glow — intentionally NOT shown as a number, to keep the dashboard ambient and
 * non-evaluative rather than a score/report card. `note` is a warm one-liner
 * revealed on hover.
 */

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
    id: "mood-tracker",
    title: "Daily Mood Tracker",
    emoji: "🌤️",
    href: "/apps/mood-tracker",
    activity: 0.8,
    note: "A few gentle check-ins lately",
    pos: { left: "21%", top: "26%" },
    size: 102,
  },
  {
    id: "calm-breathing",
    title: "Calm Breathing Buddy",
    emoji: "🫧",
    href: "/apps/calm-breathing",
    activity: 0.55,
    note: "You paused to breathe recently",
    pos: { left: "76%", top: "22%" },
    size: 88,
  },
  {
    id: "summer-challenge",
    title: "Summer Challenge",
    emoji: "☀️",
    activity: 0.3,
    note: "Coming soon",
    pos: { left: "85%", top: "58%" },
    size: 84,
  },
  {
    id: "college-process",
    title: "College Process",
    emoji: "🎓",
    activity: 0.25,
    note: "Coming soon",
    pos: { left: "70%", top: "82%" },
    size: 80,
  },
  {
    id: "journal",
    title: "Journal",
    emoji: "📔",
    activity: 0.2,
    note: "Coming soon",
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
];
