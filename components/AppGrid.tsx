"use client";

import { useMemo, useState } from "react";
import type { AppEntry } from "@/config/apps";
import AppCard from "./AppCard";

export default function AppGrid({
  apps,
  allTags,
}: {
  apps: AppEntry[];
  allTags: string[];
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!activeTag) return apps;
    return apps.filter((app) => app.tags.includes(activeTag));
  }, [apps, activeTag]);

  const tabs = [{ label: "All apps", value: null as string | null }].concat(
    allTags.map((tag) => ({ label: tag, value: tag }))
  );

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
      {/* Left sidebar tabs */}
      <aside className="lg:w-56 lg:flex-shrink-0">
        <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-calm-500">
          Browse
        </h2>
        <nav className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          {tabs.map((tab) => {
            const isActive = activeTag === tab.value;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTag(tab.value)}
                aria-current={isActive ? "true" : undefined}
                className={`rounded-xl px-4 py-2 text-left text-sm font-medium capitalize transition-colors lg:w-full ${
                  isActive
                    ? "bg-calm-500 text-white shadow-soft"
                    : "text-calm-600 hover:bg-white/70 hover:text-calm-700"
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
          <h3 className="text-xl font-semibold text-calm-700">
            {activeTag ? (
              <span className="capitalize">{activeTag}</span>
            ) : (
              "Explore the apps"
            )}
          </h3>
          <p className="mt-1 text-sm text-calm-500">
            {filtered.length} {filtered.length === 1 ? "app" : "apps"} to explore
          </p>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-12 text-center text-calm-500">
            No apps with this tag yet — try another one.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {filtered.map((app, i) => (
              <AppCard key={app.id} app={app} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
