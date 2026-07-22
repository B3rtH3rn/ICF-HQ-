"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { apps } from "@/config/apps";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/apps", label: "Apps" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click-outside / Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Close whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-bg/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3.5 sm:px-6">
        {/* Hamburger — quick access to the apps */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-label="Open apps menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-hairline bg-surface/60 text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute left-0 top-12 z-40 w-64 overflow-hidden rounded-2xl border border-hairline bg-surface shadow-lift">
              <p className="border-b border-hairline px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Mini Apps
              </p>
              <nav className="flex flex-col p-1.5">
                {apps.map((app) => {
                  const inner = (
                    <>
                      <span className="text-lg">{app.emoji ?? "💙"}</span>
                      <span className="flex-1 truncate">{app.title}</span>
                      {app.type === "external" && (
                        <span className="text-xs text-accent">↗</span>
                      )}
                    </>
                  );
                  const cls =
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-bg2 hover:text-ink";
                  return app.type === "external" ? (
                    <a
                      key={app.id}
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cls}
                    >
                      {inner}
                    </a>
                  ) : (
                    <Link key={app.id} href={`/apps/${app.id}`} className={cls}>
                      {inner}
                    </Link>
                  );
                })}
              </nav>
              <Link
                href="/apps"
                className="block border-t border-hairline px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-bg2"
              >
                View all apps →
              </Link>
            </div>
          )}
        </div>

        {/* Wordmark */}
        <Link
          href="/"
          className="min-w-0 flex-1 truncate bg-gradient-to-r from-accent2 via-accent to-glow bg-clip-text text-sm font-extrabold uppercase tracking-tight text-transparent sm:text-lg"
        >
          Inspiring Children Foundation
        </Link>

        <ThemeToggle />

        {/* Main menu */}
        <nav className="flex flex-shrink-0 items-center gap-1 rounded-full border border-hairline bg-surface/60 p-1 text-sm font-semibold">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 transition-colors sm:px-4 ${
                  active
                    ? "bg-accent2 text-white shadow-soft"
                    : "text-muted hover:bg-surface hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
