"use client";

import Link from "next/link";
import { dashboardBubbles, journeySeries } from "@/lib/mockDashboard";
import JourneyWave from "./JourneyWave";

export default function SidePanel() {
  const mostUsed = dashboardBubbles
    .filter((b) => b.href)
    .sort((a, b) => b.activity - a.activity)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Most-used shortcuts */}
      <section className="rounded-2xl border border-hairline bg-surface/60 p-4 backdrop-blur">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Most used
        </h2>
        <ul className="space-y-1">
          {mostUsed.map((b) => {
            const row = (
              <>
                <span className="text-xl">{b.emoji}</span>
                <span className="flex-1 truncate text-sm font-medium text-ink">
                  {b.title}
                </span>
                <span className="text-accent">→</span>
              </>
            );
            const cls =
              "flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-bg2";
            return (
              <li key={b.id}>
                {b.external ? (
                  <a
                    href={b.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cls}
                  >
                    {row}
                  </a>
                ) : (
                  <Link href={b.href!} className={cls}>
                    {row}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Ambient "your journey" trend */}
      <section className="rounded-2xl border border-hairline bg-surface/60 p-4 backdrop-blur">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Your journey
        </h2>
        <p className="mb-3 mt-1 text-xs text-muted/80">
          A gentle look at your rhythm lately.
        </p>
        <JourneyWave series={journeySeries} />
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-muted/60">
          <span>Earlier</span>
          <span>Now</span>
        </div>
      </section>
    </div>
  );
}
