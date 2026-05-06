#!/usr/bin/env tsx
/**
 * Scaffold a new client demo folder.
 *
 * Usage:
 *   npm run new-demo -- --slug=acme-bakery --name="Acme Bakery"
 *
 * Creates:
 *   src/app/demo/{slug}/layout.tsx   — auth gate + dashboard strip
 *   src/app/demo/{slug}/page.tsx     — placeholder page
 *   src/app/demo/{slug}/CLAUDE.md    — per-demo guardrails for vibe-coding agents
 *   public/demo/{slug}/              — assets folder
 *
 * Does NOT touch the database. Create the clients row first via /admin/demos,
 * then run this to scaffold the code.
 */

import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

// Parse --key=value args
const argMap: Record<string, string> = {};
for (const arg of process.argv.slice(2)) {
  const m = arg.match(/^--([^=]+)=?(.*)/);
  if (m) argMap[m[1]] = m[2] ?? '';
}

const slug = argMap['slug']?.trim().toLowerCase();
const name = argMap['name']?.trim() || slug;

// Escape a string for safe embedding inside a template literal.
function escapeTpl(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

if (!slug) {
  console.error('Error: --slug is required');
  console.error('Usage: npm run new-demo -- --slug=acme-bakery --name="Acme Bakery"');
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error('Error: slug must be lowercase letters, numbers, and hyphens only');
  process.exit(1);
}

const root = process.cwd();
const demoDir = join(root, 'src', 'app', 'demo', slug);
const publicDir = join(root, 'public', 'demo', slug);

if (existsSync(demoDir)) {
  console.error(`Error: demo folder already exists: ${demoDir}`);
  process.exit(1);
}

const safeName = escapeTpl(name ?? slug ?? '');

const layoutContent = `import { gateDemo } from '@/lib/demo/gate';
import ClientDashboardStrip from '@/components/client/ClientDashboardStrip';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { client, isAdmin } = await gateDemo('${slug}');
  return (
    <>
      <ClientDashboardStrip client={client} isAdmin={isAdmin} />
      {children}
    </>
  );
}
`;

const pageContent = `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${safeName} — Demo',
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">${safeName}</h1>
      <p className="text-muted text-lg">Your website preview is being prepared. Check back soon.</p>
    </main>
  );
}
`;

const claudeMdContent = `# Demo: ${safeName} (\`${slug}\`)

You are vibe-coding a client demo at \`/demo/${slug}\`. Everything you write here
will eventually be cut and pasted into a fresh Next.js repo for graduation, so it
**must be self-contained**.

## Theming — full flexibility

This demo has **no preset theme**. The site is dark by default, but inside this
folder you have a full toolkit; pick whatever fits the brand:

- **Inline Tailwind colors** (most flexible): \`bg-rose-50\`, \`text-stone-900\`,
  \`bg-gradient-to-br from-amber-100 to-rose-200\`, etc. Mix freely.
- **Opt into the shared light palette**: wrap any subtree (or the whole demo)
  in \`<div data-theme="light" className="bg-surface text-foreground min-h-screen">\`.
  Inside, the existing tokens (\`bg-surface\`, \`text-foreground\`, \`text-muted\`,
  \`text-primary\`, \`border-border\`, etc.) cascade to light values. Defined
  in \`src/app/globals.css\` — don't add demo-specific overrides there.
- **Co-located CSS module**: e.g. \`Hero.module.css\` next to \`Hero.tsx\`
  for a custom palette scoped to one component.
- **Custom CSS vars on a wrapper**: \`<div style={{ '--brand': '#c9a87c' }}>\`
  for one-off accent colors used inside that subtree.

The **dashboard strip** (sticky top bar with Approve / Request Changes / Pay
buttons) stays site-themed (dark) regardless of what you do — it's chrome,
not part of the demo content.

## Scope — what you can edit

- ✅ Anything inside \`src/app/demo/${slug}/\`
- ✅ Anything inside \`public/demo/${slug}/\` (assets — referenced as \`/demo/${slug}/foo.png\`)
- ❌ \`src/app/globals.css\` — never edit for a demo
- ❌ \`src/lib/demo/gate.ts\`, middleware, auth helpers
- ❌ Other demos (\`src/app/demo/<other-slug>/\`)
- ❌ Shared component folders (\`src/components/admin/ui/\`, \`src/components/client/\`, \`src/components/ui/\`) — read-only from here

## Imports

- Tailwind classes inline (preferred), or co-locate a \`*.module.css\`.
- \`next/image\`, \`next/link\`, anything from React or installed deps.
- READ-ONLY shared primitives: \`@/components/admin/ui/{Button,Modal,Input,...}\` and
  \`@/components/client/*\`. Use them as-is. If you need a new shared component for
  this demo, put it inside this folder (e.g. \`src/app/demo/${slug}/components/Hero.tsx\`).

## Hard nos

- Don't import from another demo.
- Don't add files to \`src/components/*\`, \`src/lib/*\`, etc. for this demo's needs.
- Don't modify the layout's call to \`gateDemo('${slug}')\` — auth depends on it.
- Don't use \`next/font/google\` — fonts load via \`next/font/local\` from \`src/app/fonts/\`.
- Don't use \`Math.random()\` in render or \`useEffect(() => setState(...))\` —
  React 19's lint will flag both. Generate at module scope or use \`useSyncExternalStore\`.
- Don't use \`text-[var(--color-*)]\` arbitrary value syntax — use the Tailwind tokens
  (\`text-primary\`, \`bg-surface\`, \`text-muted\`, \`text-foreground\`, etc.).

## Tech stack reminders

- **Next.js 16 App Router.** Has breaking changes from prior major versions —
  if unsure about a Next.js API, read the relevant guide in \`node_modules/next/dist/docs/\`.
- **Tailwind CSS v4.** No \`tailwind.config.ts\`. Color tokens are CSS-first.
- **React 19** strict lint rules.
- **TypeScript 5**, strict mode.

## Graduation

When the client pays, this folder gets copied into a fresh Next.js repo, the
\`gateDemo()\` wrapper is stripped from \`layout.tsx\` (or the layout is removed
entirely), and the demo gets its own custom domain via Vercel. Anything you wrote
that imports from outside this folder needs to be portable — keep imports
constrained to standard libs and the read-only shared primitives above.

## Useful commands (run from repo root)

\`\`\`bash
npm run dev          # localhost:3000/demo/${slug}
npm run lint
npx tsc --noEmit
npm run build
\`\`\`
`;

mkdirSync(demoDir, { recursive: true });
mkdirSync(publicDir, { recursive: true });

writeFileSync(join(demoDir, 'layout.tsx'), layoutContent);
writeFileSync(join(demoDir, 'page.tsx'), pageContent);
writeFileSync(join(demoDir, 'CLAUDE.md'), claudeMdContent);
writeFileSync(join(publicDir, '.gitkeep'), '');

console.log(`
Demo scaffolded: ${slug}

  src/app/demo/${slug}/layout.tsx
  src/app/demo/${slug}/page.tsx
  src/app/demo/${slug}/CLAUDE.md   ← guardrails for vibe-coding agents
  public/demo/${slug}/

Next steps:
  1. cd into src/app/demo/${slug}/ and start vibe-coding the demo (Claude
     auto-loads CLAUDE.md from this folder when working there).
  2. Invite the client: /admin/invitations → role=Client, demo=${slug}
  3. Set a payment link when ready: /admin/demos → "$ Link"
`);
