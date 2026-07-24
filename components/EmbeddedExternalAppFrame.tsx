"use client";

import { useEffect, useState } from "react";

// How long to wait before showing the "this is taking a while" hint —
// generous because a Render free-tier app can take 30-60s to wake up from
// a cold start.
const SLOW_LOAD_MS = 8000;

/**
 * Renders a THIRD-PARTY-hosted app inline via iframe (the "embedded-external"
 * registry type) — same visual treatment as EmbeddedAppFrame, but:
 *
 * - Tighter sandbox: only allow-scripts/allow-same-origin/allow-forms, no
 *   allow-modals/allow-popups, since we don't know this remote app needs
 *   them (see the sandbox comment below and the summary in chat).
 * - No shared-theme auto-injection: a genuinely cross-origin document can't
 *   be reached from here (contentDocument access is blocked by the browser
 *   regardless of sandbox flags), so there's nothing to inject.
 * - A loading hint for slow cold-starts, and an always-visible "open in a
 *   new tab" escape hatch. We deliberately don't try to detect an
 *   X-Frame-Options/CSP frame-ancestors block via JS — browsers don't
 *   reliably expose that (onLoad still fires for a blocked frame in most
 *   cases), so a persistent fallback link is the honest solution rather
 *   than a false "we'll catch the error" promise.
 */
export default function EmbeddedExternalAppFrame({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_LOAD_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-hairline bg-bg2 px-4 py-1.5 text-center text-xs text-muted sm:px-6">
        Having trouble loading?{" "}
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent hover:underline"
        >
          Open {title} in a new tab ↗
        </a>
      </div>

      <div className="relative flex-1">
        {/*
          Sandbox is intentionally tighter than the local-embedded case:
          - allow-scripts: the app is almost certainly a JS app.
          - allow-same-origin: required for the app to use ITS OWN cookies/
            localStorage at all (without it, sandboxed content is forced
            into an opaque origin and can't authenticate no matter what).
            This is safe to combine with allow-scripts here specifically
            because the app's origin differs from ours — that combo is
            only risky when the framed content shares the parent's origin.
          - allow-forms: needed for its login form to submit.
          Omitted on purpose: allow-modals, allow-popups (no known need —
          add back if the app breaks on something like an OAuth popup or a
          native confirm() dialog), allow-top-navigation and
          allow-popups-to-escape-sandbox (so it can't hijack this hub page).
        */}
        <iframe
          src={src}
          title={title}
          onLoad={() => setLoaded(true)}
          className="h-full w-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms"
          loading="lazy"
        />

        {!loaded && slow && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-hairline border-t-accent" />
            <p className="max-w-xs text-sm text-muted">
              Still loading — the first load can take up to a minute if{" "}
              {title}&apos;s server has been asleep.
            </p>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-accent hover:underline"
            >
              Open {title} in a new tab ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
