import AboutPhoto from "@/components/AboutPhoto";

const PROGRAMS = [
  {
    title: "Jewel Never Broken — Emotional & Mental Health",
    description:
      "Online and in-person physical, emotional, and mental health programming with an emphasis on evidence-based, peer-led mental health support (DBT, CBT, ACT, EFT, mindfulness, group therapy, suicide prevention and education).",
  },
  {
    title: "Marty Hennessy Community Outreach & Tennis",
    description:
      "Free and discounted tennis classes, lessons, and events making the sport and its benefits available to those who otherwise couldn't afford it.",
  },
  {
    title: "Team Bryan — Tennis, Arts & Academics",
    description:
      "A top-rated high-performance scholar-athlete program spanning tennis, academics, and the arts, designed to help youth qualify for scholarships at top universities.",
  },
  {
    title: "Wolfington Family Leadership & Entrepreneurship",
    description:
      "Leadership retreats, entrepreneurship classes, and project-driven learning that give youth professional development tools and help them “earn their way.”",
  },
  {
    title: "Family Assistance",
    description:
      "Grants, housing, and life essentials — plus mentoring and mental health care — for children and families who are displaced, homeless, or facing extreme poverty.",
  },
  {
    title: "Eat Right = Feel Right",
    description:
      "Nutrition counseling that helps youth make healthier food choices to maximize physical and mental wellbeing.",
  },
  {
    title: "Mindfulness & Leadership Retreats",
    description:
      "Retreats that take children out of their circumstances to expand their horizons, including yoga, meditation, and time in nature.",
  },
  {
    title: "Multi-Generational Mentoring",
    description:
      "An ecosystem where youth, alumni, staff, and supporters take a personal interest in one another's lives, mentoring across generations.",
  },
  {
    title: "Project-Driven Learning",
    description:
      "A hands-on volunteer/education model where youth learn by running real projects — 80% of the foundation's programs and operations are created and run by the youth themselves.",
  },
  {
    title: "Leadership Talks",
    description:
      "A speaker series featuring leaders from all walks of life sharing insights on overcoming adversity and finding success.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-ink">About Us</h1>

      <div className="mt-6 space-y-4 text-muted">
        <p>
          The Inspiring Children Foundation is a nonprofit 501(c)(3)
          charitable organization that transforms lives through a
          &ldquo;whole human&rdquo; approach to physical, social, emotional,
          and mental health. For over 25 years it has helped at-risk youth
          and families from a range of socio-economic backgrounds in Las
          Vegas rise above challenges — including anxiety, depression, and
          other mental health struggles — to heal, grow, and become their
          best selves. The foundation serves hundreds of youth in person and
          millions online.
        </p>
        <p>
          Its award-winning curriculum is built around a 10-step program
          with over 40 tools and 100+ activations, developed over 25 years
          by leading lived-experience experts and grounded in
          evidence-based practices. It&apos;s now being implemented in
          schools, nonprofits, corporations, and social services programs.
        </p>
        <p>
          A standout outcome: 95% of students in the Leadership Program have
          earned college scholarships for academics and athletics (tennis)
          at some of the best colleges in the US, and parts of the program
          are now being duplicated in 22 cities by other nonprofits.
        </p>
      </div>

      <AboutPhoto
        src="/images/about-team.jpg"
        alt="Inspiring Children Foundation interns and mentors together outdoors"
      />

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-ink">Our Story</h2>
        <div className="mt-4 space-y-4 text-muted">
          <p>
            The foundation was created by Ryan Wolfington with the help of
            Marty Hennessy, David Pate, and Grammy-nominated
            singer-songwriter Jewel, in partnership with the world&apos;s
            #1 tennis team, Bob and Mike Bryan. It began with a focus on
            giving a single child the best possible environment to make
            good choices and earn a college scholarship — and grew from
            there into a whole-human model arming children with the
            physical, social, emotional, and mental health they need to
            heal, grow, and perform at the highest levels.
          </p>
          <p>
            A hallmark of the program is its peer-to-peer ecosystem, where
            youth and staff certified in the foundation&apos;s 10 Pillars of
            Healing and Growth mentor and support one another. Its
            project-driven learning model empowers the children to co-create
            and co-run the organization, building self-awareness,
            confidence, and professional and technical skills.
          </p>
          <p>
            What began as hundreds of children served in inner-city parks
            and a wellness center now reaches millions online and hundreds
            in person, including a wellness festival, a free online mental
            health community (JewelNeverBroken.com), and an in-person
            program replicated across 22 states.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-ink">Our Programs</h2>
        <div className="mt-6 space-y-6">
          {PROGRAMS.map((program) => (
            <div
              key={program.title}
              className="border-l-2 border-accent/30 pl-4"
            >
              <h3 className="font-semibold text-ink">{program.title}</h3>
              <p className="mt-1 text-sm text-muted">{program.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12 rounded-xl2 border border-hairline bg-bg2 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          In crisis?
        </p>
        <p className="mt-2 text-sm text-muted">
          These programs and this website are for informational purposes
          only and are not for emergency or crisis help. If you or someone
          you know is in crisis, call the Suicide &amp; Crisis Lifeline at{" "}
          <a href="tel:988" className="font-medium text-ink hover:underline">
            988
          </a>
          . In an emergency, call{" "}
          <a href="tel:911" className="font-medium text-ink hover:underline">
            911
          </a>{" "}
          or go to your nearest emergency room.
        </p>
      </div>

      <p className="mt-8 text-center text-xs text-muted">
        Inspiring Children Foundation is a nonprofit IRS 501(c)(3) charitable
        organization (EIN 20-1638145).
      </p>
    </div>
  );
}
