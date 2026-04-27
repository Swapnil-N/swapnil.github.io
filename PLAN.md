# Personal Website Plan — swapnil.github.io

## Context

Building a personal website from scratch for a Forward Deployed Engineer who travels extensively. The site needs to make a strong first impression with interactive 3D visuals, showcase travel experiences in an immersive way, present professional credentials, and provide a private family tree behind authentication. The repo is **public**, so all private data must live in a database, never in the repo.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router, TypeScript) |
| Styling | Tailwind CSS |
| 3D | React Three Fiber + @react-three/drei |
| Animations | Framer Motion |
| Content | MDX files in repo (public), Supabase (private) |
| Auth | Supabase Auth (invite-only) |
| Database | Supabase Postgres (family tree, user accounts) |
| Hosting | Vercel |
| Fonts | Space Grotesk (headings) + DM Sans (body) via next/font |

## Design Direction

**Bold & colorful** — vibrant coral-red primary, electric blue secondary, energetic yellow accent, deep dark surfaces. Strong typography, playful scroll-driven animations, high energy.

---

## Implementation Strategy

### Sub-Agent Usage
The orchestrator agent should **generously delegate** to sub-agents to preserve context. Each step should be implemented by a sub-agent with a self-contained prompt that includes: the step's full details from this plan, the file paths to create/modify, and the verification steps. The orchestrator should:
- Launch one sub-agent per step (Steps 0-7)
- Provide the sub-agent with the exact code patterns and file structures from this plan
- After each sub-agent completes, run the verify command (`npm run build && npm run lint`) before moving to the next step
- For Steps 2 and 3 (3D scenes), the sub-agent prompt must include the full code snippets from this plan since they are load-bearing

### Responsive Design Rules (apply to every component)
All components must work across these breakpoints with dynamic resizing (window resize, orientation change):
- **Mobile**: 320px - 767px — single column, hamburger nav, simplified layouts
- **Tablet**: 768px - 1023px — 2-column grids, expanded nav
- **Desktop**: 1024px - 1439px — full layout
- **Wide**: 1440px+ — max-width container (`max-w-7xl mx-auto`), centered content

Specific responsive rules:
- Nav: hamburger menu below `md` (768px), horizontal links at `md`+
- 3D scenes: full viewport on all sizes, but on `< md` render static fallback (mobile GPUs)
- Timelines (experience, travel): single column below `md`, alternating left/right at `md`+
- Grids (skills, projects): `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Font sizes: use `text-3xl md:text-5xl lg:text-7xl` for hero text, `text-base md:text-lg` for body
- Canvas/3D: use `useEffect` resize listener + R3F's built-in resize handling. Always test window resize doesn't break the scene
- Touch: all hover effects must have tap equivalents on mobile (use Framer Motion `whileTap` alongside `whileHover`)
- Test: resize browser window at every breakpoint — no layout breaks, no overflow, no hidden content

### Manual Setup TODOs (for the site owner)
These require human action and cannot be automated by code:

- [ ] **TODO: Vercel account** — Create a Vercel account at vercel.com, connect the `swapnil-n/swapnil.github.io` GitHub repo, deploy
- [ ] **TODO: Custom domain** — In Vercel dashboard, add your custom domain (if you have one). Update DNS records as instructed
- [ ] **TODO: Resend account** — Sign up at resend.com (free tier: 100 emails/day). Create an API key. Add your domain for sending. Put the API key in `.env.local` as `RESEND_API_KEY`
- [ ] **TODO: Contact email** — Set `CONTACT_EMAIL` in `.env.local` to the email where you want contact form submissions sent
- [ ] **TODO: Supabase project (Phase 2)** — Create a Supabase project at supabase.com. Copy the URL and anon key to `.env.local`. Run the SQL table creation scripts from the Phase 2 section
- [ ] **TODO: Earth texture** — Download or create a stylized earth texture image (1024x512 or 2048x1024 equirectangular). Place at `public/models/earth-texture.jpg`. Artistic/illustrated style preferred over photorealistic (matches bold aesthetic)
- [ ] **TODO: Resume PDF** — Place your resume PDF at `public/resume.pdf`
- [ ] **TODO: Profile photo** — Place your photo at `public/images/profile/headshot.jpg`
- [ ] **TODO: Travel photos** — Add trip photos to `public/images/travel/{trip-slug}/` directories. At minimum need a `cover.jpg` per trip
- [ ] **TODO: Content** — Fill in real data in `content/now.ts`, `content/projects.ts`, and create your travel MDX files in `content/travel/`
- [ ] **TODO: Favicon** — Replace `public/favicon.ico` with your own
- [ ] **TODO: Social links** — Update GitHub, LinkedIn URLs in the Footer component

---

## Phased Delivery

### Phase 1: Public Pages (build first)
- Home page with 3D flyover hero + "Currently" section (now-page content embedded)
- Travel page with globe + scroll timeline + shareable `/travel/[slug]` detail pages
- About/professional page
- Projects/portfolio page
- Contact form
- Dark/light mode toggle

### Phase 2: Auth + Private Content (build later)
- Supabase auth (invite-only users)
- Family tree (visual diagram, data in Supabase)

---

## Phase 1 Implementation

### Step 0: Project Scaffolding

**Commands to run:**
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
npm install three @react-three/fiber @react-three/drei framer-motion gray-matter next-mdx-remote simplex-noise@^4.0.0 next-themes resend
npm install -D @types/three
mkdir -p content/travel public/images/travel public/images/profile public/models
```

