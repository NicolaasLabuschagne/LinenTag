import type { MetadataRoute } from 'next';
import { posts } from '@/lib/content/blog';
import { site } from '@/lib/site';

const pages: [string, number][] = [
  ['/', 1],
  ['/how-it-works', 0.9],
  ['/features', 0.9],
  ['/nfc-tags', 0.9],
  ['/pricing', 0.7],
  ['/about', 0.6],
  ['/blog', 0.7],
  ['/contact', 0.5],
  ['/careers', 0.4],
  ['/labels', 0.5],
  ['/privacy', 0.2],
  ['/terms', 0.2],
  ['/cookies', 0.2],
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...pages.map(([path, priority]) => ({ url: `${site.url}${path}`, changeFrequency: 'monthly' as const, priority })),
    ...posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: post.date,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ];
}
