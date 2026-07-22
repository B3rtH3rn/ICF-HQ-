import { notFound } from "next/navigation";
import Link from "next/link";
import { apps, getAppById } from "@/config/apps";

export function generateStaticParams() {
  return apps
    .filter((app) => app.type === "embedded")
    .map((app) => ({ id: app.id }));
}

export default function AppPage({ params }: { params: { id: string } }) {
  const app = getAppById(params.id);

  if (!app || app.type !== "embedded") {
    notFound();
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between border-b border-calm-100 bg-white px-4 py-2.5 sm:px-6">
        <div>
          <h1 className="text-sm font-semibold text-calm-700">{app.title}</h1>
          {app.creatorName && (
            <p className="text-xs text-calm-500">by {app.creatorName}</p>
          )}
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-calm-600 hover:text-calm-500"
        >
          ← Back to hub
        </Link>
      </div>

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