> **Note:** Pin `tailwindcss@^3.4` if create-next-app installs v4. The plan uses Tailwind v3 config patterns (`tailwind.config.ts`, `@tailwind` directives, `rgb(var(...) / <alpha-value>)`). If Tailwind v4 is installed, either downgrade or rewrite the color system to use v4's `@theme` + CSS-native approach. Omit `@react-three/postprocessing` for Phase 1 — it adds ~150KB for subtle glow that isn't worth it yet.

**`src/app/globals.css`** — Color system via CSS custom properties (Tailwind v3 pattern):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: 255 90 95;
    --color-secondary: 50 50 255;
    --color-accent: 255 200 50;
    --color-surface: 15 15 25;
    --color-text: 245 245 255;
  }
  .light {
    --color-primary: 220 60 70;
    --color-secondary: 40 40 200;
    --color-accent: 200 160 30;
    --color-surface: 250 250 255;
    --color-text: 20 20 30;
  }
}
```

> If using Tailwind v4, replace with v4-native `@theme` block and `oklch` values instead.

**`tailwind.config.ts`** — Extend theme with semantic colors referencing the CSS vars:
```ts
colors: {
  primary: 'rgb(var(--color-primary) / <alpha-value>)',
  secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
  accent: 'rgb(var(--color-accent) / <alpha-value>)',
  surface: 'rgb(var(--color-surface) / <alpha-value>)',
  foreground: 'rgb(var(--color-text) / <alpha-value>)',
},
fontFamily: {
  heading: ['var(--font-heading)', 'sans-serif'],
  body: ['var(--font-body)', 'sans-serif'],
},
```

**`src/app/layout.tsx`** — Root layout using `next/font` and `next-themes`:
```tsx
import { Space_Grotesk, DM_Sans } from 'next/font/google'
import { ThemeProvider } from 'next-themes'

const heading = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading' })
const body = DM_Sans({ subsets: ['latin'], variable: '--font-body' })

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${heading.variable} ${body.variable} font-body bg-surface text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <Nav />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**`tsconfig.json`** — Add `@content/*` path alias so imports from `content/` aren't relative:
```json
"paths": {
  "@/*": ["./src/*"],
  "@content/*": ["./content/*"]
}
```

**`.gitignore`** must include: `.env.local`, `node_modules/`, `.next/`, `*.tsbuildinfo`

**`.env.local.example`**:
```
NEXT_PUBLIC_SUPABASE_URL=your-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
RESEND_API_KEY=your-resend-key-here
CONTACT_EMAIL=your-email@example.com
```

**Verify:** `npm run dev` starts without errors, `npm run build` succeeds, site loads at localhost:3000

### Step 1: Navigation & Layout Shell

