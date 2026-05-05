# swapnil.github.io

Personal website built with Next.js 16 (App Router) featuring an interactive particle field hero, travel globe with 17 trips, resume page, contact form, an invite-only family tree, an admin dashboard with granular role-based permissions, and multi-tenant client demo hosting at `/demo/{slug}`.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (dark mode only)
- **3D Graphics:** React Three Fiber + Three.js
- **Animation:** Framer Motion
- **Content:** MDX (via next-mdx-remote)
- **Auth:** Supabase (invite-only)
- **Database:** Supabase Postgres (family tree)
- **Contact:** Custom form → Google Forms
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/Swapnil-N/swapnil.github.io.git
cd swapnil.github.io

# Install dependencies
npm install

# Copy the example env file and fill in your values
cp .env.local.example .env.local

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/          — Pages and routes (Next.js App Router).
                  Admin dashboard at /admin (gated by granular permissions);
                  account self-service at /account; client demos at /demo/{slug}.
  components/
    admin/ui/   — Reusable primitives (Button, Modal, Table, etc.)
    client/    — Demo dashboard strip + request-changes modal
  lib/
    auth/       — Permission helpers, audit logging
    demo/       — gateDemo() server-only auth gate
    supabase/   — Client, server, middleware, admin factories
  types/        — TypeScript types (family.ts, client.ts, admin.ts)
content/        — Travel MDX, projects, resume, now
public/
  demo/{slug}/  — Per-demo static assets
scripts/
  new-demo.ts   — Scaffold script for new client demos
middleware.ts   — Supabase session refresh + route protection
supabase-schema.sql — Database schema (run in fresh Supabase projects)
```

## Content Management

### Add a new travel trip

1. Create a new MDX file in `content/travel/` (e.g. `peru-2025.mdx`) with frontmatter for title, dates, coordinates, and cover image.
2. Update `content/travel/_meta.ts` to include the new trip in the metadata list.
3. Add any trip photos to `public/images/travel/`.

### Add a new project

Edit `content/projects.ts` and add a new entry to the projects array.

### Update the "Currently" section

Edit `content/now.ts` to change what appears in the "Currently" section on the home page.

### Update resume / work experience

Edit `content/resume.ts` to update experiences, skills, or education.

## Client Demo Hosting

Spin up a demo site at `swapnil.dev/demo/{slug}` behind per-client auth, then graduate paying clients into their own repo + Vercel project + custom domain.

```bash
# 1. Create the DB record via /admin/demos (admin UI), then scaffold the folder:
npm run new-demo -- --slug=acme-bakery --name="Acme Bakery"

# 2. Vibe-code the demo in src/app/demo/acme-bakery/
# 3. Invite the client via /admin/invitations (role=Client, demo=acme-bakery)
# 4. Set a Stripe payment link via /admin/demos when ready to collect payment
```

Each demo lives entirely in `src/app/demo/{slug}/` + `public/demo/{slug}/` so it can be cleanly cut and pasted into a graduation repo. The shared `gateDemo()` wrapper in `src/lib/demo/gate.ts` enforces auth and ownership; admins can preview any demo.

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the values:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (required for auth + family tree). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service-role key. Required for the admin dashboard (hard-deleting users, sending invite emails, reading last-sign-in). |

## Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run lint` | Run ESLint |
| `npm start` | Start the production server |
| `npm run new-demo -- --slug=foo --name="Foo Co"` | Scaffold a new client demo folder |

## Deployment

Deployed on [Vercel](https://vercel.com) at [swapnil-website.vercel.app](https://swapnil-website.vercel.app):

1. GitHub repo is connected to Vercel.
2. Pushes to `main` trigger automatic deployments.
3. Environment variables are set in Vercel project settings.

## TODOs

- [ ] Add travel photos to `public/images/travel/{slug}/`
- [ ] Personalize placeholder trip descriptions in MDX files
