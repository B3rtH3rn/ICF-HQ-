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

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-calm-700">Explore the apps</h2>
          <p className="mt-1 text-sm text-calm-500">
            {filtered.length} {filtered.length === 1 ? "app" : "apps"}
            {activeTag ? (
              <>
                {" "}
                tagged <span className="font-medium text-calm-600">{activeTag}</span>
              </>
            ) : (
              " to explore"
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeTag === null
                ? "bg-calm-500 text-white shadow-soft"
                : "border border-calm-100 bg-white/70 text-calm-600 hover:border-calm-300 hover:text-calm-700"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                activeTag === tag
                  ? "bg-calm-500 text-white shadow-soft"
                  : "border border-calm-100 bg-white/70 text-calm-600 hover:border-calm-300 hover:text-calm-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-calm-500">
          No apps with this tag yet — try another one.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((app, i) => (
            <AppCard key={app.id} app={app} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
