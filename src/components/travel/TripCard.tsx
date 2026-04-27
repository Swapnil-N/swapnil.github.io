'use client';

import Link from 'next/link';

interface TripCardProps {
  slug: string;
  title: string;
  startDate: string;
  excerpt: string;
}

export default function TripCard({
  slug,
  title,
  startDate,
  excerpt,
}: TripCardProps) {
  return (
    <Link href={`/travel/${slug}`}>
      <div className="rounded-2xl overflow-hidden bg-surface border border-border hover:border-primary/50 transition-all duration-300">
        <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <span className="text-muted text-sm">
            {title}
          </span>
        </div>
        <div className="p-6">
          <h3 className="font-heading text-xl font-bold mb-1 text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted mb-3">{startDate}</p>
          <p className="text-muted text-sm leading-relaxed">
            {excerpt}
          </p>
        </div>
      </div>
    </Link>
  );
}
