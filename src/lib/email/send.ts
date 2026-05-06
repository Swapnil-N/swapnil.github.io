import 'server-only';
import { Resend } from 'resend';

// Resend integration with a console-log fallback.
//
// In production, set RESEND_API_KEY (and optionally INVITE_FROM_EMAIL with a
// verified-domain sender like `invites@swapnil.dev`). Without RESEND_API_KEY,
// the email body and recipient print to the server console so the dev can
// copy-paste the link to test the flow without setting up Resend yet.
//
// Free Resend tier: 3,000 emails/month, 100/day. More than enough for our scale.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.INVITE_FROM_EMAIL || 'onboarding@resend.dev';

let cachedClient: Resend | null = null;
function getClient(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (!cachedClient) cachedClient = new Resend(RESEND_API_KEY);
  return cachedClient;
}

export interface SendResult {
  ok: boolean;
  error?: string;
  // True when no provider was configured and the email was logged instead.
  loggedOnly?: boolean;
}

interface SendOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({ to, subject, html, text }: SendOptions): Promise<SendResult> {
  const client = getClient();
  if (!client) {
    // Dev fallback: log to console so the URL is reachable without Resend setup.
    console.log('\n--- EMAIL (RESEND_API_KEY not configured — logging only) ---');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${text}`);
    console.log('--- end email ---\n');
    return { ok: true, loggedOnly: true };
  }

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
    text,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
