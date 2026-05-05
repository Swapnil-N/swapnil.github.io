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
- **Dark mode is the site default**: Site pages are dark only. Client demos have full theming flexibility — use any inline Tailwind colors, opt into the shared light palette via `<div data-theme="light">` (defined in `globals.css`, makes the existing tokens cascade to light values), co-locate a CSS module, or set custom CSS vars on a wrapper. The dashboard strip stays site-themed regardless.
- **3D components**: All React Three Fiber components live in `src/components/three/` and MUST be dynamically imported with `ssr: false`.
- **Content**: Public content lives in the `content/` directory (travel MDX files, `projects.ts`, `now.ts`, `resume.ts`). Use the `@content/*` import alias.
- **React 19 strict lint rules**: No `Math.random()` in `useMemo` or during render. No `setState` in `useEffect`. No refs during render. Use deterministic alternatives or module-scope generation.
- **Travel trips**: Add an MDX file to `content/travel/` AND update `content/travel/_meta.ts` (the source of truth for globe pins and ordering).
- **Contact page**: Custom styled form that submits to Google Forms via hidden iframe (no backend API route).
- **Auth**: Supabase Auth with invite-only model. Middleware protects `/family-tree`. Login at `/login`. Self-signup is enforced invite-only at the DB layer: the `handle_new_user()` trigger rejects emails that aren't in the `invitations` table.
- **Family tree**: Data stored in Supabase (NOT in repo — repo is public). ReactFlow + dagre for visualization. Only accessible to authenticated users.

## Project Structure

