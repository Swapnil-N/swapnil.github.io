import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = await createClient();

  // Check caller is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check caller is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  let email: string;
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  // Create invitation record
  const { error: inviteError } = await supabase
    .from('invitations')
    .insert({ email, invited_by: user.id });

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 400 });
  }

  // Send invite email via Supabase auth (magic link or invite)
  const { error: authError } = await supabase.auth.admin.inviteUserByEmail(email);

  if (authError) {
    return NextResponse.json({ ok: true, message: `Invitation recorded for ${email}. They can sign up at /login.` });
  }

  return NextResponse.json({ ok: true, message: `Invitation sent to ${email}` });
}