**`src/components/layout/Nav.tsx`** — `'use client'` component:
- `fixed top-0 w-full z-50 backdrop-blur-md bg-surface/80 border-b border-foreground/10`
- Links: Home `/`, Travel `/travel`, Projects `/projects`, About `/about`, Contact `/contact`
- Use `usePathname()` from `next/navigation` to highlight active link with animated underline (Framer Motion `layoutId` on a `motion.div` under the active link)
- Mobile: hamburger button toggles a slide-down menu with `AnimatePresence`
- Include `<ThemeToggle />` in the nav bar (right side)

**`src/components/layout/ThemeToggle.tsx`** — `'use client'` component:
- Uses `useTheme()` from `next-themes`
- Sun/moon icon toggle button, animated swap with Framer Motion
- Renders `null` until `mounted` to avoid hydration mismatch

**`src/components/layout/Footer.tsx`** — Server component:
- Social links: GitHub, LinkedIn (as icon buttons)
- Copyright line with current year
- Minimal design, `border-t border-foreground/10`

**`src/components/layout/PageTransition.tsx`** — `'use client'` wrapper:
- Wraps children in `motion.div` with `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`
- **No exit animations** — App Router doesn't support `AnimatePresence` exit cleanly without making the root layout a client component. Enter-only animations are sufficient and simpler

**Verify:** Navigate between pages — active link updates, mobile hamburger works, theme toggle switches colors and persists on refresh

### Step 2: 3D Flyover Hero — Home Page

**Architecture overview:** The home page has a tall scroll container (`~400vh`). The R3F `<Canvas>` is `position: fixed; inset: 0` behind it. A `useScrollProgress` hook returns a ref with value `[0,1]` that drives the camera. HTML overlays (name, tagline) appear at specific scroll thresholds as absolutely-positioned elements over the canvas.

**`src/hooks/useScrollProgress.ts`** — Shared scroll hook used by both hero and travel page:
```tsx
'use client'
// Returns a ref whose .current is [0,1] based on scroll position
// Uses requestAnimationFrame throttling for performance
// Accepts optional scrollContainer ref (defaults to window)
export function useScrollProgress(container?: RefObject<HTMLElement>): MutableRefObject<number>
```

**`src/app/page.tsx`** — Home page (Server Component shell):
```tsx
import dynamic from 'next/dynamic'
const FlyoverHero = dynamic(() => import('@/components/three/FlyoverScene'), {
  ssr: false,
  loading: () => <HeroSkeleton />  // Gradient placeholder while Three.js loads (~700KB)
})
// ... render FlyoverHero + CurrentlySection
```
The `<HeroSkeleton>` is a `div` with a CSS gradient matching the terrain colors — prevents blank white flash.

**Mobile 3D fallback:** In `FlyoverScene.tsx`, check `navigator.hardwareConcurrency <= 4` or `window.innerWidth < 768` on mount. If low-end, render a static gradient/image hero instead of the full 3D scene. This is separate from `prefers-reduced-motion`.

**`src/components/three/FlyoverScene.tsx`** — `'use client'`, top-level scene:
- `<Canvas dpr={[1, 2]} camera={{ fov: 60, near: 0.1, far: 200 }}>`
- Contains: `<Terrain />`, `<CameraRig />`, `<Destinations />`, `<Sky />`, `<fog attach="fog" />`
- Optional: `<EffectComposer>` with `<Bloom luminanceThreshold={0.8} />` for glowing markers

**`src/components/three/Terrain.tsx`** — Procedural landscape:
- Create `PlaneGeometry(100, 300, 128, 256)` — wide and long so camera flies over it
- Displace vertices with `createNoise2D()` from `simplex-noise`: `height = noise(x*0.04, z*0.04) * 8 + noise(x*0.1, z*0.1) * 2`
- Color vertices by height using `Float32Array` color attribute: low=purple `(0.3, 0.1, 0.5)`, mid=coral `(1.0, 0.35, 0.37)`, high=gold `(1.0, 0.8, 0.2)`
- `<meshStandardMaterial vertexColors flatShading />` for low-poly look
- Rotate plane `-Math.PI/2` on X so it's horizontal

