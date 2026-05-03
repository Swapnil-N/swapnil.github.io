import { notFound } from 'next/navigation';
import { getTripBySlug, getAllTripSlugs } from '@/lib/mdx';
import { compileMDX } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import type { Metadata } from 'next';

import PhotoGallery from '@/components/travel/PhotoGallery';

const mdxComponents = {
  PhotoGallery,
};

export async function generateStaticParams() {
  return getAllTripSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { frontmatter } = getTripBySlug(slug);
    return {
      title: `${frontmatter.title} — Swapnil Napuri`,
      description: (frontmatter.excerpt as string) || '',
    };
  } catch {
    return { title: 'Trip Not Found' };
  }
}

export default async function TripPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let trip;
  try {
    trip = getTripBySlug(slug);
  } catch {
    notFound();
  }

  const { content: mdxContent } = await compileMDX({
    source: trip.content,
    components: mdxComponents,
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/travel"
        className="text-primary hover:underline mb-6 inline-block"
      >
        &larr; Back to travels
      </Link>
      <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
        {trip.frontmatter.title as string}
      </h1>
      <p className="text-muted mb-2">
        {trip.frontmatter.startDate as string} &mdash;{' '}
        {trip.frontmatter.endDate as string}
      </p>
      <div className="flex gap-2 mb-8">
        {((trip.frontmatter.tags as string[]) || []).map((tag: string) => (
          <span
            key={tag}
            className="rounded-full bg-primary/10 text-primary text-xs px-3 py-1"
          >
            {tag}
          </span>
        ))}
      </div>
      <article
        className="prose prose-invert prose-lg max-w-none
        prose-headings:font-heading prose-headings:text-foreground
        prose-p:text-muted
        prose-a:text-primary"
      >
        {mdxContent}
      </article>
    </div>
  );
}
