import type { Metadata } from 'next';
import PageTransition from '@/components/layout/PageTransition';

export const metadata: Metadata = {
  title: 'Contact — Swapnil Napuri',
  description: 'Get in touch.',
};

// TODO: Replace this URL with your actual Google Form embed URL.
// To get it: Google Forms → Send → Embed icon (<>) → copy the src URL
const GOOGLE_FORM_EMBED_URL =
  'https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true';

export default function ContactPage() {
  return (
    <PageTransition>
      <div className="min-h-screen max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-heading font-bold mb-3 text-foreground">
          Get in Touch
        </h1>
        <p className="text-muted mb-10">
          Have a question or want to work together? Drop me a message.
        </p>

        <div className="rounded-2xl border border-border overflow-hidden bg-white">
          <iframe
            src={GOOGLE_FORM_EMBED_URL}
            width="100%"
            height="800"
            className="border-0 w-full"
            title="Contact form"
            loading="lazy"
          >
            Loading…
          </iframe>
        </div>
      </div>
    </PageTransition>
  );
}
