"use client";

import Link from "next/link";
import type { DashboardBubble } from "@/lib/mockDashboard";

/**
 * A single floating app "bubble". Glow softness reflects gentle recent activity
 * (never a number on the face). Hover reveals the app name + a warm one-liner.
 * "Coming soon" bubbles (no href) are dimmed with a dashed ring and don't link.
 *
 * Layering keeps CSS transforms from fighting each other:
 *   position wrapper (centering translate) → float wrapper (drift) → bubble (hover scale)
 */
export default function AppBubble({
  bubble,
  delay,
}: {
  bubble: DashboardBubble;
  delay: number;
}) {
  const { title, emoji, href, external, activity, note, pos, size } = bubble;
  const comingSoon = !href;
  const glow = 0.25 + activity * 0.5;

  const face = (
    <div
      className="group relative flex items-center justify-center rounded-full backdrop-blur transition-transform duration-300 hover:scale-110"
      style={{
        width: size,
        height: size,
        border: `1px ${comingSoon ? "dashed" : "solid"} ${
          comingSoon ? "rgb(var(--border))" : "rgb(var(--accent) / 0.4)"
        }`,
        background: "rgb(var(--surface) / 0.7)",
        boxShadow: comingSoon
          ? "none"
          : `0 0 ${18 + activity * 26}px rgb(var(--accent) / ${glow})`,
      }}
    >
      {!comingSoon && (
        <span
          className="pointer-events-none absolute inset-0 animate-pulse-glow rounded-full"
          style={{
            boxShadow: `inset 0 0 0 1px rgb(var(--accent) / ${
              0.15 + activity * 0.2
            })`,
          }}
        />
      )}
      <span style={{ fontSize: size * 0.4, opacity: comingSoon ? 0.5 : 1 }}>
        {emoji}
      </span>

      {/* hover label */}
      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-20 w-44 -translate-x-1/2 rounded-lg border border-hairline bg-surface/95 px-3 py-2 text-center opacity-0 shadow-soft backdrop-blur transition-opacity duration-200 group-hover:opacity-100">
        <span className="block text-xs font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-[11px] text-muted">{note}</span>
      </span>
    </div>
  );

  const positioned = (
    <div
      className="animate-float"
      style={{ animationDelay: `${delay}s`, animationDuration: "7s" }}
    >
      {face}
    </div>
  );

  const wrapperStyle: React.CSSProperties = {
    left: pos.left,
    top: pos.top,
    transform: "translate(-50%, -50%)",
  };

  if (comingSoon) {
    return (
      <div className="absolute" style={wrapperStyle} aria-label={`${title} — coming soon`}>
        {positioned}
      </div>
    );
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute"
        style={wrapperStyle}
      >
        {positioned}
      </a>
    );
  }

  return (
    <Link href={href!} className="absolute" style={wrapperStyle}>
      {positioned}
    </Link>
  );
}
