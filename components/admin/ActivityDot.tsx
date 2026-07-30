import { isActiveThisWeek } from "@/lib/adminActivity";

/**
 * Deliberately a neutral dot + label, never a red/yellow/green traffic
 * light — this hub has a locked-in "no clinical/evaluative UI" rule on the
 * intern-facing dashboard, and the same restraint applies here even though
 * this view is staff-only.
 */
export default function ActivityDot({
  lastActiveAt,
}: {
  lastActiveAt: string | null;
}) {
  const active = isActiveThisWeek(lastActiveAt);

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span
        className={`h-2 w-2 rounded-full ${
          active ? "bg-accent" : "border border-hairline bg-transparent"
        }`}
      />
      <span className={active ? "text-ink" : "text-muted"}>
        {active ? "Active this week" : "Quiet this week"}
      </span>
    </span>
  );
}
