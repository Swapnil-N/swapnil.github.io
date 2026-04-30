import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — Swapnil Napuri',
  description: 'Get in touch.',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
