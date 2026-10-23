import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/json-ld';
import { FinalCta } from '@/components/sections/home-sections';
import { formatDate, getPost, posts, readingTime } from '@/lib/content/blog';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const meta = pageMetadata({ title: post.title, description: post.description, path: `/blog/${post.slug}`, type: 'article' });
  return { ...meta, openGraph: { ...meta.openGraph, type: 'article', publishedTime: post.date } };
}

export default async function BlogPost({ params }: Params) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <article className="relative">
        <header className="border-b border-line bg-canvas">
          <div className="container-page max-w-3xl pt-36 pb-14 sm:pt-44">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-900">
              <ArrowLeft aria-hidden="true" className="size-4" /> All articles
            </Link>
            <p className="mt-6 text-sm font-medium text-brand-700">{post.category}</p>
            <h1 className="mt-2 text-4xl leading-tight font-medium sm:text-5xl">{post.title}</h1>
            <p className="mt-5 text-lg text-body">{post.description}</p>
            <p className="mt-6 text-sm text-muted">
              <time dateTime={post.date}>{formatDate(post.date)}</time> · {readingTime(post)} min read
            </p>
          </div>
        </header>
        <div className="container-page max-w-3xl py-14">
          <div className="prose-page">
            {post.body.map((block, i) => {
              if (block.type === 'h2') return <h2 key={i}>{block.text}</h2>;
              if (block.type === 'ul')
                return (
                  <ul key={i}>
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                );
              return <p key={i}>{block.text}</p>;
            })}
          </div>
        </div>
      </article>

      <aside aria-labelledby="related-title" className="container-page max-w-3xl pb-16">
        <h2 id="related-title" className="mb-4 text-xl font-semibold">
          Keep reading
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {related.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="rounded-2xl border border-line bg-white p-5 transition hover:border-brand-200 hover:shadow-md">
              <p className="text-sm text-brand-700">{p.category}</p>
              <p className="mt-1 font-semibold text-ink">{p.title}</p>
            </Link>
          ))}
        </div>
      </aside>
      <FinalCta />

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.date,
          author: { '@type': 'Organization', name: site.name },
          publisher: { '@type': 'Organization', name: site.name, logo: { '@type': 'ImageObject', url: `${site.url}/icon.svg` } },
          mainEntityOfPage: `${site.url}/blog/${post.slug}`,
        }}
      />
    </>
  );
}
