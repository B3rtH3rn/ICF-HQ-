"use client";

import { useMemo, useState } from "react";
import type { AppEntry } from "@/config/apps";
import AppCard from "./AppCard";

export default function AppGrid({ apps }: { apps: AppEntry[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Alphabetical by title, case-insensitive and ignoring leading/trailing
  // whitespace — computed here at render time (not relying on registry
  // order) so newly added apps automatically slot into place.
  const sorted = useMemo(
    () =>
      [...apps].sort((a, b) =>
        a.title.trim().toLowerCase().localeCompare(b.title.trim().toLowerCase())
      ),
    [apps]
  );

  const filtered = useMemo(
    () => (activeId ? sorted.filter((app) => app.id === activeId) : sorted),
    [sorted, activeId]
  );

  const activeApp = activeId
    ? sorted.find((app) => app.id === activeId)
    : undefined;

  const tabs = [{ label: "All Apps", value: null as string | null }].concat(
    sorted.map((app) => ({ label: app.title, value: app.id }))
  );

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
      {/* Left sidebar tabs */}
      <aside className="lg:w-56 lg:flex-shrink-0">
        <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted">
          Browse
        </h2>
        <nav className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          {tabs.map((tab) => {
            const isActive = activeId === tab.value;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveId(tab.value)}
                aria-current={isActive ? "true" : undefined}
                className={`rounded-xl px-4 py-2 text-left text-sm font-medium transition-colors lg:w-full ${
                  isActive
                    ? "bg-accent2 text-white shadow-soft"
                    : "text-muted hover:bg-surface hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Right content */}
      <div className="flex-1">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-ink">
            {activeApp ? activeApp.title : "Explore the apps"}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {filtered.length} {filtered.length === 1 ? "app" : "apps"} to explore
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {filtered.map((app, i) => (
            <AppCard key={app.id} app={app} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
