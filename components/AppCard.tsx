import Link from "next/link";
import type { AppEntry } from "@/config/apps";

/**
 * A small rotating set of soft gradient themes so the gallery feels lively
 * while staying within the calm/warm palette. Chosen by card position.
 */
const MEDALLION_THEMES = [
  "from-accent2 to-accent",
  "from-accent to-glow",
  "from-accent2 to-glow",
  "from-glow to-accent2",
];

export default function AppCard({
  app,
  index = 0,
}: {
  app: AppEntry;
  index?: number;
}) {
  const isExternal = app.type === "external";
  const comingSoon = !!app.comingSoon;
  const medallion = MEDALLION_THEMES[index % MEDALLION_THEMES.length];

  const content = (
    <div
      className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-xl2 border border-hairline bg-surface/90 p-6 shadow-soft backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-lift animate-fade-up"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* soft accent glow that warms up on hover */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent/25 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />

      <div className="flex items-start justify-between">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${medallion} text-2xl shadow-soft`}
        >
          {app.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={app.thumbnail}
              alt=""
              className="h-full w-full rounded-2xl object-cover"
            />
          ) : (
            <span>{app.emoji ?? "💙"}</span>
          )}
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
            comingSoon
              ? "bg-bg2 text-muted"
              : isExternal
                ? "bg-accent2/15 text-accent2"
                : "bg-bg2 text-muted"
          }`}
        >
          {comingSoon
            ? "Coming soon"
            : isExternal
              ? "External site"
              : "In the hub"}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-semibold text-ink">{app.title}</h3>
        {app.creatorName && (
          <p className="mt-0.5 text-xs text-muted">by {app.creatorName}</p>
        )}
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {app.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {app.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-bg2 px-2.5 py-0.5 text-xs text-muted"
          >
            {tag}
          </span>
        ))}
      </div>

      {comingSoon ? (
        <div className="mt-1 text-sm font-semibold text-muted">Coming soon</div>
      ) : (
        <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-accent">
          {isExternal ? "Open in new tab" : "Open app"}
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </div>
      )}
    </div>
  );

  if (comingSoon) {
    return <div className="block h-full opacity-80">{content}</div>;
  }

  if (isExternal) {
    return (
      <a
        href={app.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full rounded-xl2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={`/apps/${app.id}`}
      className="block h-full rounded-xl2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {content}
    </Link>
  );
}
