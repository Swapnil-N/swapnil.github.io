# swapnil.github.io

Personal website built with Next.js 16 (App Router) featuring an interactive particle field hero, travel globe with 17 trips, resume page, and contact form.

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
  app/          — Pages and API routes (Next.js App Router)
  components/   — React components organized by feature
  lib/          — Utility functions (MDX processing, Supabase clients)
  types/        — TypeScript types
content/
  travel/       — Travel trip MDX files and _meta.ts index
  projects.ts   — Project portfolio data
  resume.ts     — Work experience, skills, and education data
  now.ts        — "Currently" section data
public/
  images/       — Static images (travel photos, etc.)
  models/       — 3D assets (earth texture)
middleware.ts   — Supabase session refresh + route protection
supabase-schema.sql — Database schema for auth + family tree
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

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the values:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (required for auth + family tree). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key. |

## Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run lint` | Run ESLint |
| `npm start` | Start the production server |

## Deployment

Deployed on [Vercel](https://vercel.com) at [swapnil-website.vercel.app](https://swapnil-website.vercel.app):

1. GitHub repo is connected to Vercel.
2. Pushes to `main` trigger automatic deployments.
3. Environment variables are set in Vercel project settings.

## TODOs

- [ ] Add travel photos to `public/images/travel/{slug}/`
- [ ] Personalize placeholder trip descriptions in MDX files