**`src/components/three/CameraRig.tsx`** — Scroll-driven camera:
```tsx
// Inside useFrame:
const t = scrollProgress.current
camera.position.set(
  Math.sin(t * Math.PI * 2) * 5,  // side-to-side sway
  15 - t * 6,                       // gradually descend from 15 to 9
  50 - t * 120                      // fly forward (start at z=50, end at z=-70)
)
camera.lookAt(Math.sin(t * Math.PI * 2) * 5, 0, 50 - t * 120 - 30) // look ahead
```

**`src/components/three/Destinations.tsx`** — Navigation markers in 3D space:
- 3 groups placed at positions along the flight path: Travel `[10, 4, -10]`, Projects `[-8, 3, -40]`, About `[6, 5, -65]`
- Each: `<mesh><sphereGeometry args={[0.5]} /><meshStandardMaterial emissive="#ffcc33" emissiveIntensity={2} /></mesh>` + drei `<Html center distanceFactor={15}>` with a styled link
- Markers pulse (scale oscillation in `useFrame`)

**`src/components/three/Sky.tsx`** — Atmosphere:
- drei `<Stars radius={100} count={2000} />` + `<GradientTexture>` on a large `<Sphere>` enclosing the scene
- Or use drei `<Sky sunPosition={[100, 20, 100]} />` with custom turbidity

**`src/components/ui/AnimatedText.tsx`** — Overlay text:
- Positioned as `fixed top-0 left-0 w-full h-screen flex items-center justify-center pointer-events-none`
- Name in `font-heading text-6xl md:text-8xl font-bold` with Framer Motion `variants` for letter-by-letter stagger animation
- Fades out as scroll progresses (opacity driven by `useTransform(scrollY, [0, 300], [1, 0])`)

**"Currently" section** — `src/components/home/CurrentlySection.tsx`:
- Rendered below the hero scroll container (normal document flow)
- Reads from `content/now.ts` which exports: `{ location, workingOn, reading, travelHighlight }`
- 4 cards in a grid, each with an icon + label + value. Cards animate in with Framer Motion `useInView`
- Styled with `bg-surface border border-foreground/10 rounded-2xl p-6`

**`content/now.ts`**:
```ts
export const now = {
  location: "San Francisco, CA",
  workingOn: "Building data pipelines at Palantir",
  reading: "Project Hail Mary by Andy Weir",
  travelHighlight: { label: "Last trip: Japan", slug: "japan-2024" },
  updatedAt: "2026-04-01",
}
```

**Verify:** `npm run dev` → scroll the home page → camera flies over terrain, destinations visible, text animates, "Currently" section appears below hero

### Step 3: Travel Page — Globe + Scroll Timeline

> **Moved up from Step 6** — this is the highest-risk feature (3D globe + MDX + scroll transitions). Build it early to surface integration issues while there's time to simplify.

**`src/app/about/page.tsx`** — Server component composing 3 sections with full-width scroll:

**`src/components/about/ExperienceTimeline.tsx`** — `'use client'`:
- Vertical timeline with a center line (`absolute left-1/2 w-0.5 bg-primary/30`)
- Array of experience objects: `{ company, role, period, description, logo? }`
- Each entry alternates left/right of the center line
- Framer Motion `useInView` on each entry → slides in from the side + fades in
- Use `motion.div` with `initial={{ opacity: 0, x: isLeft ? -50 : 50 }}` `whileInView={{ opacity: 1, x: 0 }}`
- On mobile: all entries stack left-aligned (no alternating)

