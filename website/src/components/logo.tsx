import { cn } from '@/lib/utils';

/** Folded-sheet mark with an NFC wave: sage tile, linen-white folds, gold wave. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn('size-8', className)}>
      <rect width="32" height="32" rx="9" fill="#556B5D" />
      <rect x="7" y="9" width="14" height="4" rx="2" fill="#FAF8F5" />
      <rect x="7" y="15" width="14" height="4" rx="2" fill="#FAF8F5" opacity="0.85" />
      <rect x="7" y="21" width="14" height="4" rx="2" fill="#FAF8F5" opacity="0.7" />
      <path d="M23.5 12.5a6 6 0 0 1 0 7" stroke="#D9B66E" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M26.5 10a10 10 0 0 1 0 12" stroke="#D9B66E" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 font-display text-[1.35rem] font-semibold tracking-tight text-ink', className)}>
      <LogoMark />
      LinenTag
    </span>
  );
}
