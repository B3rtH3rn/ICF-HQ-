# ICF Mini-Apps Hub — Onboarding

This document exists so a fresh Claude Code session (or a new teammate) can pick
up this project with full context, not just the code. Everything here is
information that *isn't* obvious from reading the files alone — decisions,
history, gotchas, and open loose ends.

## What this is

A hub website for **Inspiring Children Foundation**, a mental health / youth
nonprofit. It does two jobs:

1. **Public gallery** — showcases mini apps built by the foundation's teen
   interns (mood tracker, breathing exercise, etc.), either embedded directly
   or linked out to wherever they're hosted.
2. **Personalized dashboard** — a real-auth, logged-in experience where each
   user gets a calm, ambient "space" with a customizable glowing avatar,
   shortcuts to their apps, and a gentle activity trend.

**The single most important constraint on this whole project**: this serves
teens in a mental-health context. Two rules that came from explicit,
deliberate product decisions — not oversights — and should not be reversed
without asking the user first:

- The dashboard must never feel clinical, evaluative, or like it's scoring
  the user's mental health. No hard numbers, no red/yellow/green status
  colors, no chart axes. See `components/dashboard/JourneyWave.tsx` for how
  "activity over time" is deliberately rendered as an ambient glowing wave
  instead of a chart.
- Avatar customization (`lib/avatarOptions.ts`,
  `components/dashboard/AvatarCustomizer.tsx`) allows **only** color, particle
  "energy" style, and accent symbols. There is intentionally **no body-shape,
  body-size, or facial customization** — this was explicitly requested to
  avoid the dashboard becoming a body-image trigger point. If a future request
  asks for anything body/face-related, stop and confirm with the user first.

## Stack & why

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase (Postgres +
Auth). Deployed on Vercel.

**This is a standard server-rendered Next.js app, not a static export.**
It started as a static export (`output: "export"`) when it was just a public
gallery, but that was deliberately removed once real authentication was
added — session-checking middleware fundamentally requires a server, static
export can't do it. Don't reintroduce `output: "export"` without realizing
this will break auth entirely.

## Where things live

