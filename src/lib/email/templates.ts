import 'server-only';

// Plain-text + minimal-HTML email templates. Kept inline (no template library)
// since we only have two emails. If we add more, extract to a shared layout.

interface InvitationParams {
  acceptUrl: string;
  businessName?: string;
  isClient: boolean;
}

export function invitationEmail({ acceptUrl, businessName, isClient }: InvitationParams) {
  const subject = isClient && businessName
    ? `You're invited to view the ${businessName} demo`
    : 'You\'re invited to swapnil.dev';

  const intro = isClient && businessName
    ? `You've been invited to view the ${businessName} demo site.`
    : "You've been invited to join the family-tree section of swapnil.dev.";

  const text = `${intro}

Click the link below to set up your account (sets your password and signs you in):
${acceptUrl}

This link expires in 7 days. If you weren't expecting this email, you can ignore it.`;

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #1a1a2e;">
  <h1 style="font-size: 24px; margin: 0 0 16px;">You're invited</h1>
  <p style="font-size: 16px; line-height: 1.5;">${intro}</p>
  <p style="margin: 32px 0;">
    <a href="${acceptUrl}" style="display: inline-block; padding: 12px 24px; background: #ff5a5f; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
      Set up your account
    </a>
  </p>
  <p style="font-size: 14px; color: #666; line-height: 1.5;">
    This link expires in 7 days. If you weren't expecting this email, you can ignore it.<br>
    Or paste this URL into your browser: <span style="word-break: break-all;">${acceptUrl}</span>
  </p>
</body>
</html>`;

  return { subject, html, text };
}

interface AccessGrantedParams {
  demoUrl: string;
  businessName: string;
}

export function accessGrantedEmail({ demoUrl, businessName }: AccessGrantedParams) {
  const subject = `You now have access to the ${businessName} demo`;
  const text = `You've been given access to the ${businessName} demo site.

Sign in (or stay signed in) and visit:
${demoUrl}`;

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #1a1a2e;">
  <h1 style="font-size: 24px; margin: 0 0 16px;">Access granted</h1>
  <p style="font-size: 16px; line-height: 1.5;">You've been given access to the <strong>${businessName}</strong> demo.</p>
  <p style="margin: 32px 0;">
    <a href="${demoUrl}" style="display: inline-block; padding: 12px 24px; background: #ff5a5f; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
      View demo
    </a>
  </p>
  <p style="font-size: 14px; color: #666;">
    You'll need to sign in if you aren't already.
  </p>
</body>
</html>`;

  return { subject, html, text };
}
