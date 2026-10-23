import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from './motion';

export function Section({
  id,
  className,
  children,
  labelledBy,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
  labelledBy?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn('scroll-mt-24 py-20 sm:py-28', className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  align = 'center',
  as: Tag = 'h2',
}: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: 'center' | 'left';
  as?: 'h1' | 'h2';
}) {
  return (
    <Reveal className={cn('mb-14 max-w-3xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <Tag id={id} className={cn('font-medium', Tag === 'h1' ? 'text-4xl sm:text-6xl' : 'text-3xl sm:text-5xl')}>
        {title}
      </Tag>
      {intro && <p className="mt-5 text-lg leading-relaxed text-body sm:text-xl">{intro}</p>}
    </Reveal>
  );
}

/** Top-of-page hero for inner pages. */
export function PageHeader({ eyebrow, title, intro }: { eyebrow?: string; title: ReactNode; intro?: ReactNode }) {
  return (
    <div className="relative overflow-hidden border-b border-line bg-canvas">
      <div className="container-page relative pt-36 pb-16 sm:pt-44 sm:pb-20">
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} intro={intro} />
      </div>
    </div>
  );
}
