/**
 * Bubbles for the dashboard's floating avatar stage — derived entirely from
 * the app registry (config/apps.ts), so adding or removing an app there
 * automatically adds/removes its bubble here with no manual edits.
 *
 * Positions are computed as evenly-spaced points around an ellipse (in %
 * of the stage box) rather than hand-placed, so the layout stays correct
 * no matter how many apps exist.
 */

import { apps, getAppRoute } from "@/config/apps";

export type OrbitBubble = {
  id: string;
  title: string;
  emoji: string;
  thumbnail?: string;
  href?: string; // undefined = comingSoon in the registry — not clickable
  description: string;
  pos: { left: string; top: string };
  size: number;
};

const RADIUS_X = 40; // % of stage width
const RADIUS_Y = 38; // % of stage height
const BUBBLE_SIZE = 84;

export function getOrbitBubbles(): OrbitBubble[] {
  const sorted = [...apps].sort((a, b) =>
    a.title.trim().toLowerCase().localeCompare(b.title.trim().toLowerCase())
  );

  return sorted.map((app, i) => {
    // Start at the top and go clockwise, evenly spaced around the ellipse.
    const angle = (-90 + (360 / sorted.length) * i) * (Math.PI / 180);
    const left = 50 + RADIUS_X * Math.cos(angle);
    const top = 50 + RADIUS_Y * Math.sin(angle);

    return {
      id: app.id,
      title: app.title,
      emoji: app.emoji ?? "💙",
      thumbnail: app.thumbnail,
      href: getAppRoute(app.id),
      description: app.description,
      pos: { left: `${left}%`, top: `${top}%` },
      size: BUBBLE_SIZE,
    };
  });
}