**`src/components/about/SkillsVisualization.tsx`** — `'use client'`:
- Bento grid layout: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`
- Each skill card: icon (use simple SVG or emoji), skill name, category tag
- 3D tilt on hover: `onMouseMove` calculates tilt angle from cursor position, applies `transform: perspective(1000px) rotateX(Xdeg) rotateY(Ydeg)` via inline style
- Categories: Languages (Python, TypeScript, SQL), Frameworks (React, Next.js, Node), Cloud (AWS, GCP, Vercel), Tools (Git, Docker, Terraform)
- Featured skills get `col-span-2` for larger cards

**`src/components/about/InlineResume.tsx`** — `'use client'`:
- Tab layout: Education | Experience | Skills (using Framer Motion `layoutId` for animated tab indicator)
- Each tab panel is an accordion of entries that expand/collapse
- Download button: `<a href="/resume.pdf" download>` styled as primary button
- Sticky download button at bottom of section on mobile

**Verify:** Scroll the about page — timeline entries animate in, skill cards tilt on hover, tabs switch with animation, resume PDF downloads

### Step 4: Contact Form

> **Moved up** — validates API routes work on Vercel early.

**`content/projects.ts`** — Data file:
```ts
export interface Project {
  slug: string; title: string; description: string;
  tags: string[]; image?: string; // path in public/images/projects/
  github?: string; liveUrl?: string; featured?: boolean;
}
export const projects: Project[] = [
  { slug: 'project-1', title: 'Example Project', description: '...', tags: ['React', 'Three.js'], featured: true },
  // ...
]
```

**`src/app/projects/page.tsx`** — Server component, imports data from `content/projects.ts`:
- Page heading with `AnimatedText`
- Renders `<ProjectGrid projects={projects} />`

**`src/components/projects/ProjectCard.tsx`** — `'use client'`:
- `featured` projects: `col-span-2 row-span-2` in the grid
- Card: `rounded-2xl overflow-hidden bg-surface border border-foreground/10`
- Image/screenshot at top (Next.js `<Image>` with `fill` + `object-cover`)
- Title, 1-2 line description, tech tags as small pill badges (`rounded-full bg-primary/10 text-primary text-xs px-2 py-1`)
- GitHub + Live Demo links as icon buttons
- Same 3D tilt hover effect as skills cards
- Stagger animation: parent grid uses `staggerChildren: 0.1` in Framer Motion variants

**Verify:** Projects page renders all entries, featured cards are larger, hover tilt works, external links open correctly

### Step 5: About / Professional Page

**`src/app/contact/page.tsx`** — `'use client'`:
- Form fields: name (text), email (email), message (textarea) — all required
- Hidden honeypot field `<input name="website" className="hidden" />` — if filled, reject (bot)
- Submit button with loading state (spinner + disabled)
- On success: form fades out, success message fades in (Framer Motion `AnimatePresence`)
- On error: red error banner with retry option
- Use `fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) })`

**`src/app/api/contact/route.ts`** — API route:
```ts
import { NextResponse } from 'next/server'
// Use Resend SDK: npm install resend
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { name, email, message, website } = await req.json()
  if (website) return NextResponse.json({ ok: true }) // honeypot
  // Basic validation
  if (!name || !email || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  await resend.emails.send({
    from: 'Contact Form <noreply@yourdomain.com>',
    to: process.env.CONTACT_EMAIL!,
    subject: `Contact from ${name}`,
    text: `From: ${name} (${email})\n\n${message}`,
  })
  return NextResponse.json({ ok: true })
}
```
Note: Until Resend is configured, the API route can just log to console as a stub.

**Rate limiting:** Use an in-memory Map keyed by IP (`req.headers.get('x-forwarded-for')`) with a sliding window — reject if >5 requests per IP per hour. Simple and sufficient for a personal site. No external dependency needed.

**Verify:** Submit the form → API returns 200, email received (or console log). Honeypot field rejects bots silently. Submit 6 times rapidly → 429 response

### Step 6: Projects / Portfolio Page

**`content/travel/_meta.ts`** — Source of truth for trip ordering and globe pins:
```ts
export interface TripMeta {
  slug: string; title: string; lat: number; lng: number;
  startDate: string; excerpt: string; coverImage: string;
}
export const trips: TripMeta[] = [
  { slug: 'japan-2024', title: 'Japan', lat: 35.68, lng: 139.65, startDate: '2024-03-15', excerpt: 'Tokyo to Kyoto...', coverImage: '/images/travel/japan-2024/cover.jpg' },
  // ... newest first
]
```

**`content/travel/japan-2024.mdx`** — Example trip MDX:
```mdx
---
title: "Japan: Tokyo to Kyoto"
slug: "japan-2024"
startDate: "2024-03-15"
endDate: "2024-03-28"
coverImage: "/images/travel/japan-2024/cover.jpg"
locations:
  - { name: "Tokyo", lat: 35.68, lng: 139.65 }
  - { name: "Kyoto", lat: 35.01, lng: 135.77 }
