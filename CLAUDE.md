@AGENTS.md

## Project Overview

Personal website for **Swapnil Napuri** (NOT Nandeshwar).
Tagline: "Experience Maxer · Adventurer"
Hosted on Vercel, repo on GitHub at `Swapnil-N/swapnil.github.io`.
Currently on `main` branch.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** (uses `@theme inline`, NOT v3 config patterns)
- **React Three Fiber** + `@react-three/drei` (for particle field hero and travel globe)
- **Framer Motion** (animations)
- **MDX** via `gray-matter` + `next-mdx-remote/rsc` (travel trip content)
- **Self-hosted fonts** via `next/font/local` (Space Grotesk for headings, DM Sans for body)
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`) for auth and family tree data
- **ReactFlow** + `dagre` (family tree visualization)
- **React 19**, **TypeScript 5**

## Key Architecture Decisions

- **Tailwind v4**: No `tailwind.config.ts`. Colors are defined as CSS variables in `:root` of `globals.css`, then mapped to Tailwind tokens via the `@theme inline` block. Use `text-primary`, `bg-surface`, `text-foreground`, `text-muted`, etc. NEVER use `text-[var(--color-*)]` arbitrary value syntax.
- **Dark mode only**: No light mode. No `next-themes`. No `data-theme` attribute. The site is always dark.
- **3D components**: All React Three Fiber components live in `src/components/three/` and MUST be dynamically imported with `ssr: false`.
- **Content**: Public content lives in the `content/` directory (travel MDX files, `projects.ts`, `now.ts`, `resume.ts`). Use the `@content/*` import alias.
- **React 19 strict lint rules**: No `Math.random()` in `useMemo` or during render. No `setState` in `useEffect`. No refs during render. Use deterministic alternatives or module-scope generation.
- **Travel trips**: Add an MDX file to `content/travel/` AND update `content/travel/_meta.ts` (the source of truth for globe pins and ordering).
- **Contact page**: Custom styled form that submits to Google Forms via hidden iframe (no backend API route).
- **Auth**: Supabase Auth with invite-only model. Middleware protects `/family-tree`. Login at `/login`.
- **Family tree**: Data stored in Supabase (NOT in repo — repo is public). ReactFlow + dagre for visualization. Only accessible to authenticated users.

## Project Structure

```
content/           — Content data (travel MDX, projects, resume, now)
public/            — Static assets (images, models, fonts, favicon)
src/app/           — Pages (Next.js App Router)
src/components/    — React components by feature (three/, layout/, ui/, home/, travel/, about/, projects/, family-tree/)
src/lib/           — Utilities (mdx.ts, supabase/)
src/types/         — TypeScript types (family.ts)
middleware.ts      — Next.js middleware (Supabase session refresh, route protection)
supabase-schema.sql — Database schema (run in Supabase SQL editor)
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

## Phase 2 (Built)

- **Auth**: Supabase Auth with invite-only model. Routes: `/login`, `/auth/callback`.
- **Family tree**: `/family-tree` — ReactFlow visualization with dagre layout, custom person nodes, detail panel. Data in Supabase `people` + `relationships` tables.
- **Middleware**: `middleware.ts` protects `/family-tree/*`, `/admin/*`, and `/account/*`. Redirects unauthenticated users to `/login` and disabled users to `/login?error=disabled`.
- **SQL schema**: `supabase-schema.sql` — run in Supabase SQL editor for fresh setups; existing projects use `apply_migration` via the Supabase MCP server.
- **To activate**: Create a Supabase project, set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`, run the SQL schema.

## Phase 3 (Built): Admin dashboard + auth-aware nav

- **Granular permissions**: `roles` table replaces the hardcoded `role` text column on `profiles`. Each role has 6 boolean permission columns (`can_manage_users`, `can_manage_roles`, `can_invite`, `can_edit_family_tree`, `can_view_family_tree`, `can_view_audit_log`). Two seeded `is_system` roles: `admin` (all perms) and `family_member` (view only).
- **Permission helper**: `public.has_permission(perm text)` — RLS policies and server actions check permissions through this. Folds in the `profiles.disabled` flag (disabled users always return false).
- **Soft + hard user removal**: `profiles.disabled` flag for reversible disable; `auth.admin.deleteUser()` (service-role) for permanent.
- **Audit log**: `audit_log` table records every admin mutation (`actor_id` set null on user delete so history survives). Server actions write via `logAudit()`.
- **Triggers**: `guard_profile_self_update` (no self role_id or self disabled change — reassignment requires another admin), `prevent_system_role_mutation` (no rename/delete/is_system toggle on system roles), `prevent_self_lockout` (admin can't drop `can_manage_roles` from their own role).
- **Routes**: `/admin` (stats), `/admin/users`, `/admin/roles`, `/admin/invitations`, `/admin/audit`, `/account`. Family-tree CRUD lives on `/family-tree` itself (gated by `can_edit_family_tree`) — server actions are in `src/app/family-tree/actions.ts` and the editor UI is in `src/app/family-tree/ManagePanel.tsx`.
- **Password flows**: `/account` → inline change-password (no email roundtrip — relies on the existing session). `/login` → "Forgot password?" → `/forgot-password` (email input → `resetPasswordForEmail`) → email link routes through `/auth/callback?next=/reset-password` → `/reset-password` (signed-in, sets new password via `updateUser`). Admins can also trigger a reset email for any user via `sendPasswordReset` on `/admin/users` — same destination, no service-role needed.
- **Auth state**: `AuthProvider` (`src/components/auth/AuthProvider.tsx`) holds `{ user, profile, role }` from a server-fetched join. Subscribes to `onAuthStateChange` and calls `router.refresh()` on auth events. Use `useAuth()` in client components.
- **Server helpers**: `getCurrentUserWithRole()`, `requirePermission()`, `requireAnyPermission()` in `src/lib/auth/permissions.ts`. Pure permission check shared with client code in `permissions.client.ts`.
- **Service-role client**: `src/lib/supabase/admin.ts` — `createServiceRoleClient()` is server-only (`import 'server-only'`), per-request, throws `MissingServiceRoleKeyError` if env var missing. Used for `deleteUser`, `inviteUserByEmail`, `listUsers`.
- **UI primitives**: `src/components/admin/ui/` — `Button`, `Input`, `Textarea`, `Select`, `Toggle`, `Table`, `Modal`, `ConfirmDialog`, `Badge`, `EmptyState`. Modals use fixed-position overlays (no portal). All admin/account pages use these — `/login` was intentionally left untouched in Phase 3 to avoid regressing working auth.

## TODOs

- Add travel photos to `public/images/travel/{slug}/`
- Personalize placeholder trip descriptions in MDX files

## Common Pitfalls

- Do NOT use `tailwind.config.ts` — Tailwind v4 uses CSS-first config.
- Do NOT use `text-[var(--color-*)]` — use the Tailwind token names (`text-primary`, `text-muted`, etc.).
- Do NOT use `next/font/google` — fonts fail to fetch during offline builds. Use `next/font/local` with the woff2 files in `src/app/fonts/`.
- Do NOT use `Math.random()` inside React components — React 19 lint flags it as impure. Generate at module scope.
- Do NOT use `useEffect(() => setState(...))` — React 19 lint flags it. Use `useSyncExternalStore` or handle in event callbacks.
- Google Form embed has a `bg-white` wrapper — this is intentional for the iframe.
- Do NOT import `src/lib/supabase/admin.ts` (the service-role client) from client components — it has `import 'server-only'` at the top and will fail the build.
- Do NOT delete or rename system roles (`admin`, `family_member`) — guarded by trigger.
- `profiles.role` text column NO LONGER exists. Use `profiles.role_id` joined to `roles`. The `getCurrentUserWithRole()` helper returns the joined shape.
- After an admin changes user X's role, X's in-memory `role` context stays stale until they refresh. RLS reads from the DB so data access is correct, but UI affordances may lag for that session.
