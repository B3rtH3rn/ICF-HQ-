/**
 * APP REGISTRY
 * ------------
 * This is the single source of truth for every app on the hub.
 * To add a new app, add ONE new object to the `apps` array below — you never
 * need to touch any page or routing code. See README.md for full step-by-step
 * instructions written for non-developers.
 */

export type AppType = "embedded" | "external";

export interface AppEntry {
  /** Unique, URL-safe id. Lowercase letters, numbers, and hyphens only. */
  id: string;
  /** Display name shown on the card and app page. */
  title: string;
  /** One or two sentences describing what the app does. */
  description: string;
  /** Name of the student/team who built it. Optional. */
  creatorName?: string;
  /** Path to a thumbnail image under /public, e.g. "/mini-apps/mood-tracker/thumbnail.png". Optional — falls back to emoji. */
  thumbnail?: string;
  /** Emoji shown when no thumbnail is provided. */
  emoji?: string;
  /**
   * "embedded"  -> the app's files live in /public/mini-apps/<id>/ and are shown
   *                inside the hub via an iframe at /apps/<id>.
   * "external"  -> the app is hosted somewhere else; the card links out to
   *                `url` in a new tab.
   *
   * NOTE: embedded assets live under /public/mini-apps/ rather than /public/apps/
   * on purpose — that keeps them from colliding with the /apps/<id> hub route
   * itself, which some static hosts (e.g. Vercel) treat as a URL conflict.
   */
  type: AppType;
  /**
   * For "embedded" apps: path to the app's folder under /public, with a
   * trailing slash, e.g. "/mini-apps/mood-tracker/" (the folder must contain
   * an index.html). For "external" apps: the full URL to the app, e.g.
   * "https://my-app.vercel.app".
   */
  url: string;
  /** Keywords used by the search/filter bar. */
  tags: string[];
  /** ISO date string (YYYY-MM-DD) for when the app was added. */
  dateAdded: string;
  /**
   * Optional. Set true for an app that's announced but not built yet. It shows
   * on the hub with a "Coming soon" state and isn't clickable — `url` is
   * ignored until you remove this flag.
   */
  comingSoon?: boolean;
}

export const apps: AppEntry[] = [
  {
    id: "mood-tracker",
    title: "Daily Mood Tracker",
    description:
      "A gentle daily check-in that lets you log how you're feeling with a tap and see your recent moods at a glance.",
    creatorName: "Example Student",
    emoji: "🌤️",
    type: "embedded",
    url: "/mini-apps/mood-tracker/",
    tags: ["mood", "check-in"],
    dateAdded: "2026-06-01",
  },
  {
    id: "calm-breathing",
    title: "Calm Breathing Buddy",
    description:
      "A simple animated guide that walks you through a slow breathing exercise whenever you need a reset.",
    creatorName: "Example Student",
    emoji: "🫧",
    type: "embedded",
    url: "/mini-apps/calm-breathing/",
    tags: ["breathing", "calm"],
    dateAdded: "2026-06-08",
  },
  {
    id: "summer-challenge",
    title: "Summer Challenge",
    description:
      "A summer of small daily challenges to keep you growing, moving, and connected.",
    emoji: "☀️",
    type: "embedded",
    url: "",
    tags: [],
    dateAdded: "2026-07-22",
    comingSoon: true,
  },
  {
    id: "college-process",
    title: "College Process",
    description:
      "Step-by-step help navigating applications, deadlines, and everything college-bound.",
    emoji: "🎓",
    type: "embedded",
    url: "",
    tags: [],
    dateAdded: "2026-07-22",
    comingSoon: true,
  },
];

export function getAppById(id: string): AppEntry | undefined {
  return apps.find((app) => app.id === id);
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  apps.forEach((app) => app.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}
