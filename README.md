# swapnil.github.io

Personal website built with Next.js 16 (App Router) featuring a 3D interactive hero section, travel globe, project portfolio, and contact form.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **3D Graphics:** React Three Fiber + Three.js
- **Animation:** Framer Motion
- **Content:** MDX (via next-mdx-remote)
- **Contact:** Google Forms (embedded)
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
  hooks/        — Custom React hooks
  lib/          — Utility functions (MDX processing)
content/
  travel/       — Travel trip MDX files and _meta.ts index
  projects.ts   — Project portfolio data
  now.ts        — "Currently" / "Now" section data
public/
  images/       — Static images (travel photos, etc.)
  models/       — 3D model assets (earth texture, etc.)
```

## Content Management

### Add a new travel trip

1. Create a new MDX file in `content/travel/` (e.g. `peru-2025.mdx`) with frontmatter for title, dates, coordinates, and cover image.
2. Update `content/travel/_meta.ts` to include the new trip in the metadata list.
3. Add any trip photos to `public/images/travel/`.

### Add a new project

Edit `content/projects.ts` and add a new entry to the projects array with the project title, description, tech stack, links, and image.

### Update the "Currently" section

Edit `content/now.ts` to change what appears in the "Now" / "Currently" section of the site.

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the values:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (Phase 2 -- not yet used). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key (Phase 2 -- not yet used). |

## Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run lint` | Run ESLint |
| `npm start` | Start the production server |

## Deployment

This site is designed for deployment on [Vercel](https://vercel.com):

1. Connect your GitHub repository in the Vercel dashboard.
2. Vercel will auto-detect Next.js and configure the build.
3. Add environment variables (if needed) in the Vercel project settings under Environment Variables.
4. Pushes to the main branch will trigger automatic deployments.

## TODOs / Customization

Before going live, complete these manual setup items:

- [ ] Replace placeholder content in `content/projects.ts`, `content/now.ts`, and `content/travel/` MDX files
- [ ] Add your `resume.pdf` to `public/`
- [ ] Add travel photos to `public/images/travel/`
- [ ] Update social links in the Footer component (GitHub, LinkedIn, Instagram URLs)
- [ ] Create a Google Form for contact and update the embed URL in `src/app/contact/page.tsx`
- [ ] **Phase 2:** Set up Supabase for auth and family tree features (not yet implemented)
