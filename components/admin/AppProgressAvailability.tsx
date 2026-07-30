import { apps, type AppEntry } from "@/config/apps";

type ProgressAvailability =
  | { available: true }
  | { available: false; reason: "third-party" | "no-tracking-yet" };

/**
 * Decided per app by data source, not a hardcoded id list — a future app
 * that's genuinely `type: "native"` and DB-backed can flip to
 * `available: true` here without restructuring this component.
 */
function getProgressAvailability(app: AppEntry): ProgressAvailability {
  if (app.type === "embedded-external" || app.type === "external") {
    return { available: false, reason: "third-party" };
  }
  return { available: false, reason: "no-tracking-yet" };
}

const REASON_LABEL: Record<"third-party" | "no-tracking-yet", string> = {
  "third-party": "Tracked in-app — not available here",
  "no-tracking-yet": "Not tracked yet",
};

export default function AppProgressAvailability() {
  return (
    <section className="rounded-2xl border border-hairline bg-surface/60 p-5 backdrop-blur">
      <h2 className="text-lg font-semibold text-ink">Task &amp; progress</h2>
      <p className="mt-1 text-sm text-muted">
        None of the apps below currently expose completion or score data
        here — their data lives on each app&apos;s own third-party host, not
        in our database.
      </p>

      <ul className="mt-4 space-y-2">
        {apps.map((app) => {
          const availability = getProgressAvailability(app);
          return (
            <li
              key={app.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-bg2/40 px-4 py-2.5"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-ink">
                <span>{app.emoji ?? "💙"}</span>
                {app.title}
              </span>
              {!availability.available && (
                <span className="rounded-full border border-dashed border-hairline bg-bg2 px-2.5 py-1 text-[11px] text-muted">
                  {REASON_LABEL[availability.reason]}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
