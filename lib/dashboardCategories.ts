/**
 * Bubbles for the dashboard's themed category sections (e.g.
 * "Productivity") — derived from the app registry's `category` field
 * (config/apps.ts), same principle as lib/dashboardOrbit.ts's floating
 * bubbles: add/remove an app's category there and its section here follows
 * automatically, no manual list to maintain.
 */

import { getAppsByCategory, getAppRoute } from "@/config/apps";
import type { OrbitBubble } from "./dashboardOrbit";

const BUBBLE_SIZE = 84;

export function getCategoryBubbles(category: string): OrbitBubble[] {
  return getAppsByCategory(category).map((app) => ({
    id: app.id,
    title: app.title,
    emoji: app.emoji ?? "💙",
    thumbnail: app.thumbnail,
    href: getAppRoute(app.id),
    description: app.description,
    // Unused by AppBubble's "row" layout (no absolute positioning there) —
    // kept only to satisfy OrbitBubble's shape.
    pos: { left: "50%", top: "50%" },
    size: BUBBLE_SIZE,
  }));
}
