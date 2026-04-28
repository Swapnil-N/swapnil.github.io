import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login — Swapnil Napuri',
  description: 'Sign in to access family content.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
