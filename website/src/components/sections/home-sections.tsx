import { CheckCircle2, Quote, XCircle } from 'lucide-react';
import Link from 'next/link';
import { RevealGroup, RevealItem, Reveal } from '@/components/motion';
import { Section, SectionHeading } from '@/components/section';
import { Button } from '@/components/ui/button';
import { HoverCard, IconBadge } from '@/components/ui/card';
import { DashboardScreen, InventoryScreen, LaundryScreen } from '@/components/visuals/app-screens';
import { SewnTagIllustration } from '@/components/visuals/illustrations';
import { Phone } from '@/components/visuals/phone';
import {
  SHOW_TESTIMONIALS,
  audiences,
  benefits,
  features,
  problems,
  productDetails,
  steps,
  testimonials,
  type IconItem,
} from '@/lib/content/marketing';

function IconGrid({ items, columns = 3, tone }: { items: IconItem[]; columns?: 2 | 3; tone?: 'brand' | 'accent' }) {
  return (
    <RevealGroup className={columns === 3 ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3' : 'grid gap-5 sm:grid-cols-2'}>
      {items.map(({ icon: Icon, title, body }) => (
        <RevealItem key={title}>
          <HoverCard className="h-full">
            <IconBadge tone={tone}>
              <Icon />
            </IconBadge>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-2 leading-relaxed text-body">{body}</p>
          </HoverCard>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

export function HowItWorksSection({ headingAs = 'h2' }: { headingAs?: 'h1' | 'h2' }) {
  return (
    <Section id="how-it-works" labelledBy="how-title">
      <SectionHeading
        id="how-title"
        as={headingAs}
        eyebrow="How it works"
        title="Three steps to a closet that sorts itself"
        intro="No batteries, no hubs, no new habits. Just the phone already in your pocket."
      />
      <RevealGroup className="relative grid gap-5 md:grid-cols-3">
        <div aria-hidden="true" className="absolute top-12 right-[16%] left-[16%] hidden h-px bg-line md:block" />
        {steps.map(({ icon: Icon, title, body }, i) => (
          <RevealItem key={title} className="relative">
            <HoverCard className="h-full text-center">
              <div className="relative mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-brand-600 text-white [&_svg]:size-7">
                <Icon aria-hidden="true" />
                <span className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-accent-500 text-sm font-bold text-ink">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-xl font-semibold">
                <span className="sr-only">Step {i + 1}: </span>
                {title}
              </h3>
              <p className="mt-3 leading-relaxed text-body">{body}</p>
            </HoverCard>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}

export function FeaturesSection() {
  return (
    <Section id="features" labelledBy="features-title" className="bg-white">
      <SectionHeading
        id="features-title"
        eyebrow="Features"
        title="Everything your linen closet has been missing"
        intro="LinenTag gives every sheet, pillowcase and duvet cover an identity, and turns that into effortless organization."
      />
      <IconGrid items={features} />
    </Section>
  );
}

export function ProblemSection() {
  return (
    <Section id="problem" labelledBy="problem-title">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading
            id="problem-title"
            align="left"
            eyebrow="The problem"
            title="Folded sheets all look the same"
            intro="Bedding was never designed to be identified. The size label is hidden in a corner, sets drift apart, and every wrong guess means unfolding, refolding, and trying again."
          />
        </div>
        <RevealGroup className="space-y-3">
          {problems.map((p) => (
            <RevealItem key={p.title}>
              <div className="flex gap-4 rounded-2xl border border-line bg-white p-5">
                <XCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-rose-500" />
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="mt-1 text-body">{p.body}</p>
                </div>
              </div>
            </RevealItem>
          ))}
          <RevealItem>
            <div className="flex gap-4 rounded-2xl bg-brand-600 p-5 text-white">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <div>
                <h3 className="font-semibold text-white">LinenTag: tap it and know</h3>
                <p className="mt-1 text-brand-50">
                  A tag sewn into the seam lets your phone identify any piece through the fabric, and shows every other piece in its set.
                </p>
              </div>
            </div>
          </RevealItem>
        </RevealGroup>
      </div>
    </Section>
  );
}

export function AudiencesSection() {
  return (
    <Section id="who-its-for" labelledBy="audiences-title" className="bg-white">
      <SectionHeading
        id="audiences-title"
        eyebrow="Who it's for"
        title="From one linen closet to a thousand rooms"
        intro="The same tap that finds the guest-room sheets at home helps hosts, hotels and care teams keep every set in the right place."
      />
      <IconGrid items={audiences} tone="accent" />
    </Section>
  );
}

export function ProductDetailsSection() {
  return (
    <Section id="product" labelledBy="product-title">
      <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="rounded-[2rem] border border-line bg-white p-8">
            <SewnTagIllustration />
          </div>
        </Reveal>
        <div>
          <SectionHeading
            id="product-title"
            align="left"
            eyebrow="The tag"
            title="A tiny capsule, built for real life"
            intro="Small enough to sew into a hem, tough enough for the laundry, and readable by the phone you already own."
          />
          <IconGrid items={productDetails} columns={2} />
        </div>
      </div>
    </Section>
  );
}

export function ShowcaseSection() {
  const screens = [
    { label: 'Home dashboard with item and set counts and recently scanned items', title: 'Dashboard', body: 'Your whole inventory at a glance, with one button for putting laundry away.', screen: <DashboardScreen /> },
    { label: 'Sets organised by room, each with coloured set markers', title: 'Inventory by room', body: 'Pick a room, then a set. Search across everything in a second.', screen: <InventoryScreen /> },
    { label: 'Put away laundry screen showing a completed set and a set with missing pieces', title: 'Laundry tracking', body: 'Tap pieces as you fold. See what is complete, what is missing, and where it goes.', screen: <LaundryScreen /> },
  ];
  return (
    <Section id="showcase" labelledBy="showcase-title" className="overflow-hidden bg-white">
      <SectionHeading
        id="showcase-title"
        eyebrow="The app"
        title="Designed to feel effortless"
        intro="Big buttons, clear answers, and features that only appear when you need them."
      />
      <RevealGroup className="grid gap-12 md:grid-cols-3">
        {screens.map((s) => (
          <RevealItem key={s.title} className="text-center">
            <div className="transition-transform duration-500 hover:-translate-y-2">
              <Phone label={s.label} className="w-[240px] sm:w-[250px]">
                {s.screen}
              </Phone>
            </div>
            <h3 className="mt-8 text-xl font-semibold">{s.title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-body">{s.body}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}

export function TestimonialsSection() {
  if (!SHOW_TESTIMONIALS) return null;
  return (
    <Section id="testimonials" labelledBy="testimonials-title">
      <SectionHeading id="testimonials-title" eyebrow="Early feedback" title="Made for the people who make the beds" />
      <RevealGroup className="grid gap-5 md:grid-cols-3">
        {testimonials.map((t) => (
          <RevealItem key={t.role}>
            <figure className="flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-7">
              <Quote aria-hidden="true" className="size-7 text-accent-500" />
              <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-ink">“{t.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-muted">{t.role}</span>
                {/* Remove once these are replaced with real customer quotes. */}
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-muted">Example</span>
              </figcaption>
            </figure>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}

export function BenefitsSection() {
  return (
    <Section id="benefits" labelledBy="benefits-title" className="bg-white">
      <SectionHeading id="benefits-title" eyebrow="Benefits" title="Less searching. More sleeping." />
      <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map(({ icon: Icon, title, body }) => (
          <RevealItem key={title}>
            <div className="h-full rounded-[var(--radius-card)] bg-brand-600 p-6 text-white transition-transform duration-300 hover:-translate-y-1">
              <Icon aria-hidden="true" className="size-7 text-brand-100" />
              <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-2 leading-relaxed text-brand-50">{body}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}

export function FinalCta() {
  return (
    <Section labelledBy="cta-title" className="pt-0">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-600 px-8 py-16 text-center sm:px-16">
          <h2 id="cta-title" className="relative text-3xl font-medium text-white sm:text-5xl">
            Tap any sheet. Know exactly what it is.
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-lg text-brand-50">
            Join the waitlist for early access to LinenTag tags and the app.
          </p>
          <Button asChild size="lg" variant="accent" className="relative mt-9">
            <Link href="/#waitlist">Get Early Access</Link>
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}
