# Demo: Fashion Designer Bio (`fashion-designer-bio`)

You are vibe-coding a client demo at `/demo/fashion-designer-bio`. Everything you write here
will eventually be cut and pasted into a fresh Next.js repo for graduation, so it
**must be self-contained**.

## Theming — full flexibility

This demo has **no preset theme**. The site is dark by default, but inside this
folder you have a full toolkit; pick whatever fits the brand:

- **Inline Tailwind colors** (most flexible): `bg-rose-50`, `text-stone-900`,
  `bg-gradient-to-br from-amber-100 to-rose-200`, etc. Mix freely.
- **Opt into the shared light palette**: wrap any subtree (or the whole demo)
  in `<div data-theme="light" className="bg-surface text-foreground min-h-screen">`.
  Inside, the existing tokens (`bg-surface`, `text-foreground`, `text-muted`,
  `text-primary`, `border-border`, etc.) cascade to light values. Defined
  in `src/app/globals.css` — don't add demo-specific overrides there.
- **Co-located CSS module**: e.g. `Hero.module.css` next to `Hero.tsx`
  for a custom palette scoped to one component.
- **Custom CSS vars on a wrapper**: `<div style={{ '--brand': '#c9a87c' }}>`
  for one-off accent colors used inside that subtree.

The **dashboard strip** (sticky top bar with Approve / Request Changes / Pay
buttons) stays site-themed (dark) regardless of what you do — it's chrome,
not part of the demo content.

## Scope — what you can edit

- ✅ Anything inside `src/app/demo/fashion-designer-bio/`
- ✅ Anything inside `public/demo/fashion-designer-bio/` (assets — referenced as `/demo/fashion-designer-bio/foo.png`)
- ❌ `src/app/globals.css` — never edit for a demo
- ❌ `src/lib/demo/gate.ts`, middleware, auth helpers
- ❌ Other demos (`src/app/demo/<other-slug>/`)
- ❌ Shared component folders (`src/components/admin/ui/`, `src/components/client/`, `src/components/ui/`) — read-only from here

## Imports

- Tailwind classes inline (preferred), or co-locate a `*.module.css`.
- `next/image`, `next/link`, anything from React or installed deps.
- READ-ONLY shared primitives: `@/components/admin/ui/{Button,Modal,Input,...}` and
  `@/components/client/*`. Use them as-is. If you need a new shared component for
  this demo, put it inside this folder (e.g. `src/app/demo/fashion-designer-bio/components/Hero.tsx`).

## Hard nos

- Don't import from another demo.
- Don't add files to `src/components/*`, `src/lib/*`, etc. for this demo's needs.
- Don't modify the layout's call to `gateDemo('fashion-designer-bio')` — auth depends on it.
- Don't use `next/font/google` — fonts load via `next/font/local` from `src/app/fonts/`.
- Don't use `Math.random()` in render or `useEffect(() => setState(...))` —
  React 19's lint will flag both. Generate at module scope or use `useSyncExternalStore`.
- Don't use `text-[var(--color-*)]` arbitrary value syntax — use the Tailwind tokens
  (`text-primary`, `bg-surface`, `text-muted`, `text-foreground`, etc.).

## Tech stack reminders

- **Next.js 16 App Router.** Has breaking changes from prior major versions —
  if unsure about a Next.js API, read the relevant guide in `node_modules/next/dist/docs/`.
- **Tailwind CSS v4.** No `tailwind.config.ts`. Color tokens are CSS-first.
- **React 19** strict lint rules.
- **TypeScript 5**, strict mode.

## Graduation

When the client pays, this folder gets copied into a fresh Next.js repo, the
`gateDemo()` wrapper is stripped from `layout.tsx` (or the layout is removed
entirely), and the demo gets its own custom domain via Vercel. Anything you wrote
that imports from outside this folder needs to be portable — keep imports
constrained to standard libs and the read-only shared primitives above.

## Useful commands (run from repo root)

```bash
npm run dev          # localhost:3000/demo/fashion-designer-bio
npm run lint
npx tsc --noEmit
npm run build
```
