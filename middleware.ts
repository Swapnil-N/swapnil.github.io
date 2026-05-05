import { updateSession } from '@/lib/supabase/middleware';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ['/family-tree/:path*', '/admin/:path*', '/account/:path*', '/demo/:path*', '/login'],
};
