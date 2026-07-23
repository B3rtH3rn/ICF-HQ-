import { notFound } from "next/navigation";
import Link from "next/link";
import { apps, getAppById } from "@/config/apps";

export function generateStaticParams() {
  return apps
    .filter((app) => app.type === "embedded" && !app.comingSoon)
    .map((app) => ({ id: app.id }));
}

export default function AppPage({ params }: { params: { id: string } }) {
  const app = getAppById(params.id);

  if (!app || app.type !== "embedded" || app.comingSoon) {
    notFound();
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between border-b border-hairline bg-surface px-4 py-2.5 sm:px-6">
        <div>
          <h1 className="text-sm font-semibold text-ink">{app.title}</h1>
          {app.creatorName && (
            <p className="text-xs text-muted">by {app.creatorName}</p>
          )}
        </div>
        <Link
          href="/apps"
          className="text-sm font-medium text-muted hover:text-ink"
        >
          ← Back to the apps
        </Link>
      </div>

      {app.placeholder && (
        <div className="border-b border-dashed border-hairline bg-bg2 px-4 py-2 text-center text-xs font-medium text-muted sm:px-6">
          Placeholder — this isn&apos;t the final app yet. The real {app.title}{" "}
          is coming soon.
        </div>
      )}

      {/*
        sandbox restricts what the embedded student app can do:
        - allow-scripts / allow-same-origin: most mini apps need JS + localStorage to work
        - allow-forms / allow-modals / allow-popups: common needs for interactive apps
        Notably OMITTED: allow-top-navigation and allow-popups-to-escape-sandbox, so a
        broken or misbehaving app can't redirect or hijack the parent hub page.
      */}
      <iframe
        src={app.url}
        title={app.title}
        className="flex-1 border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
        loading="lazy"
      />
    </div>
  );
}
