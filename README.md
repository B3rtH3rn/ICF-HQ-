# ICF Mini-Apps Hub

A website that showcases the apps and tools built by the young people in our
foundation's program. Visitors browse a gallery of apps, search/filter by
tag, and open any app right from the hub.

Built with **Next.js**, **TypeScript**, and **Tailwind CSS**, exported as a
static site so it's cheap and simple to host.

## Running it locally

You'll need [Node.js](https://nodejs.org) installed (the free "LTS" version
is fine). Then, from this folder:

```
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

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
app/                 pages (home, about, and the /apps/[id] viewer)
components/          reusable UI pieces (header, footer, app cards, grid)
config/apps.ts        <-- the app registry — the only file you need to edit
public/mini-apps/<id>/     embedded apps' files live here
```

## Deployment

This project is configured for static export (`output: "export"` in
`next.config.mjs`), so `npm run build` produces a plain `/out` folder of
static files that can be hosted almost anywhere.

We haven't picked a hosting platform yet — before wiring up a real deploy
(Vercel, Netlify, etc.), let's confirm which one we're using so the setup
matches your account/domain.
