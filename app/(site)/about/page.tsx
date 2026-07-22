import AboutPhoto from "@/components/AboutPhoto";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-ink">About this hub</h1>

      <AboutPhoto
        src="/images/about-team.jpg"
        alt="Inspiring Children Foundation interns and mentors together outdoors"
      />

      <div className="mt-6 space-y-4 text-muted">
        <p>
          The Inspiring Children Foundation app hub is a home for the apps and
          websites built by the young people in our foundation&apos;s program.
          Every app here
          was designed and built by a student, as a way to explore
          technology while creating something that supports mental health
          and wellbeing in our community.
        </p>
        <p>
          Apps range from simple mood trackers to breathing exercises to
          resource finders — built by students at all different skill
          levels. Some apps live right here on the hub, and others are
          hosted on their own site and linked out to.
        </p>
        <p>
          New apps are added by mentors editing a single registry file in
          the project, so the hub can keep growing as more students build
          more tools. See <code>README.md</code> in the project for the
          step-by-step guide to adding a new app.
        </p>
      </div>
    </div>
  );
}
