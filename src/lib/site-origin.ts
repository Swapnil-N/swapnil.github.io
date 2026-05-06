import 'server-only';
import { headers } from 'next/headers';

// Build the site's absolute origin (e.g. "https://swapnil.dev") from the
// current request's headers. Used to construct redirectTo URLs for Supabase
// auth flows. Defaults to https for production-like requests; falls through
// to http when there's no x-forwarded-proto and the host is empty (test/dev
// edge case).
export async function siteOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const host = h.get('host') ?? '';
  return `${proto}://${host}`;
}
