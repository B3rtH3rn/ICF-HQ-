import { apps, getAllTags } from "@/config/apps";
import AppGrid from "@/components/AppGrid";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <section className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-calm-700 sm:text-4xl">
          Apps built by our youth, for our community
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-calm-600">
          Explore the tools and mini apps our young developers have created
          to support mental health and wellbeing. New apps are added
          regularly — check back often!
        </p>
      </section>

      <AppGrid apps={apps} allTags={getAllTags()} />
    </div>
  );
}