```
content/           — Content data (travel MDX, projects, resume, now)
public/            — Static assets (images, models, fonts, favicon)
  demo/{slug}/     — Per-demo assets (images, etc.)
scripts/           — CLI scripts (new-demo.ts scaffold)
src/app/           — Pages (Next.js App Router)
  admin/demos/     — Admin demo management pages
  demo/{slug}/     — Per-client demo pages (each independently vibe-coded)
src/components/    — React components by feature
  client/          — Demo hosting: ClientDashboardStrip, RequestChangesModal
  admin/ui/        — Admin UI primitives (Button, Modal, Table, etc.)
src/lib/
  demo/gate.ts     — gateDemo() server-only helper
  auth/            — Permission helpers, audit logging
  supabase/        — Client, server, middleware, admin factories
src/types/         — TypeScript types (family.ts, admin.ts, client.ts)
middleware.ts      — Next.js middleware (Supabase session refresh, route protection)
supabase-schema.sql — Database schema (run in Supabase SQL editor for fresh projects)
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
- **Invite-only enforcement**: `handle_new_user()` trigger raises if the signup email isn't in `invitations`. Login page detects the trigger error message and shows "This site is invite-only. Ask an admin to send you an invite."
- **Two email-link routes**: `/auth/callback` handles the legacy `?code=...` PKCE redirect. `/auth/confirm` handles the modern `?token_hash=...&type=...` flow if the Supabase email template is customized to use `{{ .TokenHash }}`. Both work; pick whichever the template emits.
- **Auth state**: `AuthProvider` (`src/components/auth/AuthProvider.tsx`) holds `{ user, profile, role }` from a server-fetched join. Subscribes to `onAuthStateChange` and calls `router.refresh()` on auth events. Use `useAuth()` in client components.
- **Server helpers**: `getCurrentUserWithRole()`, `requirePermission()`, `requireAnyPermission()` in `src/lib/auth/permissions.ts`. Pure permission check shared with client code in `permissions.client.ts`.
- **Service-role client**: `src/lib/supabase/admin.ts` — `createServiceRoleClient()` is server-only (`import 'server-only'`), per-request, throws `MissingServiceRoleKeyError` if env var missing. Used for `deleteUser`, `inviteUserByEmail`, `listUsers`.
- **UI primitives**: `src/components/admin/ui/` — `Button`, `Input`, `Textarea`, `Select`, `Toggle`, `Table`, `Modal`, `ConfirmDialog`, `Badge`, `EmptyState`. Modals use fixed-position overlays (no portal). All admin/account pages use these — `/login` was intentionally left untouched in Phase 3 to avoid regressing working auth.

## Phase 4 (Built): Client demo hosting

- **Goal**: Host prospect demo sites at `/demo/{slug}` behind per-client auth, with a dashboard strip for Approve / Request Changes / Pay actions.
- **Auth model**: A third system role `client` (all permissions false) is assigned when a client signs up via invitation. Clients can't access `/family-tree` (no `view_family_tree`) or `/admin`. Ownership is row-level (`clients.owner_user_id = auth.uid()`).
- **Demo gate**: `src/lib/demo/gate.ts:gateDemo(slug)` — server-only helper called from each demo's `layout.tsx`. Checks auth, `disabled`, ownership (or admin bypass via `can_manage_users`), updates `last_seen_at`. Returns `{ client, isAdmin }`.
- **Dashboard strip**: `src/components/client/ClientDashboardStrip.tsx` — `sticky top-16` client component (sits below the fixed site nav). Shows business name, status badges, and action buttons (Approve, Request Changes, Pay). `RequestChangesModal.tsx` for the feedback form.
- **Client actions**: `src/app/demo/actions.ts:recordClientAction(...)` — server action, inserts into `client_actions` table and logs to `audit_log`.
- **Admin demos dashboard**: `/admin/demos` — list, create, archive, mark paid, set Stripe payment link. Server actions in `src/app/admin/demos/actions.ts`. "Demos" added to `AdminSidebar`.
- **Invite flow extended**: `sendInvitation` now accepts `{ email, role?, client_slug? }`. When `role='client'`, the DB trigger assigns the `client` role and binds `clients.owner_user_id` on signup.
- **Scaffold script**: `npm run new-demo -- --slug=acme --name="Acme Bakery"` creates `src/app/demo/{slug}/{layout.tsx, page.tsx, CLAUDE.md}` and `public/demo/{slug}/`. The per-demo `CLAUDE.md` is the source of truth for vibe-coding agents working in that folder (Claude Code auto-loads it) and documents the available theming options. Does NOT touch the DB — create the row via `/admin/demos` first.
- **Middleware**: `/demo/:path*` added to the matcher and `protectedPaths`. Auth + disabled check apply as for all protected routes.
- **Isolation rules**: Each demo lives entirely in `src/app/demo/{slug}/` + `public/demo/{slug}/`. May import `src/components/client/*` and `src/components/admin/ui/*`. Must NOT import from another demo or add to shared component folders for demo-specific needs.
- **Graduation workflow (manual)**: Copy `src/app/demo/{slug}/` and `public/demo/{slug}/` to a new repo, strip the `gateDemo()` layout wrapper, create a new Vercel project, attach the custom domain, then `markPaid(id)`.
- **New types**: `src/types/client.ts` — `Client`, `ClientAction`. `Invitation` in `src/types/family.ts` gained `role_id` and `client_slug` fields.
- **New DB tables**: `clients` (slug, business_name, owner_user_id, status, payment_link_url, last_seen_at) and `client_actions` (client_id, action, message). Both have RLS enabled.

## TODOs

- Add travel photos to `public/images/travel/{slug}/`
- Personalize placeholder trip descriptions in MDX files
- Add first client demo under `src/app/demo/{slug}/` when ready

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
- `src/lib/demo/gate.ts` has `import 'server-only'`. Never import `DemoGateResult` into client components — define the props inline.
- Each demo's `layout.tsx` MUST include `export const dynamic = 'force-dynamic'` since it queries the DB on every request.
- Demos MUST NOT import from each other — each folder is fully self-contained so it can be cleanly cut into a graduation repo.
- Do NOT edit `src/app/globals.css` for a demo. Use Tailwind classes inline or a co-located `*.module.css`. (The shared `[data-theme="light"]` block in `globals.css` is the one exception — it's the site-level light palette that any demo can opt into; don't add demo-specific overrides there.)
- Per-demo `src/app/demo/{slug}/CLAUDE.md` files are auto-generated by the scaffolder and are the canonical guardrails for vibe-coding agents working in that folder. When working inside a demo folder, follow the per-demo CLAUDE.md over this root file where they conflict.
