"use client";

import Link from "next/link";
import type { OrbitBubble } from "@/lib/dashboardOrbit";

/**
 * A single floating app bubble. "Coming soon" bubbles (no href — the app is
 * flagged comingSoon in the registry) render dimmed with a dashed ring and
 * aren't clickable.
 *
 * `layout="orbit"` absolutely positions the bubble at `pos` for the desktop
 * circular arrangement; `layout="row"` renders it as a plain flex item for
 * the small-screen scrollable fallback (same visuals, no absolute position).
 *
 * Layering keeps CSS transforms from fighting each other:
 *   position wrapper (centering translate) → float wrapper (drift) → bubble (hover scale)
 */
export default function AppBubble({
  bubble,
  delay,
  layout = "orbit",
}: {
  bubble: OrbitBubble;
  delay: number;
  layout?: "orbit" | "row";
}) {
  const { title, emoji, thumbnail, href, description, pos, size } = bubble;
  const comingSoon = !href;
  const glow = 0.45;
  const effectiveSize = layout === "row" ? Math.round(size * 0.8) : size;

  const face = (
    <div
      className="group relative flex items-center justify-center overflow-hidden rounded-full backdrop-blur transition-transform duration-300 hover:scale-110 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      style={{
        width: effectiveSize,
        height: effectiveSize,
        border: `1px ${comingSoon ? "dashed" : "solid"} ${
          comingSoon ? "rgb(var(--border))" : "rgb(var(--accent) / 0.4)"
        }`,
        background: "rgb(var(--surface) / 0.7)",
        boxShadow: comingSoon
          ? "none"
          : `0 0 ${18 + glow * 26}px rgb(var(--accent) / ${glow})`,
      }}
    >
      {!comingSoon && (
        <span
          className="pointer-events-none absolute inset-0 animate-pulse-glow rounded-full"
          style={{
            boxShadow: `inset 0 0 0 1px rgb(var(--accent) / ${0.15 + glow * 0.2})`,
          }}
        />
      )}
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt=""
          className="h-full w-full object-cover"
          style={{ opacity: comingSoon ? 0.5 : 1 }}
        />
      ) : (
        <span
          style={{ fontSize: effectiveSize * 0.4, opacity: comingSoon ? 0.5 : 1 }}
        >
          {emoji}
        </span>
      )}

      {/* hover/focus label */}
      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-20 w-44 -translate-x-1/2 rounded-lg border border-hairline bg-surface/95 px-3 py-2 text-center opacity-0 shadow-soft backdrop-blur transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="block text-xs font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-[11px] text-muted">{description}</span>
      </span>
    </div>
  );

  const floatWrapper = (
    <div
      className="animate-float"
      style={{ animationDelay: `${delay}s`, animationDuration: "7s" }}
    >
      {face}
    </div>
  );

  if (layout === "row") {
    if (comingSoon) {
      return (
        <div className="flex-shrink-0" aria-label={`${title} — coming soon`}>
          {floatWrapper}
        </div>
      );
    }
    return (
      <Link href={href!} className="flex-shrink-0 cursor-pointer">
        {floatWrapper}
      </Link>
    );
  }

  const wrapperStyle: React.CSSProperties = {
    left: pos.left,
    top: pos.top,
    transform: "translate(-50%, -50%)",
  };

  if (comingSoon) {
    return (
      <div
        className="absolute"
        style={wrapperStyle}
        aria-label={`${title} — coming soon`}
      >
        {floatWrapper}
      </div>
    );
  }

  return (
    <Link href={href!} className="absolute cursor-pointer" style={wrapperStyle}>
      {floatWrapper}
    </Link>
  );
}
