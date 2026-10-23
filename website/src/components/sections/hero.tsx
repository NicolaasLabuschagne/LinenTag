import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { ScanResultScreen } from '@/components/visuals/app-screens';
import { NfcRipple, Phone } from '@/components/visuals/phone';

// The hero animates with CSS (not JS) so the headline is visible as soon as the HTML arrives.
const enter = (delay: number): { className: string; style: CSSProperties } => ({
  className: 'motion-safe:animate-enter',
  style: { animationDelay: `${delay}s` },
});

export function Hero() {
  const e = [0, 0.08, 0.16, 0.24, 0.32].map(enter);
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div className="container-page relative grid items-center gap-16 pt-32 pb-20 sm:pt-40 lg:grid-cols-[1.1fr_1fr] lg:pb-28">
        <div>
          <p
            {...e[0]}
            className={`${e[0].className} mb-6 inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700`}
          >
            <span className="size-2 rounded-full bg-accent-500" /> Washable NFC tags for bedding
          </p>
          <h1 {...e[1]} id="hero-title" className={`${e[1].className} text-[2.75rem] leading-[1.04] font-medium tracking-[-0.025em] sm:text-6xl lg:text-7xl`}>
            Never guess which sheet is <span className="gradient-text">which</span> again
          </h1>
          <p {...e[2]} className={`${e[2].className} mt-6 max-w-xl text-lg leading-relaxed text-body sm:text-xl`}>
            Tap any sheet with your phone and instantly see its size, set, history, and details using LinenTag's washable NFC
            technology.
          </p>
          <div {...e[3]} className={`${e[3].className} mt-9 flex flex-col gap-3 sm:flex-row`}>
            <Button asChild size="lg">
              <Link href="#waitlist">
                Get Early Access <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>
          <ul {...e[4]} className={`${e[4].className} mt-9 flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem] text-muted`}>
            {['Works with iPhone & Android', 'No batteries', 'Washable'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check aria-hidden="true" className="size-4 text-accent-700" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex justify-center motion-safe:animate-enter" style={{ animationDelay: '0.2s' }}>
          {/* Folded sheets the phone is tapping */}
          <div aria-hidden="true" className="absolute bottom-6 left-1/2 hidden w-[22rem] -translate-x-[62%] sm:block">
            <div className="h-14 rounded-2xl bg-white ring-1 ring-line" />
            <div className="-mt-2 ml-3 h-14 rounded-2xl bg-brand-100" />
            <div className="-mt-2 ml-6 h-14 rounded-2xl bg-accent-100" />
          </div>
          <div className="relative motion-safe:animate-float">
            <Phone label="The LinenTag app showing a scanned fitted sheet: King size, cotton, part of the Master Bedroom Set">
              <ScanResultScreen />
            </Phone>
            <NfcRipple className="-bottom-10 -left-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
