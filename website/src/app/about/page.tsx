import { Eye, HeartHandshake, Leaf, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/motion';
import { PageHeader, Section, SectionHeading } from '@/components/section';
import { FinalCta } from '@/components/sections/home-sections';
import { HoverCard, IconBadge } from '@/components/ui/card';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'About',
  description:
    'LinenTag is building smart linen identification: washable NFC tags that let anyone tap a sheet and know exactly what it is. Learn about our mission and values.',
  path: '/about',
});

const values = [
  { icon: Sparkles, title: 'Radically simple', body: 'If it needs a manual, we have not finished designing it. Every feature should be obvious the first time.' },
  { icon: HeartHandshake, title: 'Made for real homes', body: 'We design for busy families, tired hosts and short-staffed housekeeping teams, not for demos.' },
  { icon: Eye, title: 'Honest technology', body: 'No batteries, no hidden data collection. Tags hold an ID, and your information stays in your account.' },
  { icon: Leaf, title: 'Linen that lasts', body: 'Knowing how bedding is used helps people care for it, replace it less often, and buy better.' },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About LinenTag"
        title="We're giving bedding an identity"
        intro="It started with a simple frustration: standing at the linen closet, unfolding sheet after sheet, trying to find the one that fits."
      />
      <Section labelledBy="story-title">
        <div className="mx-auto max-w-3xl">
          <Reveal className="prose-page">
            <h2 id="story-title">Our story</h2>
            <p>
              Almost every home has the same linen closet problem. Sheets for different beds look identical once folded, sets drift
              apart over time, and the only way to be sure is to unfold everything. Multiply that by a rental property, a hotel or a
              care home, and it becomes hours of lost time and a steady leak of lost linen.
            </p>
            <p>
              Tags woven into fabric have helped big laundries for years, but they needed specialist scanners. Meanwhile, every
              modern phone gained the ability to read NFC. LinenTag puts those two together: a small washable tag sewn into the seam,
              and an app that turns a tap into an answer.
            </p>
            <h2>Our mission</h2>
            <p>
              <strong>Make every piece of linen identify itself.</strong> We want finding the right sheet to take one tap, sets to
              stay together, and linen closets, from family homes to thousand-room hotels, to quietly organize themselves.
            </p>
          </Reveal>
        </div>
      </Section>
      <Section labelledBy="values-title" className="bg-white">
        <SectionHeading id="values-title" eyebrow="What we value" title="How we build" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <HoverCard className="h-full">
                <IconBadge>
                  <Icon />
                </IconBadge>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-body">{body}</p>
              </HoverCard>
            </Reveal>
          ))}
        </div>
      </Section>
      <FinalCta />
    </>
  );
}