- **GitHub**: `github.com/B3rtH3rn/ICF-HQ-` (note the trailing dash in the
  repo name — that's intentional/existing, not a typo to fix).
- **Vercel**: project `icf-hq`, deployed at `https://icf-hq.vercel.app`.
  Auto-deploys on every push to `main`.
- **Supabase**: one project, used for both Auth and the `profiles` table.
  Project ref is visible in the anon key / API URL (`https://<ref>.supabase.co`).

## Environment variables

Two variables, needed in **two separate places** that do not sync with each
other:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

1. **Locally**: `.env.local` in the project root (gitignored, never
   committed — `.env.local.example` is the template).
2. **On Vercel**: Project Settings → Environment Variables. Adding/changing
   these does *not* retroactively fix an already-failed deployment — you
   need to redeploy after changing them.

## Architecture map

```
app/layout.tsx              root shell: fonts, no-flash dark-mode script, wraps everything in AuthProvider
app/(site)/                 route group with the shared Header + Footer chrome
  page.tsx                  public welcome/landing page
  about/, apps/, apps/[id]/ public gallery + individual app viewer (iframe)
  dashboard/page.tsx        the personalized, logged-in dashboard (client component)
app/login/, app/signup/, app/reset-password/
                             full-bleed auth pages, deliberately OUTSIDE the
                             (site) route group so they have no header/footer —
                             they're meant to feel like an immersive HUD entry
                             point, not a plain form bolted onto the site

middleware.ts                refreshes the Supabase session on every request,
                              and redirects signed-out visitors away from
                              /dashboard before it renders

components/AuthProvider.tsx  client-side auth context (onAuthStateChange +
                              getUser). Everything reactive to "am I logged
                              in" (Header, dashboard) reads from useAuth()
lib/supabase/client.ts       browser Supabase client
lib/supabase/server.ts       server Supabase client (Server Components/Actions)
lib/authErrors.ts            maps raw Supabase error messages to friendly,
                              non-leaking copy — e.g. wrong password and
                              unknown account both say "Invalid email or
                              password" (anti-enumeration, deliberate)

config/apps.ts               THE app registry — single source of truth for
                              every mini-app on the hub. Adding a new app
                              means adding one entry here, nothing else.
public/mini-apps/<id>/       embedded apps' static files live here.
                              IMPORTANT: NOT public/apps/ — that collides with
                              the /apps/<id> hub route itself and 404s on
                              Vercel. This was a real bug that got fixed;
                              don't "clean up" the naming back to /apps/.

components/dashboard/        the personalized dashboard's pieces:
  ConfigurableAvatar.tsx     renders the glowing full-body outline per the
                             user's saved config (color/energy/symbols)
  AvatarCustomizer.tsx       the settings panel (single clean panel, not a
                             multi-step character creator, by design)
  AppBubble.tsx              floating app shortcuts around the avatar
  SidePanel.tsx              "most used" shortcuts + JourneyWave
  JourneyWave.tsx            the ambient activity trend (no axes/numbers, see
                             the tone constraint above)

lib/avatarOptions.ts         avatar customization types + curated option
                              lists (colors, energy styles, symbols). The
                              curated-list approach (not a free color picker
                              or icon upload) is deliberate, for visual
                              cohesion and to keep the icon set controlled.
lib/mockDashboard.ts         STILL MOCKED — the app bubbles' "activity" glow
                              and the JourneyWave's data are placeholder
                              values, not real per-user usage data. This
                              wasn't in scope for the auth work; real usage
                              tracking would be a future project.

supabase/profiles.sql        the one-time DB migration: profiles table +
                              Row Level Security policies + a trigger that
                              auto-creates a profile row on signup, seeded
                              with the display name from the signup form.
                              Already run against the live Supabase project.
```

## Design system

- Every color comes from CSS variables in `app/globals.css` (`--bg`,
  `--surface`, `--accent`, `--glow`, etc.), mapped to Tailwind tokens in
  `tailwind.config.ts` (`bg-accent`, `text-muted`, etc.). Dark/light mode is
  a single variable swap via a `.dark` class on `<html>` — never hardcode a
  raw Tailwind color like `bg-blue-500` for anything theme-related, use the
  semantic tokens so both themes stay correct.
- Dark is the default/primary experience (a moody "sci-fi HUD" look — deep
  navy, soft cyan glows, particle fields). Light mode exists and uses the
  same blue family, just brighter/airier — it's a real supported mode, not
  an afterthought.
- The brand wordmark (`components/Wordmark.tsx`) uses **fixed** brand colors
  (not theme tokens) matching the foundation's actual logo — blue→purple for
  "Inspiring", orange→yellow→green for "Children", purple→pink→orange for
  "Foundation". This does not change between light/dark mode.
- Font is Poppins (`next/font/google`), chosen to match the bold
  rounded-geometric look of the real logo — this was a best-effort visual
  match, not confirmed against the foundation's actual brand guidelines.

## Known gotchas (hit these already — don't re-hit them)

1. **Supabase Project URL vs. dashboard URL vs. Vercel URL.** All three are
   easy to confuse and all three get pasted into `NEXT_PUBLIC_SUPABASE_URL`
   by mistake at some point:
   - ❌ `https://supabase.com/dashboard/project/xxxxx` (the dashboard page)
   - ❌ `https://icf-hq-xxxxx.vercel.app` (a Vercel deployment URL)
   - ✅ `https://xxxxx.supabase.co` (the actual project API URL — find it at
     Project Settings → Data API, or construct it from the project ref)
2. **Never mark a `NEXT_PUBLIC_*` Vercel env var as "Sensitive."** It gets
   inlined into the browser bundle regardless, so hiding it in the dashboard
   provides no real security benefit — and doing so caused a real build
   failure where the variable silently wasn't available at build time. Keep
   these as plain variables.
3. **Supabase's Site URL** (Authentication → URL Configuration) controls
   where confirmation/reset emails redirect to *after* Supabase processes
   them. It defaults to `http://localhost:3000` and needs to be updated to
   the production URL, or production users land on a broken localhost link
   at the very last step of email confirmation/password reset (the actual
   confirm/reset still succeeds before that redirect — it's cosmetic but
   confusing).
4. **Supabase's default built-in email sender has a low rate limit** (a
   handful of emails/hour on free projects). Easy to hit during testing
   (signup confirmations + password resets add up fast). Before relying on
   this for real users, set up custom SMTP under Authentication → Settings.
