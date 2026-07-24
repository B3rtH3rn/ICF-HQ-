"use client";

import { useRef } from "react";

const THEME_HREF = "/mini-apps/_shared/theme.css";
const SYNC_SRC = "/mini-apps/_shared/theme-sync.js";

/**
 * Wraps the embedded mini-app iframe and auto-injects the hub's shared
 * theme (colors + live light/dark sync, see /mini-apps/_shared/) into
 * whatever app is loaded — so any embedded app matches the hub by default,
 * even if its own HTML never links those files itself. Safe to inject
 * unconditionally: an app that doesn't use `var(--bg)`/`.hub-card` etc. in
 * its own CSS is visually unaffected.
 */
export default function EmbeddedAppFrame({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = () => {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;

    try {
      if (!doc.querySelector("[data-hub-theme]")) {
        const link = doc.createElement("link");
        link.rel = "stylesheet";
        link.href = THEME_HREF;
        link.setAttribute("data-hub-theme", "");
        doc.head.appendChild(link);
      }
      if (!doc.querySelector("[data-hub-theme-sync]")) {
        const script = doc.createElement("script");
        script.src = SYNC_SRC;
        script.setAttribute("data-hub-theme-sync", "");
        doc.head.appendChild(script);
      }
    } catch {
      // If a future app's sandboxing blocks contentDocument access, it just
      // keeps whatever styling it shipped with.
    }
  };

  return (
    <iframe
      ref={frameRef}
      src={src}
      title={title}
      onLoad={handleLoad}
      className="flex-1 border-0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
      loading="lazy"
    />
  );
}
