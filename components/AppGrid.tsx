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
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((app) => {
      const matchesTag = !activeTag || app.tags.includes(activeTag);
      if (!matchesTag) return false;
      if (!q) return true;
      const haystack = [app.title, app.description, app.creatorName ?? "", ...app.tags]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [apps, query, activeTag]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search apps by name, tag, or creator..."
          className="w-full rounded-full border border-calm-100 bg-white px-5 py-2.5 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-calm-300 sm:max-w-sm"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTag(null)}
          className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
            activeTag === null
              ? "bg-calm-500 text-white"
              : "bg-white text-calm-600 hover:bg-calm-50"
          }`}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
              activeTag === tag
                ? "bg-calm-500 text-white"
                : "bg-white text-calm-600 hover:bg-calm-50"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-calm-500">
          No apps match your search yet. Try a different keyword or tag.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}
