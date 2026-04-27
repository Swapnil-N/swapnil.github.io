@AGENTS.md

## Project Overview

Personal website for **Swapnil Napuri** (NOT Nandeshwar).
Tagline: "Experience Maxer · Adventurer"
Hosted on Vercel, repo on GitHub at `Swapnil-N/swapnil.github.io`.
Currently on `main` branch.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** (uses `@theme inline` and `@custom-variant`, NOT v3 config patterns)
- **React Three Fiber** + `@react-three/drei` (for particle field hero and travel globe)
- **Framer Motion** (animations)
- **MDX** via `gray-matter` + `next-mdx-remote/rsc` (travel trip content)
- **next-themes** with `attribute="data-theme"` (dark mode default)
- **Self-hosted fonts** via `next/font/local` (Space Grotesk for headings, DM Sans for body)
- **React 19**, **TypeScript 5**

## Key Architecture Decisions

- **Tailwind v4**: No `tailwind.config.ts`. Colors are defined as CSS variables in `:root` of `globals.css`, then mapped to Tailwind tokens via the `@theme inline` block. Use `text-primary`, `bg-surface`, `text-foreground`, `text-muted`, etc. NEVER use `text-[var(--color-*)]` arbitrary value syntax.
- **Dark/light mode**: Uses `data-theme` attribute (not class-based), so the `dark:` variant requires the `@custom-variant` declaration in `globals.css`. Dark mode is the default theme.
- **3D components**: All React Three Fiber components live in `src/components/three/` and MUST be dynamically imported with `ssr: false`.
- **Content**: Public content lives in the `content/` directory (travel MDX files, `projects.ts`, `now.ts`, `resume.ts`). Use the `@content/*` import alias.
- **React 19 strict lint rules**: No `Math.random()` in `useMemo` or during render. No `setState` in `useEffect`. No refs during render. Use deterministic alternatives or module-scope generation.
- **Travel trips**: Add an MDX file to `content/travel/` AND update `content/travel/_meta.ts` (the source of truth for globe pins and ordering).
- **Contact page**: Uses a Google Form embed (no backend API route).

## Project Structure

```
content/           — Content data (travel MDX, projects, resume, now)
public/            — Static assets (images, models, fonts, favicon)
src/app/           — Pages (Next.js App Router)
src/components/    — React components by feature (three/, layout/, ui/, home/, travel/, about/, projects/)
src/lib/           — Utilities (mdx.ts)
```

## Development Commands

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run lint` — ESLint (React 19 strict rules)
- `npx tsc --noEmit` — type check

## Important Patterns

- All pages export `metadata` for SEO.
- `PageTransition` wrapper used on most pages for enter animation.
- Nav active state uses `startsWith` for sub-route highlighting.
- Trip detail pages at `/travel/[slug]` use `generateStaticParams` + `generateMetadata`.
- Globe pins come from `_meta.ts`, NOT from parsing MDX frontmatter.

## Phase 2 (Not Yet Built)

- Supabase auth (invite-only) + family tree behind auth
- Environment vars for Supabase in `.env.local.example`
- Planned routes: `/login`, `/family-tree`

## TODOs

- Replace Google Form URL in `src/app/contact/page.tsx`
- Add `resume.pdf` to `public/`
- Update social links in Footer (GitHub, LinkedIn, Instagram URLs are placeholders)
- Add travel photos to `public/images/travel/{slug}/`
- Add trip pages for Florida Keys/Miami and Spain
- Personalize placeholder trip descriptions in MDX files
- Phase 2: Supabase auth + family tree

## Common Pitfalls

- Do NOT use `tailwind.config.ts` — Tailwind v4 uses CSS-first config.
- Do NOT use `text-[var(--color-*)]` — use the Tailwind token names (`text-primary`, `text-muted`, etc.).
- Do NOT use `next/font/google` — fonts fail to fetch during offline builds. Use `next/font/local` with the woff2 files in `src/app/fonts/`.
- Do NOT use `Math.random()` inside React components — React 19 lint flags it as impure. Generate at module scope.
- Do NOT use `useEffect(() => setState(...))` — React 19 lint flags it. Use `useSyncExternalStore` or handle in event callbacks.
- Google Form embed has a `bg-white` wrapper — this is intentional for the iframe.
