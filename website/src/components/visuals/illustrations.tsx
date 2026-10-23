import { cn } from '@/lib/utils';

/** Folded sheets with an NFC button sewn into the hem of the top one. */
export function SewnTagIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" role="img" aria-label="A stack of folded sheets with a small LinenTag NFC button sewn into the hem" className={cn('w-full', className)}>
      <defs>
        <linearGradient id="sheet-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#F1ECE4" />
        </linearGradient>
        <linearGradient id="sheet-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E5EEE7" />
          <stop offset="1" stopColor="#D9E7DD" />
        </linearGradient>
        <linearGradient id="sheet-c" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6EEDD" />
          <stop offset="1" stopColor="#EFE2C6" />
        </linearGradient>
        <radialGradient id="tag" cx="0.35" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#CFAE6C" />
          <stop offset="1" stopColor="#9C7733" />
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="262" rx="150" ry="14" fill="#0f172a" opacity="0.07" />
      <rect x="60" y="190" width="280" height="62" rx="14" fill="url(#sheet-c)" />
      <rect x="60" y="190" width="280" height="10" rx="5" fill="#E3D0A6" opacity="0.6" />
      <rect x="52" y="128" width="296" height="66" rx="14" fill="url(#sheet-b)" />
      <rect x="52" y="128" width="296" height="10" rx="5" fill="#C3D6C8" opacity="0.7" />
      <rect x="44" y="62" width="312" height="70" rx="14" fill="url(#sheet-a)" stroke="#ECE7DF" />
      {/* Hem stitching */}
      <path d="M58 118 H342" stroke="#B8B0A3" strokeWidth="1.5" strokeDasharray="5 5" />
      {/* Sewn-in NFC button */}
      <g transform="translate(296 96)">
        <circle r="17" fill="url(#tag)" />
        <circle r="17" fill="none" stroke="#fff" strokeOpacity="0.5" />
        <circle cx="-5" r="2.4" fill="#FAF8F5" />
        <circle cx="5" r="2.4" fill="#FAF8F5" />
        <path d="M-5 0 L5 0" stroke="#FAF8F5" strokeWidth="1.5" />
      </g>
      <g stroke="#556B5D" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M326 76 a24 24 0 0 1 0 40" opacity="0.8" />
        <path d="M338 66 a38 38 0 0 1 0 60" opacity="0.45" />
      </g>
    </svg>
  );
}