5. **Sign-out must be a hard navigation.** `components/Header.tsx`'s sign-out
   uses `window.location.href = "/"` rather than Next's client-side router.
   This is deliberate: the dashboard page has its own "no session → redirect
   to /login" effect, and if sign-out used `router.push("/")`, that effect
   would sometimes race it and win, landing the user on `/login` instead of
   home. Don't "simplify" this back to `router.push`.
6. **`useSearchParams()` needs a Suspense boundary** in the App Router or
   `next build` fails outright. See the `<Suspense>` wrapper in
   `app/login/page.tsx` if adding similar search-param logic elsewhere.
7. **The Browser tool used during development cannot navigate to arbitrary
   external origins** (e.g. `*.supabase.co` auth-verify links) — this
   blocked automated end-to-end testing of email confirmation links. The
   workaround was reading confirmation/reset emails via mailinator.com's
   public inbox (real disposable-email service) and asking the human to
   click the actual verify link themselves in their own browser.

## Auth model

Real Supabase email/password auth (no social login, per explicit
requirement). Flow: `/signup` (display name + email + password + confirm) →
Supabase `signUp` with `display_name` in user metadata → DB trigger
auto-creates the `profiles` row → if email confirmation is required, user
confirms via email → `/login` → `middleware.ts` protects `/dashboard`.

**Open decision, deliberately not made yet**: whether to require email
confirmation before allowing dashboard access. The Supabase project
currently has this ON by default (confirmed during testing — new signups get
"check your email" rather than an instant session). The code handles both
cases gracefully either way; this is a product policy call for the user to
make, not a technical blocker.

There's also a history of this feature: the dashboard/avatar system was
originally built with a **mock auth stub** (`lib/mockAuth.ts`, localStorage-based,
hardcoded user "Bert") so the personalized UI could be designed and reviewed
before real auth existed. That file has since been deleted and fully replaced
by `components/AuthProvider.tsx` + real Supabase calls — if you see references
to "Bert" as a test user name in old commit messages or conversation history,
that's why.

## Cleanup still pending

A few throwaway test accounts exist in the live Supabase project's
Authentication → Users list from manual testing (mailinator.com addresses
like `icfhub.test.*@mailinator.com`, `icfhub.prodtest.*@mailinator.com`).
Fine to delete whenever.

## Running locally

```
npm install
npm run dev
```

Needs `.env.local` populated (see above) and the `supabase/profiles.sql`
migration already run against whichever Supabase project the env vars point
to. Full walkthrough is in `README.md`.

## How this user likes to work (soft notes, not hard rules)

- Prefers to create/edit `.env.local` and other secret-bearing files
  themselves rather than having Claude do it — walk them through it instead.
- Appreciates being shown big features in stages (the dashboard
  personalization work was built and reviewed in four explicit stages)
  rather than all at once.
- Values being told when a test was inconclusive or a limitation was hit,
  rather than the issue being glossed over.
- Is deliberate and safety-conscious about the teen mental-health angle —
  expect pushback (rightly) on anything that could read as clinical,
  evaluative, or body-image-related.
