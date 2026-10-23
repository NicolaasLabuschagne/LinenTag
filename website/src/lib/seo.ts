import type { Metadata } from 'next';
import { site } from './site';

/** Per-page metadata: title, description, canonical URL, Open Graph and Twitter. */
export function pageMetadata({
  title,
  description,
  path,
  type = 'website',
}: {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type, title: `${title} | ${site.name}`, description, url: path, siteName: site.name },
    twitter: { card: 'summary_large_image', title: `${title} | ${site.name}`, description },
  };
}
