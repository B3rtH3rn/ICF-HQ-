import { apps, getAllTags } from "@/config/apps";
import AppGrid from "@/components/AppGrid";

export default function AppsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-ink sm:text-4xl">
          The Apps
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Tools built by our young developers to support mental health and
          wellbeing. Browse by topic on the left.
        </p>
      </header>

      <AppGrid apps={apps} allTags={getAllTags()} />
    </div>
  );
}
