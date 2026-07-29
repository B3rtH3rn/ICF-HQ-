import { notFound } from "next/navigation";
import Link from "next/link";
import type { ComponentType } from "react";
import { apps, getAppById } from "@/config/apps";
import EmbeddedAppFrame from "@/components/EmbeddedAppFrame";
import EmbeddedExternalAppFrame from "@/components/EmbeddedExternalAppFrame";

const INLINE_TYPES = ["embedded", "embedded-external", "native"];

/**
 * Registry for "native" apps (see config/apps.ts) — React components that
 * live in this project and render directly, no iframe. This is the one bit
 * of routing code a native app needs: add its component here, keyed by id.
 * Empty for now — no native apps currently in the registry.
 */
const NATIVE_COMPONENTS: Record<string, ComponentType> = {};

export function generateStaticParams() {
  return apps
    .filter((app) => INLINE_TYPES.includes(app.type) && !app.comingSoon)
    .map((app) => ({ id: app.id }));
}

export default function AppPage({ params }: { params: { id: string } }) {
  const app = getAppById(params.id);

  if (!app || !INLINE_TYPES.includes(app.type) || app.comingSoon) {
    notFound();
  }

  const NativeComponent =
    app.type === "native" ? NATIVE_COMPONENTS[app.id] : null;
  if (app.type === "native" && !NativeComponent) {
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
        Three renderers, same header/back-link treatment above:
        - EmbeddedAppFrame (type "embedded"): our own static files, same origin.
          allow-scripts/allow-same-origin/allow-forms/allow-modals/allow-popups —
          generous, since it's our own trusted content, and allow-same-origin is
          also what lets it auto-inject the hub's shared theme (see the component).
        - EmbeddedExternalAppFrame (type "embedded-external"): a genuinely
          third-party origin, so a tighter sandbox (see that component for the
          reasoning on each flag) plus a loading/fallback UI, since we can't
          control or fully trust what that remote site does.
        - NativeComponent (type "native"): no iframe at all — just a React
          component from this project, rendered directly.
        The two iframe cases omit allow-top-navigation and
        allow-popups-to-escape-sandbox, so a broken or misbehaving app can't
        redirect or hijack this hub page.
      */}
      {NativeComponent ? (
        <div className="flex-1 overflow-auto">
          <NativeComponent />
        </div>
      ) : app.type === "embedded-external" ? (
        <EmbeddedExternalAppFrame src={app.url} title={app.title} />
      ) : (
        <EmbeddedAppFrame src={app.url} title={app.title} />
      )}
    </div>
  );
}
