import 'server-only';
import { createClient as createSupabaseClient, type SupabaseClient, type User } from '@supabase/supabase-js';

export class MissingServiceRoleKeyError extends Error {
  constructor() {
    super('SUPABASE_SERVICE_ROLE_KEY is not set');
    this.name = 'MissingServiceRoleKeyError';
  }
}

export function createServiceRoleClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  if (!serviceRoleKey) {
    throw new MissingServiceRoleKeyError();
  }
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// auth.admin.listUsers caps at 1000 per page. The single-page callers we had
// before silently dropped users past page 1. This paginates to the end (or
// `maxPages` for safety on giant orgs — 10 pages = 10,000 users, plenty for
// our scale, and stops runaway loops if Supabase ever returns the same page
// over and over).
export async function listAllAuthUsers(
  admin: SupabaseClient,
  { perPage = 200, maxPages = 10 }: { perPage?: number; maxPages?: number } = {},
): Promise<User[]> {
  const all: User[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ perPage, page });
    if (error) throw error;
    const users = data?.users ?? [];
    all.push(...users);
    if (users.length < perPage) break;
  }
  return all;
}
