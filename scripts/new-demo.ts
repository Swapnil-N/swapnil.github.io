#!/usr/bin/env tsx
/**
 * Scaffold a new client demo folder.
 *
 * Usage:
 *   npm run new-demo -- --slug=acme-bakery --name="Acme Bakery"
 *
 * Creates:
 *   src/app/demo/{slug}/layout.tsx  — auth gate + dashboard strip
 *   src/app/demo/{slug}/page.tsx    — placeholder page
 *   public/demo/{slug}/             — assets folder
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
  title: '${name} — Demo',
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">${name}</h1>
      <p className="text-muted text-lg">Your website preview is being prepared. Check back soon.</p>
    </main>
  );
}
`;

mkdirSync(demoDir, { recursive: true });
mkdirSync(publicDir, { recursive: true });

writeFileSync(join(demoDir, 'layout.tsx'), layoutContent);
writeFileSync(join(demoDir, 'page.tsx'), pageContent);
writeFileSync(join(publicDir, '.gitkeep'), '');

console.log(`
Demo scaffolded: ${slug}

  src/app/demo/${slug}/layout.tsx
  src/app/demo/${slug}/page.tsx
  public/demo/${slug}/

Next steps:
  1. Build the demo in src/app/demo/${slug}/page.tsx
  2. Invite the client: /admin/invitations → role=Client, demo=${slug}
  3. Set a payment link when ready: /admin/demos → "$ Link"
`);