tags: ["asia", "culture"]
excerpt: "Two weeks weaving through neon-lit streets and ancient temples."
---

## Tokyo
The city hit me like a wall of sound...

<PhotoGallery photos={[{ src: "/images/travel/japan-2024/shibuya.jpg", alt: "Shibuya" }]} />
```

**`src/lib/mdx.ts`** — Content pipeline:
```ts
import fs from 'fs'; import path from 'path'; import matter from 'gray-matter'
const CONTENT_DIR = path.join(process.cwd(), 'content', 'travel')
export function getTripBySlug(slug: string) {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, `${slug}.mdx`), 'utf-8')
  const { data: frontmatter, content } = matter(raw)
  return { frontmatter, content }
}
```

**`src/app/travel/page.tsx`** — Travel index (Server Component shell):
- Import `trips` from `content/travel/_meta.ts`
- Dynamic-import `<GlobeSection />` with `ssr: false`
- Render `<TripTimeline trips={trips} />` below

**`src/components/three/GlobeScene.tsx`** — `'use client'`:
- `<Canvas>` with `<Sphere args={[2, 64, 64]}>` + `useTexture('/models/earth-texture.jpg')`
- Slow auto-rotate: `ref.current.rotation.y += 0.002` in `useFrame`
- Lat/lng to 3D conversion utility:
```ts
function latLngToVec3(lat: number, lng: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))
}
```

**`src/components/three/GlobePins.tsx`** — Animated pins at each trip location:
- Small `<mesh>` spheres at pin positions with `<meshStandardMaterial emissive color="coral" />`
- drei `<Html>` tooltip showing trip name on hover

**Globe→Timeline scroll transition** (in `src/app/travel/page.tsx`):
- Page scroll container is `~500vh` tall
- Globe wrapper: `position: sticky; top: 0; height: 100vh`
- Use Framer Motion `useScroll({ target: containerRef })` → `useTransform(scrollYProgress, [0, 0.25, 0.35], [1, 1, 0])` for globeOpacity
- Timeline wrapper starts at ~30% scroll point, fades in with `useTransform(scrollYProgress, [0.25, 0.35], [0, 1])` for opacity

**`src/components/travel/TripTimeline.tsx`** — Vertical timeline:
- Center line + alternating `<TripCard>` components left/right
- Each card is a `<Link href={/travel/${trip.slug}}>` wrapping the card content
- Framer Motion `whileInView` for stagger entrance

**`src/components/travel/TripCard.tsx`** — Individual card:
- Cover image (Next.js `<Image>`), title, date range, excerpt, location tags
- `rounded-2xl overflow-hidden bg-surface border border-foreground/10 hover:border-primary/50 transition`

**`src/app/travel/[slug]/page.tsx`** — Trip detail page (shareable URL):
- Server Component. Wraps `getTripBySlug(params.slug)` in try/catch — calls `notFound()` from `next/navigation` if slug doesn't exist
- Renders MDX with `next-mdx-remote/rsc` `compileMDX()` (NOT the old `serialize()` which was removed in v5+)
- Passes custom components: `{ PhotoGallery, RouteSegment }` via `components` prop
- Back button to `/travel`
- `generateStaticParams()` returns all slugs from `_meta.ts` for static generation at build time
- `generateMetadata()` returns title, description (excerpt), and OG image (coverImage) from frontmatter — this is what makes shared links look good in Slack/Twitter/iMessage

**`src/components/travel/PhotoGallery.tsx`** — `'use client'`:
- Grid of images. Click opens lightbox overlay (dark backdrop, large image, prev/next arrows, close button)
- Framer Motion `AnimatePresence` for overlay enter/exit
- Keyboard: Escape closes, left/right arrows navigate

**Verify:** Globe renders with pins at correct locations. Scroll transitions globe → timeline. Click trip card → navigates to `/travel/japan-2024`. Direct URL `/travel/japan-2024` loads full detail page. Photos open in lightbox

### Step 7: Error Handling, SEO & Polish

**Error pages:**
- **`src/app/not-found.tsx`** — Custom 404 page with bold styling, link back to home
- **`src/app/error.tsx`** — `'use client'` error boundary with retry button
- **`src/app/travel/[slug]/page.tsx`** — Wrap `getTripBySlug` in try/catch, call `notFound()` from `next/navigation` if slug doesn't exist

**SEO:**
- **`src/app/sitemap.ts`** — Next.js convention. Generates entries from `_meta.ts` trips + static pages (/, /travel, /about, /projects, /contact)
- **`src/app/robots.ts`** — Allow all crawlers, disallow `/api/`, `/login/`, `/family-tree/`
- Each page exports `generateMetadata()` — especially travel detail pages (title = trip name, OG image = cover)

**Loading states:**
- Add `src/app/loading.tsx` (global) + `src/app/travel/loading.tsx`, `src/app/projects/loading.tsx` — skeleton loaders with pulsing placeholder shapes
- `src/hooks/useReducedMotion.ts` — wraps `window.matchMedia('(prefers-reduced-motion: reduce)')`. When true: 3D scenes render a static gradient image instead, all Framer Motion animations disabled via `<MotionConfig reducedMotion="user">`
- Responsive breakpoints: test at 375px, 768px, 1024px, 1440px. Key adjustments: Nav → hamburger below `md`, timeline → single column below `md`, bento grid → 2 cols below `lg`
- `src/app/layout.tsx` metadata: title, description, openGraph image, twitter card
- Each page gets its own `generateMetadata()` for SEO — especially travel detail pages (title = trip name, description = excerpt, image = cover)
- `next.config.mjs`: configure `images.remotePatterns` if using external image sources

**Verify (run these commands):**
```bash
npm run build          # Zero errors
npm run lint           # Zero warnings
npx tsc --noEmit       # TypeScript strict clean
```
Then `npm run dev` and manually test: all 5 pages load, mobile nav works, theme toggle persists, 3D scenes render, travel detail pages are shareable URLs

---

## Phase 2 Implementation (later)

### Auth System

- **Supabase tables:** `profiles` (id, email, display_name, role: admin|family_member) + `invitations` (email, status: pending|accepted)
- **Invite flow:** Admin calls `POST /api/invite` → inserts invitation → sends magic link email → recipient signs up → DB trigger verifies invitation exists → creates profile
- **`middleware.ts`** — Protects `/family-tree/*` routes, redirects unauthenticated to `/login`
- **`src/app/login/page.tsx`** — Login/signup form
- **`src/lib/supabase/`** — `client.ts` (browser), `server.ts` (cookies), `middleware.ts` (session refresh)
- **RLS policies:** Authenticated users can read people/relationships; only admin can modify

### Family Tree

- **Supabase tables:** `people` (name, dates, photo_url, bio) + `relationships` (person_id, related_person_id, type: parent|child|spouse|sibling)
- **Photos:** Supabase Storage private bucket, signed URLs generated server-side
- **`src/components/family-tree/TreeCanvas.tsx`** — Uses `reactflow` for interactive pan/zoom tree
- **`src/components/family-tree/PersonNode.tsx`** — Custom node with photo thumbnail, name, birth year
- **Layout:** `dagre` library for automatic hierarchical positioning
- **Dependencies (Phase 2):** `@supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr reactflow dagre`

---

## Project Structure

```
swapnil.github.io/
├── public/
│   ├── fonts/
│   ├── images/travel/{trip-slug}/       # Trip photos
│   ├── images/profile/
│   ├── models/                          # .glb terrain, earth texture
│   ├── resume.pdf
│   └── favicon.ico
├── content/
│   ├── travel/                          # MDX trip files + _meta.ts
│   ├── projects.ts                      # Project data array
│   └── now.ts                           # "Currently" section data
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout
│   │   ├── page.tsx                     # Home (3D hero + Currently section)
│   │   ├── globals.css
│   │   ├── travel/
│   │   │   ├── page.tsx                 # Globe + timeline
│   │   │   └── [slug]/page.tsx          # Trip detail (MDX) — shareable URL
│   │   ├── projects/page.tsx            # Projects portfolio
│   │   ├── about/page.tsx               # Professional page
│   │   ├── contact/page.tsx             # Contact form
│   │   ├── login/page.tsx               # Phase 2
│   │   ├── family-tree/page.tsx         # Phase 2
│   │   └── api/
│   │       ├── contact/route.ts         # Contact form email handler
│   │       └── ...                      # Phase 2 (auth callback, invite)
│   ├── components/
│   │   ├── three/                       # All R3F components (client-only)
│   │   │   ├── FlyoverScene.tsx
│   │   │   ├── Terrain.tsx
│   │   │   ├── CameraRig.tsx
│   │   │   ├── Destinations.tsx
│   │   │   ├── Sky.tsx
│   │   │   ├── GlobeScene.tsx
│   │   │   ├── GlobePins.tsx
│   │   │   └── GlobeToTimeline.tsx
│   │   ├── ui/                          # AnimatedText, Button, Card, ScrollProgress, ThemeToggle
│   │   ├── layout/                      # Nav, Footer, PageTransition, ThemeToggle
│   │   ├── home/                        # CurrentlySection
│   │   ├── travel/                      # TripTimeline, TripCard, RouteMap, PhotoGallery
│   │   ├── projects/                    # ProjectCard
│   │   ├── about/                       # ExperienceTimeline, SkillsVisualization, InlineResume
│   │   └── family-tree/                 # Phase 2: TreeCanvas, PersonNode, TreeControls
│   ├── hooks/
│   │   ├── useScrollProgress.ts         # RAF-throttled normalized scroll [0,1]
│   │   └── useReducedMotion.ts
│   ├── lib/
│   │   ├── mdx.ts                       # gray-matter + next-mdx-remote helpers
│   │   ├── travel-data.ts               # Parse _meta.ts, load frontmatter
│   │   └── constants.ts                 # Colors, site metadata
│   └── types/
│       ├── travel.ts
│       └── family.ts                    # Phase 2
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
├── package.json
├── .env.local.example
├── .env.local                           # Gitignored
├── .gitignore
└── README.md
```

**Key pattern:** All R3F components live under `src/components/three/` and are imported via `next/dynamic` with `ssr: false`. This creates a clean client/server boundary.

---

## Verification

### Build Verification (automated — run after each step)
```bash
npm run build && npm run lint && npx tsc --noEmit
```

### Phase 1 Manual Checks

**Home page:**
- [ ] 3D terrain renders, camera moves on scroll
- [ ] Destination markers visible and clickable → navigate to correct pages
- [ ] Name/tagline animates in, fades on scroll
- [ ] "Currently" section renders below hero with data from `content/now.ts`
- [ ] `prefers-reduced-motion` → static fallback image instead of 3D

**Navigation:**
- [ ] All 5 nav links work (Home, Travel, Projects, About, Contact)
- [ ] Active route has animated underline
- [ ] Mobile (375px): hamburger menu opens/closes
- [ ] Dark/light toggle switches theme, persists on refresh

**Travel page:**
- [ ] Globe renders with pins at correct geographic positions
- [ ] Scroll transitions globe → timeline smoothly
- [ ] Trip cards link to `/travel/[slug]`
- [ ] Direct URL `/travel/japan-2024` loads full trip detail page with MDX content
- [ ] PhotoGallery lightbox opens/closes, keyboard nav works (Esc, arrows)
- [ ] Adding new `.mdx` + `_meta.ts` entry shows new trip without code changes

**Projects page:**
- [ ] All projects from `content/projects.ts` render
- [ ] Featured projects are larger (col-span-2)
- [ ] Cards tilt on hover, external links work

**About page:**
- [ ] Experience timeline entries animate in on scroll
- [ ] Skill cards tilt on hover
- [ ] Resume tabs switch with animation, PDF downloads

**Contact page:**
- [ ] Form validates required fields
- [ ] Submit → success message (or console log if Resend not configured)
- [ ] Honeypot field hidden, rejects bot submissions silently

**Responsive:** Test all pages at 375px, 768px, 1024px, 1440px

### Phase 2 Checks
- [ ] Unauthenticated visit to `/family-tree` → redirected to `/login`
- [ ] Non-invited email cannot sign up
- [ ] Admin invite → recipient signup → family tree access works
- [ ] Family tree data never in page source or JS bundles
- [ ] `.env.local` not committed, service role key only in server-side code
