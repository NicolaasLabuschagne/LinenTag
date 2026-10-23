import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** A phone frame. Screen contents are decorative mockups (aria-hidden); pass a label for screen readers. */
export function Phone({ children, label, className }: { children: ReactNode; label: string; className?: string }) {
  return (
    <figure
      role="img"
      aria-label={label}
      className={cn(
        'relative mx-auto w-[260px] rounded-[2.6rem] bg-ink p-2.5 shadow-[0_40px_80px_-30px_rgba(15,23,42,0.55)] ring-1 ring-white/10 sm:w-[280px]',
        className,
      )}
    >
      <div aria-hidden="true" className="relative overflow-hidden rounded-[2.1rem] bg-canvas">
        <div className="absolute top-2 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-ink" />
        <div className="flex h-[520px] flex-col px-4 pt-10 pb-4 sm:h-[560px]">{children}</div>
      </div>
    </figure>
  );
}

/** Concentric rings radiating from the point where phone meets fabric. */
export function NfcRipple({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute size-24', className)}>
      {[0, 0.8, 1.6].map((delay) => (
        <span
          key={delay}
          className="absolute inset-0 animate-ripple rounded-full border-2 border-brand-400"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
      <span className="absolute inset-[38%] rounded-full bg-accent-500 shadow-lg shadow-accent-500/30" />
    </div>
  );
}
