# ICF Mini-Apps Hub

A website that showcases the apps and tools built by the young people in our
foundation's program. Visitors browse a gallery of apps, search/filter by
tag, and open any app right from the hub.

Built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Supabase**
(email/password auth + a `profiles` table for each user's avatar look).

## Running it locally

You'll need [Node.js](https://nodejs.org) installed (the free "LTS" version
is fine), plus a [Supabase](https://supabase.com) project (free tier is
fine). See [Auth setup](#auth-setup-supabase) below for the one-time project
setup, then from this folder:

```
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Auth setup (Supabase)

The hub uses [Supabase](https://supabase.com) for real email/password
accounts. One-time setup:

1. Create a free project at [supabase.com](https://supabase.com/dashboard).
2. In the project, go to **Project Settings → API** and copy the **Project
   URL** and the **anon public** key.
3. Copy [`.env.local.example`](.env.local.example) to a new file named
   `.env.local` in this folder, and paste those two values in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
   `.env.local` is gitignored — it never gets committed.
4. In the Supabase dashboard, open the **SQL Editor** and run the migration
   in [`supabase/profiles.sql`](supabase/profiles.sql) to create the
   `profiles` table with Row Level Security enabled.
5. Optional: under **Authentication → Providers → Email**, decide whether to
   require email confirmation before sign-in. It's off by default in most
   new projects, meaning someone can sign up and use the dashboard
   immediately — confirmation enforcement is a deliberate follow-up
   decision, not yet built.

## How to add a new app (no coding required!)

Everything about the apps on the hub lives in **one file**:
[`config/apps.ts`](config/apps.ts). You never need to touch anything else —
no page code, no routing, nothing.

### Step 1: Decide how your app will be hosted

- **Option A — "embedded"**: your app is a simple website (HTML/CSS/JS files)
  and you want it to live right inside the hub.
- **Option B — "external"**: your app is already live somewhere else (your
  own Vercel/Replit link, etc.) and you just want the hub to link out to it.

### Step 2: If you chose "embedded", add your files

1. Create a new folder inside [`public/mini-apps/`](public/mini-apps/) named
   after your app, e.g. `public/mini-apps/my-cool-app/`.
2. Put your app's files inside that folder. There must be a file named
   `index.html` — that's the page that will load first.
3. That's it — your app's files are now part of the hub.

   (Files live under `public/mini-apps/` rather than `public/apps/` on
   purpose — that name is reserved for the hub's own `/apps/<id>` viewer
   page, and reusing it causes a URL conflict on some hosts.)

### Step 3: Add an entry to the registry

Open [`config/apps.ts`](config/apps.ts) and copy one of the existing entries
inside the `apps` array, then fill in your own details:

```ts
{
  id: "my-cool-app",              // must be unique, lowercase, hyphens only
  title: "My Cool App",
  description: "A short sentence about what your app does.",
  creatorName: "Your Name",        // optional
  emoji: "✨",                     // shown on the card if you don't have a thumbnail image
  type: "embedded",                // or "external"
  url: "/mini-apps/my-cool-app/",  // for embedded — matches the folder from Step 2 (keep the trailing slash)
  // url: "https://my-app.vercel.app",  // use this style instead for "external"
  tags: ["fun", "coping tools"],
  dateAdded: "2026-07-21",
},
```

Save the file — your app now shows up on the home page automatically.

### A note on tags

Tags power the search/filter bar. Try to reuse existing tags already used by
other apps (you'll see them in the filter buttons on the home page) so
everything stays organized, but feel free to add a new one if nothing fits.

## Project structure

```
app/                    pages (home, about, apps gallery, /apps/[id] viewer)
app/login, app/signup, app/reset-password   auth pages (outside the main site chrome)
app/(site)/dashboard    the signed-in, personalized dashboard
components/             reusable UI pieces (header, footer, app cards, grid)
components/dashboard/   the avatar, bubbles, side panel, customizer
config/apps.ts           <-- the app registry — the only file you need to edit
public/mini-apps/<id>/        embedded apps' files live here
lib/supabase/            Supabase client helpers (browser + server)
middleware.ts            refreshes the session + protects /dashboard
supabase/profiles.sql    the one-time database migration (see Auth setup)
```

## Deployment

This project runs as a standard Next.js server app (not a static export) —
real login requires a server to check sessions on each request via
`middleware.ts`. It's deployed on Vercel, which runs Next.js natively.

**Important:** `.env.local` only applies locally. For the live site to log
anyone in, add the same two variables in the Vercel project's
**Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Redeploy after adding them (Vercel doesn't pick up new env vars on an
already-running deployment).
