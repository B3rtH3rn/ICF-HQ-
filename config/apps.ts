/**
 * APP REGISTRY
 * ------------
 * This is the single source of truth for every app on the hub.
 * To add a new app, add ONE new object to the `apps` array below — you never
 * need to touch any page or routing code. See README.md for full step-by-step
 * instructions written for non-developers.
 */

export type AppType = "embedded" | "external" | "embedded-external" | "native";

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
   * "embedded"           -> the app's files live in /public/mini-apps/<id>/ and are
   *                         shown inside the hub via an iframe at /apps/<id>.
   * "external"           -> the app is hosted somewhere else; the card links out to
   *                         `url` in a new tab, not shown inline.
   * "embedded-external"  -> the app is hosted somewhere else (its own domain), but
   *                         still shown inline via an iframe at /apps/<id>, same as
   *                         "embedded" — just pointed at a remote `url` instead of a
   *                         local folder. The remote host must actually allow being
   *                         iframed (no X-Frame-Options/CSP frame-ancestors block) —
   *                         that's a setting on their end, not something we control.
   * "native"             -> the app is a React component that lives IN this project
   *                         (components/apps/<Name>.jsx) and renders directly at
   *                         /apps/<id> — no iframe, no separate hosting. Unlike the
   *                         other three types, adding one of these does require a
   *                         small touch of routing code: register the component in
   *                         the NATIVE_COMPONENTS map in
   *                         app/(site)/apps/[id]/page.tsx. `url` is unused for this
   *                         type (leave it "").
   *
   * NOTE: embedded assets live under /public/mini-apps/ rather than /public/apps/
   * on purpose — that keeps them from colliding with the /apps/<id> hub route
   * itself, which some static hosts (e.g. Vercel) treat as a URL conflict.
   */
  type: AppType;
  /**
   * For "embedded" apps: path to the app's folder under /public, with a
   * trailing slash, e.g. "/mini-apps/mood-tracker/" (the folder must contain
   * an index.html). For "external" and "embedded-external" apps: the full
   * URL to the app, e.g. "https://my-app.onrender.com/". Use the app's root
   * URL rather than a deep link like `/login` — if the app needs the user
   * to sign in, let it redirect there itself, so already-logged-in users
   * aren't bounced to a login screen unnecessarily. For "native" apps: unused,
   * leave as "".
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
  /**
   * Optional. Different from `comingSoon`: use this when the entry IS live
   * and clickable (real files behind it) but that content is a stand-in for
   * a not-yet-finished app — e.g. reusing an old app's slug/files while the
   * real replacement is being built. Shows a "Placeholder" badge on the card
   * and the app page, but the app stays clickable/viewable.
   */
  placeholder?: boolean;
}

export const apps: AppEntry[] = [
  {
    // NOTE: id/slug renamed from "mood-tracker" to "inspire-daily" (2026-07-23)
    // now that the real app is live — this was a deliberate one-time rename,
    // approved by the user, knowing it breaks any old /apps/mood-tracker
    // links/bookmarks. The old placeholder files at
    // public/mini-apps/mood-tracker/ have since been deleted (2026-07-28).
    id: "inspire-daily",
    title: "Inspire Daily",
    description:
      "A daily companion to help you check in with yourself, reflect, and build small, healthy habits.",
    emoji: "🌤️",
    type: "embedded-external",
    url: "https://inspire-daily.onrender.com/",
    tags: ["daily check-in", "reflection"],
    dateAdded: "2026-06-01",
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
    // Was a "coming soon" placeholder; replaced in place (same id, so the
    // /apps/college-process URL doesn't change) now that the real app is
    // built. Native React component, not iframed — see
    // components/apps/CollegeProcessTracker.jsx and the NATIVE_COMPONENTS
    // map in app/(site)/apps/[id]/page.tsx.
    id: "college-process",
    title: "College Process Tracker",
    description:
      "Track schools, essays, recommendations, scholarships, coach calls, campus visits, and more — all in one place.",
    emoji: "🎓",
    type: "native",
    url: "",
    tags: ["applications", "essays", "scholarships"],
    dateAdded: "2026-07-22",
  },
  {
    id: "tournament-tracker",
    title: "Tournament Tracker",
    description:
      "Keep track of upcoming tournaments, matches, and results all in one place.",
    emoji: "🏆",
    type: "embedded-external",
    url: "https://tournamenttracker.base44.app/",
    tags: ["tournaments"],
    dateAdded: "2026-07-24",
  },
  {
    // NOTE: placeholder for the upcoming "Journal" app — the files at
    // public/mini-apps/journal/ are just a simple "coming soon" page, not
    // the real app. When the real Journal app is ready, swap it in:
    //   a) still embedded -> replace the files in public/mini-apps/journal/
    //      and remove `placeholder: true` below, or
    //   b) hosted elsewhere -> change `type` to "external" or
    //      "embedded-external", point `url` at the real site, and remove
    //      `placeholder: true`.
    id: "journal",
    title: "Journal",
    description:
      "Coming soon — this is a placeholder while the real Journal app is being built.",
    emoji: "📔",
    type: "embedded",
    url: "/mini-apps/journal/",
    tags: ["coming soon"],
    dateAdded: "2026-07-24",
    placeholder: true,
  },
  {
    id: "office-clean-up",
    title: "Office Clean Up",
    description:
      "Organize cleanup tasks and keep the office space tidy, together.",
    emoji: "🧹",
    type: "embedded-external",
    url: "https://tentacled-tidy-desk-flow.base44.app",
    tags: ["organization", "tasks"],
    dateAdded: "2026-07-28",
  },
];

export function getAppById(id: string): AppEntry | undefined {
  return apps.find((app) => app.id === id);
}

/**
 * The hub-hosted route for an app, if it has one — for anything that links
 * to an app by id (e.g. the dashboard's floating bubbles) instead of
 * hardcoding "/apps/<id>" paths. Returns undefined (treat as unavailable/
 * "coming soon") when the id doesn't exist, the app is marked comingSoon,
 * or it's type "external" (those open in a new tab via their own `url`,
 * not a page on this site) — so a caller doesn't need to duplicate any of
 * that logic, and stays correct automatically if an app's id or status
 * changes here.
 */
export function getAppRoute(id: string): string | undefined {
  const app = getAppById(id);
  if (!app || app.comingSoon || app.type === "external") return undefined;
  return `/apps/${app.id}`;
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  apps.forEach((app) => app.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}
