import { apps, getAllTags } from "@/config/apps";
import AppGrid from "@/components/AppGrid";

export default function HomePage() {
  const tags = getAllTags();
  const creators = new Set(
    apps.map((a) => a.creatorName).filter(Boolean)
  ).size;

  const stats = [
    { label: apps.length === 1 ? "app" : "apps", value: apps.length },
    { label: creators === 1 ? "young creator" : "young creators", value: creators },
    { label: tags.length === 1 ? "topic" : "topics", value: tags.length },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Hero */}
      <section className="relative mb-14 overflow-hidden rounded-[2rem] border border-calm-100 bg-gradient-to-br from-white via-calm-50 to-warmth-100 px-6 py-14 shadow-soft sm:px-12 sm:py-16">
        {/* decorative floating shapes */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-calm-200/40 blur-2xl animate-float" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-lilac-200/40 blur-2xl animate-float-slow" />

        <div className="relative text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-calm-200 bg-white/70 px-4 py-1.5 text-xs font-medium text-calm-600 backdrop-blur">
            💙 A project of our mental health foundation
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-bold leading-tight text-calm-700 sm:text-5xl">
            Apps built by our youth,
            <br className="hidden sm:block" /> for our community
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-calm-600 sm:text-lg">
            A warm little home for the tools our young developers are creating
            to support mental health and wellbeing. Explore what they&apos;ve
            made — new apps arrive all the time.
          </p>

          {/* stats strip */}
          <div className="mx-auto mt-9 flex max-w-md flex-wrap items-center justify-center gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex min-w-[7rem] flex-1 flex-col rounded-2xl border border-calm-100 bg-white/80 px-4 py-3 backdrop-blur"
              >
                <span className="text-2xl font-bold text-calm-500">
                  {s.value}
                </span>
                <span className="text-xs text-calm-500">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AppGrid apps={apps} allTags={tags} />
    </div>
  );
}
