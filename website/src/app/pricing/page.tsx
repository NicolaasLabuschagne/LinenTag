import { Check } from 'lucide-react';
import Link from 'next/link';
import { Reveal } from '@/components/motion';
import { PageHeader, Section } from '@/components/section';
import { FaqSection } from '@/components/sections/faq';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { pageMetadata } from '@/lib/seo';
import { cn } from '@/lib/utils';

export const metadata = pageMetadata({
  title: 'Pricing',
  description: 'LinenTag pricing for homes, hosts and hospitality is coming soon. Join the waitlist for early-access pricing on NFC tag kits.',
  path: '/pricing',
});

// No prices yet: plans describe what each tier will include.
const plans = [
  {
    name: 'Home',
    for: 'Families and households',
    features: ['NFC tag kits for your existing bedding', 'The LinenTag app for iPhone and Android', 'Sets, rooms and storage places', 'Laundry put-away and wash counts'],
  },
  {
    name: 'Host',
    for: 'Airbnb and vacation rentals',
    featured: true,
    features: ['Everything in Home', 'Multiple properties', 'Shared access for cleaners and co-hosts', 'Turnover-friendly set tracking'],
  },
  {
    name: 'Hospitality',
    for: 'Hotels, care homes and laundries',
    features: ['Everything in Host', 'Volume tag pricing and factory tagging', 'Team roles and reporting', 'Pilot program and onboarding support'],
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Simple pricing, coming soon"
        intro="We're finalizing pricing ahead of launch. Join the waitlist for early-access pricing on tag kits."
      />
      <Section labelledBy="plans-title">
        <h2 id="plans-title" className="sr-only">
          Plans
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08}>
              <Card className={cn('relative flex h-full flex-col p-8', plan.featured && 'border-2 border-brand-600 shadow-xl shadow-brand-600/10')}>
                {plan.featured && (
                  <span className="absolute -top-3 left-8 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">Popular with hosts</span>
                )}
                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-muted">{plan.for}</p>
                <p className="mt-6 text-3xl font-semibold text-ink">Coming soon</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-3 text-body">
                      <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent-700" /> {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant={plan.featured ? 'default' : 'secondary'} className="mt-8">
                  <Link href="/#waitlist">Get early access</Link>
                </Button>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>
      <FaqSection />
    </>
  );
}
