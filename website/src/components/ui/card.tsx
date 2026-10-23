import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]',
        className,
      )}
      {...props}
    />
  );
}

/** A card that lifts slightly on hover; for grids of features, audiences, posts. */
export function HoverCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn(
        'transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_20px_40px_-24px_rgba(31,41,55,0.18)]',
        className,
      )}
      {...props}
    />
  );
}

export function IconBadge({ children, tone = 'brand' }: { children: React.ReactNode; tone?: 'brand' | 'accent' }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'mb-4 inline-flex size-11 items-center justify-center rounded-xl [&_svg]:size-5',
        tone === 'brand'
          ? 'bg-brand-100 text-brand-700'
          : 'bg-accent-50 text-accent-700',
      )}
    >
      {children}
    </div>
  );
}
