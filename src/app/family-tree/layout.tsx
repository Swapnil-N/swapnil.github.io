import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Family Tree — Swapnil Napuri',
  description: 'Interactive family tree.',
};

export default function FamilyTreeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
