"use client";

import { getCategoryBubbles } from "@/lib/dashboardCategories";
import AppBubble from "./AppBubble";

/**
 * A themed row of apps grouped by registry category (config/apps.ts'
 * `category` field) — e.g. "Productivity". Reuses AppBubble's "row" layout
 * for the same glowing-bubble look as the floating stage and its mobile
 * fallback, just laid out as a normal wrapping row instead of orbiting or
 * scrolling. Renders nothing if no apps currently carry this category, so
 * an emptied-out category doesn't leave a bare heading behind.
 */
export default function CategoryGroup({
  category,
  title,
}: {
  category: string;
  title: string;
}) {
  const bubbles = getCategoryBubbles(category);
  if (bubbles.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-[0.2em] text-muted">
        {title}
      </h2>
      <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-8">
        {bubbles.map((b, i) => (
          <AppBubble key={b.id} bubble={b} delay={i * 0.7} layout="row" />
        ))}
      </div>
    </section>
  );
}
