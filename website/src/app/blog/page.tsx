import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { RevealGroup, RevealItem } from '@/components/motion';
import { PageHeader, Section } from '@/components/section';
import { HoverCard } from '@/components/ui/card';
import { formatDate, posts, readingTime } from '@/lib/content/blog';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Blog',
  description: 'Ideas and guides on linen organization, smart bedding, NFC technology, and linen management for hotels and Airbnb hosts.',
  path: '/blog',
});

export default function BlogIndex() {
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PageHeader eyebrow="Blog" title="Notes on smarter linen" intro="Guides and ideas for organized homes, smoother turnovers and better-run linen rooms." />
      <Section labelledBy="posts-title">
        <h2 id="posts-title" className="sr-only">
          All articles
        </h2>
        <RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((post) => (
            <RevealItem key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block h-full rounded-[var(--radius-card)]">
                <HoverCard className="flex h-full flex-col">
                  <div aria-hidden="true" className="mb-5 h-36 rounded-xl bg-brand-100" />
                  <p className="text-sm font-medium text-brand-700">{post.category}</p>
                  <h3 className="mt-2 text-xl font-semibold group-hover:text-brand-700">{post.title}</h3>
                  <p className="mt-3 flex-1 text-body">{post.description}</p>
                  <p className="mt-5 flex items-center justify-between text-sm text-muted">
                    <span>
                      <time dateTime={post.date}>{formatDate(post.date)}</time> · {readingTime(post)} min read
                    </span>
                    <ArrowRight aria-hidden="true" className="size-4 transition group-hover:translate-x-1 group-hover:text-brand-700" />
                  </p>
                </HoverCard>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
    </>
  );
}
