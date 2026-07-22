import Link from "next/link";
import type { AppEntry } from "@/config/apps";

export default function AppCard({ app }: { app: AppEntry }) {
  const content = (
    <div className="flex h-full flex-col gap-3 rounded-xl2 border border-calm-100 bg-white p-5 shadow-soft transition-transform hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-calm-50 text-3xl">
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

      <div className="flex-1">
        <h3 className="text-lg font-semibold text-calm-700">{app.title}</h3>
        {app.creatorName && (
          <p className="text-xs text-calm-500">by {app.creatorName}</p>
        )}
        <p className="mt-2 text-sm text-calm-600">{app.description}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {app.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-calm-50 px-2.5 py-0.5 text-xs text-calm-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="pt-1 text-sm font-medium text-sun-500">
        {app.type === "external" ? "Open in new tab →" : "Open app →"}
      </div>
    </div>
  );

  if (app.type === "external") {
    return (
      <a
        href={app.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={`/apps/${app.id}`} className="block h-full">
      {content}
    </Link>
  );
}
