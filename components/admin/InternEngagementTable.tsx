"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchInternActivity, type InternActivity } from "@/lib/adminActivity";
import { getAppById } from "@/config/apps";
import ActivityDot from "./ActivityDot";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export default function InternEngagementTable() {
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [allInterns, setAllInterns] = useState<InternActivity[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetchInternActivity()
      .then(setAllInterns)
      .catch(() => setLoadError(true));
  }, []);

  const interns = useMemo(() => {
    const filtered = (allInterns ?? []).filter((intern) =>
      intern.displayName.toLowerCase().includes(query.trim().toLowerCase())
    );
    return filtered.sort((a, b) =>
      sortDir === "asc"
        ? a.displayName.localeCompare(b.displayName)
        : b.displayName.localeCompare(a.displayName)
    );
  }, [allInterns, query, sortDir]);

  if (loadError) {
    return (
      <section className="rounded-2xl border border-hairline bg-surface/60 p-5 backdrop-blur">
        <h2 className="text-lg font-semibold text-ink">Engagement</h2>
        <p className="mt-2 text-sm text-muted">
          Couldn&apos;t load engagement data. Try refreshing the page.
        </p>
      </section>
    );
  }

  if (!allInterns) {
    return (
      <section className="rounded-2xl border border-hairline bg-surface/60 p-5 backdrop-blur">
        <h2 className="text-lg font-semibold text-ink">Engagement</h2>
        <p className="mt-2 text-sm text-muted">Loading engagement data…</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-hairline bg-surface/60 p-5 backdrop-blur">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-ink">Engagement</h2>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name…"
          className="rounded-xl border border-hairline bg-bg2/70 px-3 py-1.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 sm:w-56"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs uppercase tracking-wider text-muted">
              <th className="py-2 pr-4 font-semibold">
                <button
                  type="button"
                  onClick={() =>
                    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                  }
                  className="flex items-center gap-1 hover:text-ink"
                >
                  Name
                  <span className="text-accent">
                    {sortDir === "asc" ? "▲" : "▼"}
                  </span>
                </button>
              </th>
              <th className="py-2 pr-4 font-semibold">Last active</th>
              <th className="py-2 pr-4 font-semibold">Activity</th>
              <th className="py-2 pr-4 font-semibold">Logins (30d)</th>
              <th className="py-2 pr-4 font-semibold">Apps opened</th>
            </tr>
          </thead>
          <tbody>
            {interns.map((intern) => (
              <tr
                key={intern.id}
                className="border-b border-hairline/60 last:border-0 hover:bg-bg2/60"
              >
                <td className="py-3 pr-4 font-medium text-ink">
                  {intern.displayName}
                </td>
                <td className="py-3 pr-4 text-muted">
                  {intern.lastActiveAt
                    ? dateFormatter.format(new Date(intern.lastActiveAt))
                    : "Never"}
                </td>
                <td className="py-3 pr-4">
                  <ActivityDot lastActiveAt={intern.lastActiveAt} />
                </td>
                <td className="py-3 pr-4 text-muted">
                  {intern.loginCountRecent}
                </td>
                <td className="py-3 pr-4">
                  {intern.appsOpened.length === 0 ? (
                    <span className="text-muted">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {intern.appsOpened.map((appId) => (
                        <span
                          key={appId}
                          className="rounded-full bg-bg2 px-2.5 py-0.5 text-xs text-muted"
                        >
                          {getAppById(appId)?.title ?? appId}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
